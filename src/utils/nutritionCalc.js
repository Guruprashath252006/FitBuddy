export const calcBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm) return null;
  const h = heightCm / 100;
  return parseFloat((weightKg / (h * h)).toFixed(1));
};

export const calcBMR = (weightKg, heightCm, age, gender) => {
  if (!weightKg || !heightCm || !age) return null;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'female' ? base - 161 : base + 5);
};

export const calcTDEE = (bmr, activityMultiplier = 1.55) =>
  bmr ? Math.round(bmr * activityMultiplier) : null;

export const calcMacros = (tdee, goal, weightKg) => {
  if (!tdee || !weightKg) return null;
  const targets = {
    fat_loss:    Math.round(tdee * 0.82),
    muscle_gain: Math.round(tdee * 1.15),
    strength:    Math.round(tdee * 1.10),
    general:     tdee,
  };
  const calories = targets[goal] || tdee;
  const proteinG = Math.round(goal === 'strength' ? weightKg * 2.2 : weightKg * 1.8);
  const fatG     = Math.round((calories * 0.25) / 9);
  const carbG    = Math.round((calories - proteinG * 4 - fatG * 9) / 4);
  return {
    calories,
    protein: { g: proteinG, kcal: proteinG * 4 },
    fat:     { g: fatG,     kcal: fatG * 9 },
    carbs:   { g: Math.max(0, carbG), kcal: Math.max(0, carbG) * 4 },
  };
};
