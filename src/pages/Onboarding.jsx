import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Dumbbell, Activity, Building2, CheckCircle2 } from 'lucide-react';
import { sanitizeNumber, sanitizeString } from '../utils/sanitize';

const STEPS = ['Welcome', 'Body Metrics', 'Your Goal', 'Fitness Level', 'Equipment', 'Schedule'];

const GOALS = [
  { id: 'fat_loss',    emoji: '🔥', label: 'Fat Loss',       desc: 'Burn fat, stay lean' },
  { id: 'muscle_gain', emoji: '💪', label: 'Muscle Gain',    desc: 'Build size & strength' },
  { id: 'strength',    emoji: '⚡', label: 'Strength',       desc: 'Raw power & performance' },
  { id: 'general',     emoji: '🌱', label: 'General Fitness', desc: 'Balanced & healthy' },
];

const LEVELS = [
  { id: 'beginner',     emoji: '🌱', label: 'Beginner',     desc: 'Less than 1 year training' },
  { id: 'intermediate', emoji: '💪', label: 'Intermediate', desc: '1–3 years training' },
  { id: 'advanced',     emoji: '⚡', label: 'Advanced',     desc: '3+ years of lifting' },
];

const EQUIPMENT_OPTIONS = [
  { id: 'dumbbells', icon: Dumbbell, label: 'Dumbbells' },
  { id: 'bands',     icon: Activity, label: 'Resistance Bands' },
  { id: 'gym',       icon: Building2, label: 'Full Gym Access' },
];

const DAY_OPTIONS = [
  { label: 'Mon', value: 1 }, { label: 'Tue', value: 2 }, { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 }, { label: 'Fri', value: 5 }, { label: 'Sat', value: 6 }, { label: 'Sun', value: 0 },
];

const slideVariants = {
  enter: dir => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  dir => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const Onboarding = () => {
  const { saveUser } = useApp();
  const navigate = useNavigate();

  const [step, setStep]       = useState(0);
  const [dir,  setDir]        = useState(1);
  const [form, setForm]       = useState({
    name: '', age: '', weight: '', height: '', gender: 'male',
    goal: '', fitness_level: '', equipment: [], days_available: [],
  });

  const go = (n) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
  };

  const next = () => go(step + 1);
  const prev = () => go(step - 1);

  const toggle = (field, val) => {
    setForm(f => {
      const arr = f[field];
      return { ...f, [field]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
    });
  };

  const handleFinish = () => {
    saveUser({
      ...form,
      age:    sanitizeNumber(form.age, 5, 120),
      weight: sanitizeNumber(form.weight, 20, 400),
      height: sanitizeNumber(form.height, 100, 250),
      name:   sanitizeString(form.name, 30) || 'Athlete',
    });
    navigate('/', { replace: true });
  };

  const canNext = () => {
    if (step === 0) return form.name.trim().length > 0;
    if (step === 1) return form.weight && form.height && form.age;
    if (step === 2) return form.goal;
    if (step === 3) return form.fitness_level;
    if (step === 5) return form.days_available.length > 0;
    return true;
  };

  return (
    <div className="onboarding-step">
      {/* Progress indicators */}
      <div className="step-indicator">
        {STEPS.map((_, i) => (
          <div key={i} className={`step-dot${i < step ? ' step-dot--done' : ''}${i === step ? ' step-dot--active' : ''}`} />
        ))}
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={step}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          style={{ flex: 1 }}
        >
          {/* STEP 0 — Welcome */}
          {step === 0 && (
            <div>
              <div style={{ fontSize: '4rem', marginBottom: '20px', animation: 'float 3s ease-in-out infinite' }}>🏋️</div>
              <h1 style={{ marginBottom: '10px' }}>Welcome to <span className="gradient-text--teal">FitBuddy</span></h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1.05rem', lineHeight: 1.6 }}>
                Your AI-powered personal trainer. Let's build your personalised plan in 60 seconds.
              </p>
              <div className="form-group">
                <label>What should we call you?</label>
                <input
                  type="text"
                  placeholder="Your name or nickname"
                  value={form.name}
                  maxLength={30}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* STEP 1 — Body Metrics */}
          {step === 1 && (
            <div>
              <h2 style={{ marginBottom: '8px' }}>Your Metrics</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Used to personalise your plan and nutrition.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '0' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Age</label>
                  <input type="number" placeholder="25" min="5" max="120" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Gender</label>
                  <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Weight (kg)</label>
                  <input type="number" placeholder="70" min="20" max="400" step="0.1" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Height (cm)</label>
                  <input type="number" placeholder="175" min="100" max="250" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Goal */}
          {step === 2 && (
            <div>
              <h2 style={{ marginBottom: '8px' }}>Your Goal</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>This shapes every aspect of your plan.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {GOALS.map(g => (
                  <motion.button
                    key={g.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setForm(f => ({ ...f, goal: g.id }))}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px',
                      background: form.goal === g.id ? 'rgba(0,217,255,0.1)' : 'var(--glass-bg)',
                      border: `1px solid ${form.goal === g.id ? 'var(--teal)' : 'var(--glass-border)'}`,
                      borderRadius: 'var(--r-lg)', cursor: 'pointer', textAlign: 'left', width: '100%',
                      boxShadow: form.goal === g.id ? '0 0 20px rgba(0,217,255,0.15)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '2rem', width: '40px', textAlign: 'center' }}>{g.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{g.label}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{g.desc}</div>
                    </div>
                    {form.goal === g.id && <Check size={20} color="var(--teal)" />}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 — Fitness Level */}
          {step === 3 && (
            <div>
              <h2 style={{ marginBottom: '8px' }}>Experience Level</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>We scale the intensity to match you.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {LEVELS.map(l => (
                  <motion.button
                    key={l.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setForm(f => ({ ...f, fitness_level: l.id }))}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px',
                      background: form.fitness_level === l.id ? 'rgba(0,217,255,0.1)' : 'var(--glass-bg)',
                      border: `1px solid ${form.fitness_level === l.id ? 'var(--teal)' : 'var(--glass-border)'}`,
                      borderRadius: 'var(--r-lg)', cursor: 'pointer', textAlign: 'left', width: '100%',
                      boxShadow: form.fitness_level === l.id ? '0 0 20px rgba(0,217,255,0.15)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '2rem', width: '40px', textAlign: 'center' }}>{l.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{l.label}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{l.desc}</div>
                    </div>
                    {form.fitness_level === l.id && <Check size={20} color="var(--teal)" />}
                  </motion.button>
                ))}
            </div>
          </div>
          )}

          {/* STEP 4 — Equipment */}
          {step === 4 && (
            <div>
              <h2 style={{ marginBottom: '8px' }}>Available Equipment</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Bodyweight is always included. Select anything else you have.</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'var(--teal-subtle)', border: '1px solid rgba(0,217,255,0.2)', borderRadius: 'var(--r-md)', marginBottom: '20px' }}>
                <CheckCircle2 size={20} color="var(--teal)" />
                <span style={{ fontSize: '0.9rem', color: 'var(--teal)', fontWeight: 600 }}>Bodyweight — Always included</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {EQUIPMENT_OPTIONS.map(eq => {
                  const Icon = eq.icon;
                  const isSelected = form.equipment.includes(eq.id);
                  return (
                  <motion.button
                    key={eq.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => toggle('equipment', eq.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px',
                      background: isSelected ? 'rgba(0,217,255,0.1)' : 'var(--glass-bg)',
                      border: `1px solid ${isSelected ? 'var(--teal)' : 'var(--glass-border)'}`,
                      borderRadius: 'var(--r-lg)', cursor: 'pointer', textAlign: 'left', width: '100%',
                    }}
                  >
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '12px', 
                      background: isSelected ? 'rgba(0,217,255,0.2)' : 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                    }}>
                      <Icon size={22} color={isSelected ? 'var(--teal)' : 'var(--text-muted)'} />
                    </div>
                    <span style={{ flex: 1, fontWeight: 600, color: isSelected ? 'var(--teal)' : 'var(--text-primary)' }}>{eq.label}</span>
                    {isSelected && <Check size={20} color="var(--teal)" />}
                  </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5 — Schedule */}
          {step === 5 && (
            <div>
              <h2 style={{ marginBottom: '8px' }}>Training Days</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>Which days can you train? Pick at least one.</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {DAY_OPTIONS.map(d => (
                  <motion.button
                    key={d.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggle('days_available', d.value)}
                    style={{
                      padding: '14px 16px',
                      background: form.days_available.includes(d.value) ? 'var(--teal)' : 'var(--glass-bg)',
                      color: form.days_available.includes(d.value) ? '#080B12' : 'var(--text-muted)',
                      border: `1px solid ${form.days_available.includes(d.value) ? 'var(--teal)' : 'var(--glass-border)'}`,
                      borderRadius: 'var(--r-md)',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      boxShadow: form.days_available.includes(d.value) ? '0 0 15px var(--teal-glow)' : 'none',
                    }}
                  >
                    {d.label}
                  </motion.button>
                ))}
              </div>
              <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {form.days_available.length} day{form.days_available.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
        {step > 0 && (
          <button className="btn-secondary" onClick={prev} style={{ padding: '14px 20px' }}>
            <ChevronLeft size={18} />
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <motion.button
            whileHover={canNext() ? { scale: 1.02 } : {}}
            whileTap={canNext() ? { scale: 0.98 } : {}}
            className="btn-primary btn-full"
            onClick={next}
            disabled={!canNext()}
            style={{ opacity: canNext() ? 1 : 0.4 }}
          >
            Continue <ChevronRight size={18} />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary btn-full"
            onClick={handleFinish}
            disabled={!canNext()}
            style={{ opacity: canNext() ? 1 : 0.4 }}
          >
            🚀 Start Training
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
