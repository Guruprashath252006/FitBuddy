import { EXERCISES, EQUIPMENT } from '../constants/exercises.js';
import { GOALS, FITNESS_LEVELS, WEEKLY_PROGRESSION, TOTAL_PROGRAM_WEEKS } from '../constants/fitness.js';

// ─── Muscle group split definitions ─────────────────────────────────────────
const SPLITS = {
  full_body: [
    { name: 'Full Body A', categories: ['Chest', 'Back', 'Legs', 'Core'] },
    { name: 'Full Body B', categories: ['Shoulders', 'Arms', 'Glutes', 'Core'] },
    { name: 'Full Body C', categories: ['Chest', 'Legs', 'Back', 'Cardio'] },
  ],
  push_pull: [
    { name: 'Push Day',  categories: ['Chest', 'Shoulders', 'Arms'] },
    { name: 'Pull Day',  categories: ['Back', 'Arms', 'Core'] },
    { name: 'Leg Day',   categories: ['Legs', 'Glutes', 'Core'] },
    { name: 'Push Day B', categories: ['Chest', 'Shoulders', 'Core'] },
    { name: 'Pull Day B', categories: ['Back', 'Arms', 'Cardio'] },
    { name: 'Leg Day B',  categories: ['Legs', 'Glutes', 'Full Body'] },
  ],
  upper_lower: [
    { name: 'Upper Body', categories: ['Chest', 'Back', 'Shoulders', 'Arms'] },
    { name: 'Lower Body', categories: ['Legs', 'Glutes', 'Core'] },
    { name: 'Upper Body B', categories: ['Back', 'Chest', 'Arms', 'Core'] },
    { name: 'Lower Body B', categories: ['Legs', 'Glutes', 'Cardio'] },
  ],
};

const pickSplit = (daysPerWeek) => {
  if (daysPerWeek <= 3) return 'full_body';
  if (daysPerWeek <= 5) return 'upper_lower';
  return 'push_pull';
};

const getEquipmentList = (equipmentKeys = []) => {
  return [EQUIPMENT.BODYWEIGHT, ...equipmentKeys];
};

const pickExercises = (categories, equipmentList, difficulty, count = 5) => {
  const pool = EXERCISES.filter(ex =>
    categories.includes(ex.category) &&
    equipmentList.includes(ex.equipment)
  );
  // Prefer matching difficulty, then easier, then harder
  const preferred   = pool.filter(e => e.difficulty === difficulty);
  const easier      = pool.filter(e => e.difficulty === 'beginner' && difficulty !== 'beginner');
  const harder      = pool.filter(e => e.difficulty === 'advanced' && difficulty !== 'advanced');
  const sorted = [...preferred, ...easier, ...harder];
  // Shuffle
  const shuffled = sorted.sort(() => Math.random() - 0.5);
  // Deduplicate by category — try to get variety
  const picked = [];
  const usedCats = new Set();
  for (const ex of shuffled) {
    if (picked.length >= count) break;
    if (!usedCats.has(ex.category) || picked.length < count) {
      picked.push(ex);
      usedCats.add(ex.category);
    }
  }
  return picked.slice(0, count);
};

const applyProgression = (exercise, goalParams, week, fitnessBonus) => {
  const prog = WEEKLY_PROGRESSION[week] || WEEKLY_PROGRESSION[1];
  const rawSets = goalParams.sets + fitnessBonus;
  const sets    = Math.max(2, Math.round(rawSets * prog.volumeMultiplier));
  const reps    = `${goalParams.repsMin + fitnessBonus}–${goalParams.repsMax + fitnessBonus * 2}`;
  return {
    ...exercise,
    sets,
    reps,
    rest:     goalParams.rest,
    weekNote: week > 1 ? prog.note : null,
  };
};

export const generateWorkoutPlan = (user, weekNumber = 1) => {
  const goal        = GOALS[user.goal] || GOALS.general;
  const level       = FITNESS_LEVELS[user.fitness_level] || FITNESS_LEVELS.beginner;
  const splitType   = pickSplit(user.days_available?.length || 3);
  const split       = SPLITS[splitType];
  const equipList   = getEquipmentList(user.equipment || []);
  const fitnessBonus = level.setsBonus;

  const schedule = {};
  const days = user.days_available?.length ? [...user.days_available].slice(0, 6) : [1, 3, 5];

  days.forEach((dayIndex, i) => {
    const dayTemplate = split[i % split.length];
    const exercises   = pickExercises(
      dayTemplate.categories,
      equipList,
      user.fitness_level || 'beginner',
      goal.splitThreshold >= days.length ? 6 : 5
    ).map(ex => applyProgression(ex, goal, Math.min(weekNumber, TOTAL_PROGRAM_WEEKS), fitnessBonus));

    schedule[dayIndex] = {
      name:       dayTemplate.name,
      day:        dayIndex,
      exercises,
      estimatedMinutes: exercises.reduce((acc, ex) => acc + ex.sets * 3, 0) + 5,
    };
  });

  return {
    weekNumber: Math.min(weekNumber, TOTAL_PROGRAM_WEEKS),
    splitType,
    schedule,
    generatedAt: new Date().toISOString(),
  };
};
