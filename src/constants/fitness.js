// ─── FitBuddy 2.0 — Fitness Constants & Business Logic ─────────────────────

// ── XP & Levelling System ───────────────────────────────────────────────────
export const XP_PER_WORKOUT      = 50;
export const XP_PER_STREAK_DAY   = 10;
export const XP_ALL_SETS_BONUS   = 20;
export const XP_PERSONAL_RECORD  = 30;

export const XP_LEVELS = [0, 200, 500, 1000, 2000, 4000, 7500, 12000, 20000, 35000];

export const LEVEL_TITLES = [
  'Rookie', 'Trainee', 'Athlete', 'Warrior',
  'Champion', 'Elite', 'Master', 'Legend', 'Titan', 'Immortal',
];

export const LEVEL_EMOJIS = ['🌱', '💪', '🏋️', '⚔️', '🏆', '⚡', '🔮', '🦁', '🌋', '🔱'];

export const getLevel = (xp = 0) => {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i]) return i + 1;
  }
  return 1;
};

export const getLevelTitle = (xp = 0) => {
  const level = getLevel(xp);
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
};

export const getLevelEmoji = (xp = 0) => {
  const level = getLevel(xp);
  return LEVEL_EMOJIS[Math.min(level - 1, LEVEL_EMOJIS.length - 1)];
};

export const getXPProgress = (xp = 0) => {
  const level = getLevel(xp);
  const currentLevelXP = XP_LEVELS[Math.min(level - 1, XP_LEVELS.length - 1)];
  const nextLevelXP    = XP_LEVELS[Math.min(level, XP_LEVELS.length - 1)];
  if (currentLevelXP === nextLevelXP) return 100; // Max level
  return Math.round(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);
};

export const getXPToNextLevel = (xp = 0) => {
  const level = getLevel(xp);
  const nextLevelXP = XP_LEVELS[Math.min(level, XP_LEVELS.length - 1)];
  return Math.max(0, nextLevelXP - xp);
};

// ── Streak System ───────────────────────────────────────────────────────────
export const STREAK_MILESTONES = [3, 7, 14, 21, 30, 60, 90, 100, 365];

export const getStreakStatus = (streak = 0) => {
  if (!streak || streak === 0) return { emoji: '💤', label: 'Start your streak!', color: 'var(--text-muted)' };
  if (streak < 3)  return { emoji: '🔥', label: `${streak} day streak — igniting!`,     color: '#FF8C00' };
  if (streak < 7)  return { emoji: '🔥', label: `${streak} days — building a habit!`,  color: 'var(--coral)' };
  if (streak < 14) return { emoji: '⚡', label: `${streak} days — momentum!`,           color: 'var(--gold)' };
  if (streak < 30) return { emoji: '💪', label: `${streak} days — unstoppable!`,        color: 'var(--teal)' };
  if (streak < 90) return { emoji: '🏆', label: `${streak} days — elite status!`,       color: 'var(--violet)' };
  return               { emoji: '🔱', label: `${streak} days — IMMORTAL!`,              color: '#FFD700' };
};

// ── Goal Parameters ─────────────────────────────────────────────────────────
export const GOALS = {
  fat_loss: {
    label: 'Fat Loss',
    emoji: '🔥',
    color: 'var(--coral)',
    description: 'Burn fat while preserving muscle',
    sets: 3, repsMin: 15, repsMax: 20, rest: 45,
    splitThreshold: 4,   // >4 days/week → push-pull split
    caloricMultiplier: 0.82,
    activityMultiplier: 1.55,
  },
  muscle_gain: {
    label: 'Muscle Gain',
    emoji: '💪',
    color: 'var(--teal)',
    description: 'Build lean muscle mass',
    sets: 4, repsMin: 8, repsMax: 12, rest: 90,
    splitThreshold: 3,
    caloricMultiplier: 1.15,
    activityMultiplier: 1.55,
  },
  strength: {
    label: 'Strength',
    emoji: '⚡',
    color: 'var(--violet)',
    description: 'Maximise raw strength',
    sets: 5, repsMin: 3, repsMax: 6, rest: 180,
    splitThreshold: 3,
    caloricMultiplier: 1.10,
    activityMultiplier: 1.725,
  },
  general: {
    label: 'General Fitness',
    emoji: '🌱',
    color: 'var(--green)',
    description: 'Balanced health & fitness',
    sets: 3, repsMin: 12, repsMax: 15, rest: 60,
    splitThreshold: 4,
    caloricMultiplier: 1.0,
    activityMultiplier: 1.375,
  },
};

// ── Fitness Levels ──────────────────────────────────────────────────────────
export const FITNESS_LEVELS = {
  beginner:     { label: 'Beginner',     emoji: '🌱', setsBonus: 0, repsBonus: 0 },
  intermediate: { label: 'Intermediate', emoji: '💪', setsBonus: 1, repsBonus: 2 },
  advanced:     { label: 'Advanced',     emoji: '⚡', setsBonus: 2, repsBonus: 4 },
};

// ── Progressive Overload Engine ─────────────────────────────────────────────
export const WEEKLY_PROGRESSION = {
  1: { volumeMultiplier: 1.0,  note: 'Foundation week — learn the movements.' },
  2: { volumeMultiplier: 1.05, note: '+5% volume — adding intensity.' },
  3: { volumeMultiplier: 1.10, note: '+10% volume — pushing harder.' },
  4: { volumeMultiplier: 0.85, note: 'Deload week — your body grows during rest.' },
  5: { volumeMultiplier: 1.15, note: '+15% volume — new peak.' },
  6: { volumeMultiplier: 1.20, note: '+20% — testing your limits.' },
  7: { volumeMultiplier: 0.90, note: 'Mini-deload — recovery for the final push.' },
  8: { volumeMultiplier: 1.25, note: 'Peak week — give everything you have!' },
};

export const TOTAL_PROGRAM_WEEKS = 8;

// ── BMI Logic ───────────────────────────────────────────────────────────────
export const getBMICategory = (bmi) => {
  if (!bmi) return null;
  if (bmi < 18.5) return { label: 'Underweight', color: 'var(--teal)',   advice: 'Focus on calorie surplus and muscle gain.', recommendedGoal: 'muscle_gain' };
  if (bmi < 25.0) return { label: 'Healthy',     color: 'var(--green)',  advice: 'Maintain and build lean muscle.',           recommendedGoal: 'general' };
  if (bmi < 30.0) return { label: 'Overweight',  color: 'var(--gold)',   advice: 'Prioritise fat loss with a calorie deficit.', recommendedGoal: 'fat_loss' };
  return                 { label: 'Obese',        color: 'var(--coral)',  advice: 'Start low-impact exercise. Consult a doctor.', recommendedGoal: 'fat_loss' };
};

// ── Day Names ───────────────────────────────────────────────────────────────
export const DAY_NAMES_FULL  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Nutrition Tips by Goal ──────────────────────────────────────────────────
export const NUTRITION_TIPS = {
  fat_loss: [
    { icon: '🔥', tip: 'Maintain a 300–500 kcal daily deficit for sustainable fat loss.' },
    { icon: '🥩', tip: 'Aim for 1.6–2g of protein per kg bodyweight to preserve muscle.' },
    { icon: '🚫', tip: 'Limit ultra-processed foods and liquid calories.' },
    { icon: '💧', tip: 'Drinking water before meals reduces hunger by 13–22%.' },
    { icon: '🥦', tip: 'Fill half your plate with veggies — high volume, low calories.' },
  ],
  muscle_gain: [
    { icon: '🍗', tip: 'Eat 1.6–2.2g of protein per kg bodyweight to maximise growth.' },
    { icon: '🍚', tip: 'Carbs before workouts fuel training and spare muscle for growth.' },
    { icon: '🥛', tip: 'A protein shake within 30 min post-workout can speed recovery.' },
    { icon: '😴', tip: 'Muscle is built during sleep — prioritise 7–9 hours every night.' },
    { icon: '🍌', tip: 'A caloric surplus of 250–500 kcal is ideal for lean gains.' },
  ],
  strength: [
    { icon: '🔋', tip: 'Eat complex carbs 2 hours before heavy lifting for peak performance.' },
    { icon: '🍳', tip: 'Quality protein (eggs, beef, fish) repairs the muscle fibres you break.' },
    { icon: '🦴', tip: 'Calcium and vitamin D support the bones that handle heavy loads.' },
    { icon: '💊', tip: 'Creatine monohydrate is the most evidence-backed strength supplement.' },
    { icon: '☕', tip: 'Caffeine 45 min before training improves strength output by 3–5%.' },
  ],
  general: [
    { icon: '🥗', tip: 'Balanced meals with protein, fibre, and healthy fats are the goal.' },
    { icon: '💧', tip: 'Drink 2–3 litres of water daily — more if sweating heavily.' },
    { icon: '🍏', tip: 'Aim for 5 servings of fruits and vegetables every day.' },
    { icon: '🍽️', tip: 'Eat slowly and mindfully — it takes 20 min for fullness to register.' },
    { icon: '🌙', tip: 'Consistent sleep patterns are the most underrated fitness tool.' },
  ],
};
