import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generateWorkoutPlan } from '../utils/workoutGenerator';
import { storage } from '../utils/storage';
import { calcMacros } from '../utils/nutritionCalc';
import {
  getBMICategory, getStreakStatus, getLevelTitle, getLevelEmoji,
  getXPProgress, getXPToNextLevel, getLevel, GOALS, NUTRITION_TIPS,
  DAY_NAMES_SHORT, TOTAL_PROGRAM_WEEKS
} from '../constants/fitness';
import { Play, Edit2, Save, X, TrendingUp, Utensils, Zap, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Animated number counter
const AnimatedStat = ({ value, suffix = '' }) => (
  <motion.span
    key={value}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    style={{ display: 'inline-block' }}
  >
    {value}{suffix}
  </motion.span>
);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: i => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.08, ease: 'easeOut' } }),
};

const Dashboard = () => {
  const { user, saveUser, regeneratePlan } = useApp();
  const navigate = useNavigate();

  const [plan,         setPlan]       = useState(null);
  const [todaySession, setToday]      = useState(null);
  const [isEditing,    setEditing]    = useState(false);
  const [editData,     setEditData]   = useState(null);

  // Load / generate plan
  useEffect(() => {
    if (!user) return;
    const key  = `plan_${user.id}`;
    let saved  = storage.get(key);

    if (!saved) {
      saved = generateWorkoutPlan(user, 1);
      storage.set(key, saved);
    } else {
      // Auto-advance week
      const weeksSince = Math.floor(
        (Date.now() - new Date(saved.generatedAt).getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      const targetWeek = Math.min((saved.weekNumber || 1) + weeksSince, TOTAL_PROGRAM_WEEKS);
      if (targetWeek > (saved.weekNumber || 1)) {
        saved = generateWorkoutPlan(user, targetWeek);
        storage.set(key, saved);
      }
    }
    setPlan(saved);
  }, [user?.id]);

  useEffect(() => {
    if (plan) setToday(plan.schedule[new Date().getDay()] || null);
  }, [plan]);

  useEffect(() => {
    if (isEditing && user) setEditData({ ...user });
  }, [isEditing]);

  const handleSave = (e) => {
    e.preventDefault();
    saveUser(editData);
    const newPlan = generateWorkoutPlan(editData, plan?.weekNumber || 1);
    storage.set(`plan_${editData.id || user.id}`, newPlan);
    setPlan(newPlan);
    setEditing(false);
  };

  if (!plan || !user) return null;

  const bmiCat      = getBMICategory(user.bmi);
  const streakInfo  = getStreakStatus(user.streak);
  const level       = getLevel(user.xp || 0);
  const levelTitle  = getLevelTitle(user.xp || 0);
  const levelEmoji  = getLevelEmoji(user.xp || 0);
  const xpProgress  = getXPProgress(user.xp || 0);
  const xpToNext    = getXPToNextLevel(user.xp || 0);
  const goalInfo    = GOALS[user.goal] || GOALS.general;
  const tips        = NUTRITION_TIPS[user.goal] || NUTRITION_TIPS.general;
  const macros      = user.tdee && user.weight ? calcMacros(user.tdee, user.goal, user.weight) : null;
  const currentWeek = plan.weekNumber || 1;

  const estMins = todaySession
    ? todaySession.exercises.reduce((a, e) => a + e.sets * 3, 0) + 5
    : 0;

  return (
    <div className="page-container">
      {/* HEADER */}
      <motion.header custom={0} variants={fadeUp} initial="hidden" animate="visible" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},
            </p>
            <h1 style={{ fontSize: '2rem', letterSpacing: '-0.02em' }}>{user.name} 👋</h1>
          </div>

          {/* Streak badge */}
          {user.streak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.4 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 16px', borderRadius: 'var(--r-full)',
                background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.3)',
                color: 'var(--coral)', fontWeight: 800, fontFamily: 'var(--font-mono)',
              }}
            >
              <span className="anim-fire" style={{ fontSize: '1.2rem' }}>🔥</span>
              {user.streak}
            </motion.div>
          )}
        </div>

        {/* XP + Level bar */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" style={{ marginTop: '16px', padding: '14px 18px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="level-badge">
            <span>{levelEmoji}</span>
            <span>Lv.{level}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{levelTitle}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{xpToNext} XP to next</span>
            </div>
            <div className="xp-bar">
              <motion.div
                className="xp-bar__fill"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>
      </motion.header>

      {/* TODAY'S WORKOUT HERO */}
      <motion.section custom={2} variants={fadeUp} initial="hidden" animate="visible" style={{ marginBottom: '28px' }}>
        {todaySession ? (
          <motion.div
            whileHover={{ y: -3 }}
            style={{
              padding: '28px 24px', borderRadius: 'var(--r-xl)', textAlign: 'center',
              background: 'linear-gradient(145deg, rgba(0,217,255,0.08) 0%, rgba(0,0,0,0) 100%)',
              border: '1px solid rgba(0,217,255,0.25)',
              boxShadow: '0 8px 40px rgba(0,217,255,0.1)',
            }}
          >
            <div className="badge badge--teal" style={{ marginBottom: '16px' }}>
              🚀 TODAY · WEEK {currentWeek}/{TOTAL_PROGRAM_WEEKS}
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px', letterSpacing: '-0.02em' }}>{todaySession.name}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
              {todaySession.exercises.length} exercises · ~{estMins} min
            </p>
            {todaySession.exercises[0]?.weekNote && (
              <p style={{ fontSize: '0.82rem', color: 'var(--teal)', padding: '8px 14px', background: 'rgba(0,217,255,0.08)', borderRadius: 'var(--r-md)', marginBottom: '20px', display: 'inline-block' }}>
                ⚡ {todaySession.exercises[0].weekNote}
              </p>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary btn-full"
              onClick={() => navigate('/workout')}
              style={{ fontSize: '1.05rem', padding: '16px' }}
            >
              <Play size={20} fill="currentColor" /> START WORKOUT
            </motion.button>
          </motion.div>
        ) : (
          <motion.div whileHover={{ y: -2 }} style={{ padding: '32px 24px', borderRadius: 'var(--r-xl)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '12px', animation: 'float 3s ease-in-out infinite' }}>🧘</div>
            <h2 style={{ marginBottom: '8px' }}>Rest & Recover</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Today is your scheduled recovery day. Your muscles grow during rest.</p>
            <div style={{ textAlign: 'left', background: 'rgba(0,217,255,0.04)', padding: '16px', borderRadius: 'var(--r-md)', border: '1px dashed rgba(0,217,255,0.15)' }}>
              {['Take a 20-min walk', 'Do light stretching', 'Drink 2–3L of water', 'Sleep 7–9 hours tonight'].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '6px 0', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--teal)', fontWeight: 'bold' }}>✓</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{t}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.section>

      {/* QUICK STATS */}
      <motion.section custom={3} variants={fadeUp} initial="hidden" animate="visible" style={{ marginBottom: '28px' }}>
        <div className="section-header">
          <h3>Your Stats</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setEditing(true)}
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--teal)', padding: '8px 14px', borderRadius: 'var(--r-full)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Edit2 size={13} /> Edit
          </motion.button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
          {[
            { label: 'Weight', value: user.weight, suffix: ' kg', color: 'var(--teal)' },
            { label: 'BMI', value: user.bmi, suffix: '', color: bmiCat?.color || 'var(--text-primary)' },
            { label: 'Calories', value: user.tdee, suffix: '', color: 'var(--coral)' },
          ].map(({ label, value, suffix, color }) => (
            <motion.div key={label} whileHover={{ y: -3 }} className="glass stat-card">
              <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{label}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700, color, lineHeight: 1, letterSpacing: '-0.02em' }}>
                <AnimatedStat value={value || '—'} suffix={value ? suffix : ''} />
              </p>
              {label === 'Calories' && value && <p style={{ fontSize: '0.6rem', color: 'var(--text-disabled)', marginTop: '4px' }}>kcal/day</p>}
            </motion.div>
          ))}
        </div>

        {/* BMI status */}
        {bmiCat && (
          <motion.div whileHover={{ scale: 1.01 }} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-lg)', marginBottom: '10px' }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>📊</span>
            <div>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em' }}>BMI Status</p>
              <p style={{ fontWeight: 700, color: bmiCat.color }}>{bmiCat.label} <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '0.9rem' }}>— {bmiCat.advice}</span></p>
            </div>
          </motion.div>
        )}

        {/* Goal */}
        <motion.div whileHover={{ scale: 1.01 }} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'rgba(0,217,255,0.04)', border: '1px solid rgba(0,217,255,0.15)', borderRadius: 'var(--r-lg)' }}>
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{goalInfo.emoji}</span>
          <div>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em' }}>Current Goal</p>
            <p style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{goalInfo.label}</p>
          </div>
          {streakInfo.emoji !== '💤' && (
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <p style={{ fontSize: '0.72rem', color: streakInfo.color, fontWeight: 600 }}>{streakInfo.emoji} {streakInfo.label}</p>
            </div>
          )}
        </motion.div>
      </motion.section>

      {/* MACRO SUMMARY */}
      {macros && (
        <motion.section custom={4} variants={fadeUp} initial="hidden" animate="visible" style={{ marginBottom: '28px' }}>
          <h3 style={{ marginBottom: '14px' }}>Daily Nutrition</h3>
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-xl)', padding: '20px 20px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Target Calories</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{macros.calories.toLocaleString()}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>kcal / day</p>
              </div>
              <div style={{ fontSize: '2.8rem' }}>🥗</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { label: 'Protein', value: macros.protein.g, color: '#4ADE80', icon: '🥩' },
                { label: 'Carbs',   value: macros.carbs.g,   color: 'var(--gold)', icon: '🍚' },
                { label: 'Fat',     value: macros.fat.g,     color: 'var(--coral)', icon: '🥑' },
              ].map(({ label, value, color, icon }) => (
                <div key={label} style={{ textAlign: 'center', padding: '12px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--r-md)' }}>
                  <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>{icon}</div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color }}>{value}g</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* WEEKLY SCHEDULE */}
      <motion.section custom={5} variants={fadeUp} initial="hidden" animate="visible" style={{ marginBottom: '28px' }}>
        <div className="section-header">
          <h3>Weekly Schedule</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Week {currentWeek}/{TOTAL_PROGRAM_WEEKS}</span>
        </div>
        <div className="scroll-x">
          {[1,2,3,4,5,6,0].map(day => {
            const isToday  = new Date().getDay() === day;
            const hasWork  = !!plan.schedule[day];
            return (
              <motion.div
                key={day}
                whileHover={{ y: -2 }}
                className={`day-pill${isToday ? ' day-pill--active' : ''}${hasWork && !isToday ? ' day-pill--workout' : ''}`}
              >
                <span className="day-pill__name">{DAY_NAMES_SHORT[day]}</span>
                <span style={{ fontSize: '1.3rem' }}>{hasWork ? '🔥' : '💤'}</span>
                {isToday && <div className="day-pill__dot" />}
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* UP FIRST PREVIEW */}
      {todaySession && (
        <motion.section custom={6} variants={fadeUp} initial="hidden" animate="visible" style={{ marginBottom: '28px' }}>
          <h3 style={{ marginBottom: '14px' }}>Up First</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todaySession.exercises.slice(0, 4).map((ex, i) => (
              <motion.div
                key={ex.id}
                whileHover={{ scale: 1.01 }}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-lg)' }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0,217,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--teal)', fontSize: '1rem', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ex.sets} sets × {ex.reps} reps · {ex.rest}s rest</p>
                </div>
                <span className="badge badge--muted">{ex.difficulty}</span>
              </motion.div>
            ))}
            {todaySession.exercises.length > 4 && (
              <button
                onClick={() => navigate('/workout')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', background: 'transparent', border: '1px dashed var(--glass-border)', borderRadius: 'var(--r-lg)', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}
              >
                +{todaySession.exercises.length - 4} more exercises <ChevronRight size={16} />
              </button>
            )}
          </div>
        </motion.section>
      )}

      {/* NUTRITION TIPS */}
      <motion.section custom={7} variants={fadeUp} initial="hidden" animate="visible" style={{ marginBottom: '40px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Utensils size={18} color="var(--coral)" /> Nutrition Tips
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tips.map((t, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.01 }}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-lg)' }}
            >
              <span style={{ fontSize: '1.5rem', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', flexShrink: 0 }}>{t.icon}</span>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 500 }}>{t.tip}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* EDIT STATS MODAL */}
      <AnimatePresence>
        {isEditing && editData && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditing(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2>Edit Stats</h2>
                <button className="btn-icon" onClick={() => setEditing(false)} style={{ width: '36px', height: '36px' }}><X size={18} /></button>
              </div>
              <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><label>Weight (kg)</label><input type="number" min="20" max="400" step="0.1" value={editData.weight || ''} onChange={e => setEditData(d => ({ ...d, weight: e.target.value }))} /></div>
                  <div><label>Height (cm)</label><input type="number" min="100" max="250" value={editData.height || ''} onChange={e => setEditData(d => ({ ...d, height: e.target.value }))} /></div>
                </div>
                <div style={{ marginBottom: '16px' }}><label>Age</label><input type="number" min="5" max="120" value={editData.age || ''} onChange={e => setEditData(d => ({ ...d, age: e.target.value }))} /></div>
                <div style={{ marginBottom: '28px' }}>
                  <label>Goal</label>
                  <select value={editData.goal} onChange={e => setEditData(d => ({ ...d, goal: e.target.value }))}>
                    <option value="general">General Fitness</option>
                    <option value="fat_loss">Fat Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="strength">Strength</option>
                  </select>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary btn-full" type="submit">
                  <Save size={18} /> Save & Update Plan
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
