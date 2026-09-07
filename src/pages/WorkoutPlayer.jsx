import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { storage } from '../utils/storage';
import { generateWorkoutPlan } from '../utils/workoutGenerator';
import { XP_PER_WORKOUT, XP_ALL_SETS_BONUS } from '../constants/fitness';
import { CheckCircle, ChevronLeft, Play, Pause, SkipForward, Trophy, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Rest Timer Component
const RestTimer = ({ seconds, onDone }) => {
  const [remaining, setRemaining] = useState(seconds);
  const total = seconds;

  useEffect(() => {
    if (remaining <= 0) { onDone(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onDone]);

  // Vibrate on start
  useEffect(() => {
    if (navigator.vibrate) navigator.vibrate(100);
  }, []);

  const pct   = remaining / total;
  const r     = 88;
  const circ  = 2 * Math.PI * r;
  const dash  = circ * pct;

  return (
    <motion.div
      className="rest-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.1em' }}>Rest Period</div>

      <div className="rest-timer-ring">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx="100" cy="100" r={r} fill="none"
            stroke="var(--teal)" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 1s linear', filter: 'drop-shadow(0 0 10px var(--teal))' }}
          />
        </svg>
        <div className="rest-timer-number">{remaining}</div>
      </div>

      <div style={{ marginTop: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        {remaining > 10 ? '💤 Recover and breathe...' : remaining > 0 ? '⚡ Get ready!' : ''}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDone}
        className="btn-secondary"
        style={{ marginTop: '32px' }}
      >
        Skip Rest
      </motion.button>
    </motion.div>
  );
};

// Celebration Screen
const CelebrationScreen = ({ session, xpEarned, onDone }) => {
  const mins = Math.floor(session.durationSeconds / 60);
  const secs = session.durationSeconds % 60;

  return (
    <motion.div
      className="celebration"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.2 }}
        style={{ fontSize: '6rem', marginBottom: '24px' }}
      >
        🏆
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="gradient-text--teal"
        style={{ marginBottom: '8px', fontSize: '2.5rem' }}
      >
        Workout Complete!
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1.05rem' }}
      >
        {session.workoutName}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: '100%', maxWidth: '360px', marginBottom: '32px' }}
      >
        {[
          { label: 'Duration',    value: `${mins}:${String(secs).padStart(2,'0')}`, icon: '⏱' },
          { label: 'Sets Done',   value: session.setsCompleted,                     icon: '✅' },
          { label: 'XP Earned',   value: `+${xpEarned}`,                             icon: '⚡' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ textAlign: 'center', padding: '20px 12px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-lg)' }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>{icon}</div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--teal)', marginBottom: '4px' }}>{value}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{label}</p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '360px' }}
      >
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary btn-full" onClick={onDone} style={{ padding: '16px', fontSize: '1rem' }}>
          Back to Dashboard
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

const WorkoutPlayer = () => {
  const { user, completeWorkout, logWorkoutSession } = useApp();
  const navigate = useNavigate();

  const [plan,             setPlan]          = useState(null);
  const [workout,          setWorkout]       = useState(null);
  const [currentExIndex,   setCurrentEx]     = useState(0);
  const [completedSets,    setCompletedSets] = useState({});
  const [showRest,         setShowRest]      = useState(false);
  const [restDuration,     setRestDuration]  = useState(60);
  const [isRunning,        setIsRunning]     = useState(true);
  const [elapsed,          setElapsed]       = useState(0);
  const [finished,         setFinished]      = useState(false);
  const [sessionData,      setSessionData]   = useState(null);
  const [xpEarned,         setXPEarned]      = useState(0);
  const timerRef = useRef(null);

  // Load plan & today's workout
  useEffect(() => {
    if (!user) return;
    const savedPlan = storage.get(`plan_${user.id}`);
    if (!savedPlan) { navigate('/'); return; }
    setPlan(savedPlan);
    const todayWorkout = savedPlan.schedule[new Date().getDay()];
    setWorkout(todayWorkout || Object.values(savedPlan.schedule)[0]);
  }, [user, navigate]);

  // Elapsed timer
  useEffect(() => {
    if (!isRunning || finished) return;
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [isRunning, finished]);

  const currentExercise = workout?.exercises?.[currentExIndex];
  const totalExercises  = workout?.exercises?.length || 0;
  const totalSets       = currentExercise?.sets || 3;
  const doneSetsForCurrent = completedSets[currentExIndex] || 0;

  const totalPossibleSets = workout?.exercises?.reduce((a, e) => a + e.sets, 0) || 0;
  const totalSetsCompleted = Object.entries(completedSets).reduce((sum, [idx, count]) => {
    const ex = workout?.exercises?.[parseInt(idx)];
    return sum + Math.min(count, ex?.sets || 0);
  }, 0);

  const overallProgress = totalPossibleSets ? (totalSetsCompleted / totalPossibleSets) * 100 : 0;

  const handleSetDone = useCallback((setIdx) => {
    setCompletedSets(prev => {
      const done = (prev[currentExIndex] || 0);
      if (done > setIdx) return prev; // already done
      const next = { ...prev, [currentExIndex]: setIdx + 1 };
      // Trigger rest timer
      setRestDuration(currentExercise?.rest || 60);
      setShowRest(true);
      return next;
    });
  }, [currentExIndex, currentExercise]);

  const handleRestDone = () => setShowRest(false);

  const goNext = () => {
    if (currentExIndex < totalExercises - 1) setCurrentEx(i => i + 1);
  };

  const goPrev = () => {
    if (currentExIndex > 0) setCurrentEx(i => i - 1);
  };

  const handleFinish = useCallback(() => {
    clearInterval(timerRef.current);
    const allSetsCompleted = totalSetsCompleted >= totalPossibleSets * 0.8;

    const sessionInfo = {
      workoutName:      workout?.name || 'Workout',
      durationSeconds:  elapsed,
      setsCompleted:    totalSetsCompleted,
      allSetsCompleted,
    };

    const xp = XP_PER_WORKOUT + (allSetsCompleted ? XP_ALL_SETS_BONUS : 0);

    completeWorkout({ allSetsCompleted });
    logWorkoutSession(sessionInfo);

    setXPEarned(xp);
    setSessionData(sessionInfo);
    setFinished(true);
  }, [elapsed, totalSetsCompleted, totalPossibleSets, workout, completeWorkout, logWorkoutSession]);

  const handleDone = () => navigate('/');

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  if (!workout) return null;
  if (finished && sessionData) return <CelebrationScreen session={sessionData} xpEarned={xpEarned} onDone={handleDone} />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {showRest && <RestTimer seconds={restDuration} onDone={handleRestDone} />}
      </AnimatePresence>

      {/* HEADER */}
      <div className="workout-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <button className="btn-icon" onClick={() => navigate('/')} style={{ width: '40px', height: '40px', color: 'var(--text-secondary)' }}>
            <ChevronLeft size={20} />
          </button>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }}>{workout.name}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--teal)' }}>
              {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFinish}
            style={{ padding: '8px 14px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: 'var(--coral)', borderRadius: 'var(--r-full)', fontSize: '0.78rem', fontWeight: 700 }}
          >
            Finish
          </motion.button>
        </div>

        <div className="workout-progress">
          <motion.div
            className="workout-progress__fill"
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* EXERCISE CONTENT */}
      <div style={{ flex: 1, padding: '28px 20px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.1em' }}>
            Exercise {currentExIndex + 1} / {totalExercises}
          </span>
          <span className={`badge badge--${currentExercise.difficulty === 'advanced' ? 'coral' : currentExercise.difficulty === 'intermediate' ? 'violet' : 'teal'}`}>
            {currentExercise.difficulty}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentExIndex}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          >
            <h2 style={{ fontSize: '2rem', marginBottom: '6px', letterSpacing: '-0.02em' }}>{currentExercise.name}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>
              {currentExercise.sets} sets × {currentExercise.reps} reps · {currentExercise.rest}s rest
            </p>

            {/* Muscles */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {currentExercise.muscles?.map(m => (
                <span key={m} className="badge badge--muted">{m}</span>
              ))}
            </div>

            {/* SET TRACKING */}
            <h4 style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '16px' }}>
              Tap to complete a set
            </h4>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
              {Array.from({ length: totalSets }).map((_, si) => {
                const done = si < doneSetsForCurrent;
                return (
                  <motion.button
                    key={si}
                    whileHover={{ scale: done ? 1 : 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => !done && handleSetDone(si)}
                    className={`set-btn${done ? ' set-btn--done' : ''}`}
                  >
                    {done ? <CheckCircle size={26} strokeWidth={2.5} /> : si + 1}
                  </motion.button>
                );
              })}
            </div>

            {/* Instructions */}
            <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-lg)', padding: '18px' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--teal)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>📋 How to do it</p>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{currentExercise.instructions}</p>
            </div>

            {/* Pro Tip */}
            {currentExercise.tip && (
              <div style={{ background: 'rgba(255,176,32,0.06)', border: '1px dashed rgba(255,176,32,0.25)', borderRadius: 'var(--r-lg)', padding: '16px', marginTop: '14px' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>💡 Pro Tip</p>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{currentExercise.tip}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* BOTTOM NAV */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--glass-border)', background: 'rgba(8,11,18,0.9)', backdropFilter: 'blur(16px)' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goPrev}
            disabled={currentExIndex === 0}
            className="btn-secondary"
            style={{ padding: '14px 20px', opacity: currentExIndex === 0 ? 0.3 : 1 }}
          >
            <ChevronLeft size={18} />
          </motion.button>

          {currentExIndex < totalExercises - 1 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={goNext}
              className="btn-primary btn-full"
              style={{ padding: '14px' }}
            >
              Next Exercise <SkipForward size={18} />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFinish}
              className="btn-coral btn-full"
              style={{ padding: '14px' }}
            >
              <Trophy size={18} /> Complete Workout!
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlayer;
