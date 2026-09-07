export const ACHIEVEMENTS = [
  { id: 'first_workout',   emoji: '👟', name: 'First Step',      desc: 'Completed your very first workout.',     condition: (h)        => h.length >= 1 },
  { id: 'streak_3',        emoji: '🔥', name: 'On Fire',         desc: '3-day workout streak.',                  condition: (h, u)     => (u?.streak || 0) >= 3 },
  { id: 'streak_7',        emoji: '⚡', name: 'Week Warrior',    desc: '7-day streak — a full week!',            condition: (h, u)     => (u?.streak || 0) >= 7 },
  { id: 'streak_30',       emoji: '🦾', name: 'Iron Will',       desc: '30-day streak — incredible!',            condition: (h, u)     => (u?.streak || 0) >= 30 },
  { id: 'streak_100',      emoji: '💎', name: 'Diamond',         desc: '100-day streak — legendary!',            condition: (h, u)     => (u?.streak || 0) >= 100 },
  { id: 'workouts_5',      emoji: '✅', name: 'Getting Started', desc: 'Completed 5 workouts.',                  condition: (h)        => h.length >= 5 },
  { id: 'workouts_25',     emoji: '💪', name: 'Committed',       desc: 'Completed 25 workouts.',                 condition: (h)        => h.length >= 25 },
  { id: 'workouts_50',     emoji: '🏅', name: 'Half Century',    desc: 'Completed 50 workouts.',                 condition: (h)        => h.length >= 50 },
  { id: 'workouts_100',    emoji: '🏆', name: 'Centurion',       desc: 'Completed 100 workouts!',                condition: (h)        => h.length >= 100 },
  { id: 'early_bird',      emoji: '🌅', name: 'Early Bird',      desc: 'Completed a workout before 7am.',        condition: (h)        => h.some(s => new Date(s.date).getHours() < 7) },
  { id: 'night_owl',       emoji: '🦉', name: 'Night Owl',       desc: 'Completed a workout after 10pm.',        condition: (h)        => h.some(s => new Date(s.date).getHours() >= 22) },
  { id: 'speed_demon',     emoji: '💨', name: 'Speed Demon',     desc: 'Finished a workout in under 20 minutes.', condition: (h)       => h.some(s => s.durationSeconds < 1200) },
  { id: 'level_5',         emoji: '🌟', name: 'Rising Star',     desc: 'Reached level 5.',                       condition: (h, u, l)  => l >= 5 },
  { id: 'perfect_sets',    emoji: '🎯', name: 'Perfectionist',   desc: 'Completed all sets in a workout.',        condition: (h)        => h.some(s => s.allSetsCompleted) },
  { id: 'weekend_warrior', emoji: '🏋️', name: 'Weekend Warrior', desc: 'Trained on both Saturday and Sunday.',    condition: (h)        => {
      const days = new Set(h.map(s => new Date(s.date).getDay()));
      return days.has(0) && days.has(6);
    }
  },
];

export const getUnlocked = (history, user, level) =>
  ACHIEVEMENTS.filter(a => a.condition(history, user, level));

export const getNewlyUnlocked = (prevHistory, newHistory, user, level) => {
  const before = new Set(getUnlocked(prevHistory, user, level).map(a => a.id));
  return getUnlocked(newHistory, user, level).filter(a => !before.has(a.id));
};
