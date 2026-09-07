import React from 'react';
import { calculateMacros } from '../utils/nutritionCalculator';

const MacroCard = ({ tdee, goal, weightKg }) => {
    if (!tdee || !goal || !weightKg) return null;
    const macros = calculateMacros(tdee, goal, weightKg);

    const items = [
        { label: 'Calories', value: macros.calories, unit: 'kcal', color: '#8a5cff' },
        { label: 'Protein',  value: macros.protein.grams, unit: 'g', color: '#00ffd1' },
        { label: 'Carbs',    value: macros.carbs.grams,   unit: 'g', color: '#ff9500' },
        { label: 'Fat',      value: macros.fat.grams,     unit: 'g', color: '#ff5c7a'  }
    ];

    const goalLabels = {
        fat_loss: '🔥 Fat Loss',
        muscle_gain: '💪 Muscle Gain',
        strength: '⚡ Strength',
        general: '🎯 General Fitness'
    };

    return (
        <div className="glass-3d" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, color: 'white', fontSize: '1rem' }}>Daily Targets</h4>
                <span style={{
                    fontSize: '0.75rem', padding: '4px 10px',
                    background: 'rgba(138,92,255,0.15)',
                    borderRadius: '20px', color: 'var(--color-primary)',
                    border: '1px solid rgba(138,92,255,0.3)'
                }}>
                    {goalLabels[goal] || goal}
                </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {items.map(item => (
                    <div key={item.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: item.color }}>
                            {item.value}
                        </div>
                        <div style={{ fontSize: '0.6rem', opacity: 0.5, marginTop: '2px', textTransform: 'uppercase' }}>
                            {item.unit}
                        </div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '2px' }}>
                            {item.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MacroCard;
