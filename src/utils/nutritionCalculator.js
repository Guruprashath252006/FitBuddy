export const calculateBMI = (weightKg, heightCm) => {
    if (!weightKg || !heightCm) return null;
    const h = heightCm / 100;
    return parseFloat((weightKg / (h * h)).toFixed(1));
};

export const calculateBMR = (weightKg, heightCm, age, gender) => {
    // Mifflin-St Jeor Equation
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return gender === 'male' ? base + 5 : base - 161;
};

export const calculateTDEE = (bmr, activityLevel = 'moderate') => {
    const multipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
    };
    return Math.round(bmr * (multipliers[activityLevel] || 1.55));
};

export const getCaloricTarget = (tdee, goal) => ({
    fat_loss:    Math.round(tdee * 0.80),
    muscle_gain: Math.round(tdee * 1.15),
    strength:    Math.round(tdee * 1.10),
    general:     tdee
}[goal] || tdee);

export const calculateMacros = (tdee, goal, weightKg) => {
    const caloricTarget = getCaloricTarget(tdee, goal);
    const proteinG = Math.round(goal === 'strength' ? weightKg * 2.2 : weightKg * 1.8);
    const proteinCal = proteinG * 4;
    const fatCal = Math.round(caloricTarget * 0.25);
    const fatG = Math.round(fatCal / 9);
    const carbCal = Math.max(0, caloricTarget - proteinCal - fatCal);
    const carbG = Math.round(carbCal / 4);
    return {
        calories: caloricTarget,
        protein: { grams: proteinG, calories: proteinCal },
        carbs:   { grams: carbG,    calories: carbCal },
        fat:     { grams: fatG,     calories: fatCal }
    };
};
