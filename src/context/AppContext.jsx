import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { storage } from '../utils/storage';
import { sanitizeString, sanitizeNumber, toISODate, daysBetween } from '../utils/sanitize';
import { generateWorkoutPlan } from '../utils/workoutGenerator';
import { calcBMI, calcBMR, calcTDEE } from '../utils/nutritionCalc';
import { useUser } from '@clerk/clerk-react';
import {
  XP_PER_WORKOUT, XP_PER_STREAK_DAY, XP_ALL_SETS_BONUS,
  getLevel, TOTAL_PROGRAM_WEEKS, GOALS
} from '../constants/fitness';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const [profiles,         setProfiles]         = useState([]);
  const [activeProfileID,  setActiveProfileID]  = useState(null);
  const [loading,          setLoading]          = useState(true);

  // ─── Load profiles ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!clerkLoaded) return;
    if (clerkUser) {
      const uid     = clerkUser.id;
      const saved   = storage.get(`profiles_${uid}`, []);
      const lastID  = storage.get(`activeID_${uid}`);
      setProfiles(saved);
      if (lastID && saved.find(p => p.id === lastID)) setActiveProfileID(lastID);
      else if (saved.length > 0) setActiveProfileID(saved[0].id);
    } else {
      setProfiles([]);
      setActiveProfileID(null);
    }
    setLoading(false);
  }, [clerkUser, clerkLoaded]);

  // ─── Save/Update profile ────────────────────────────────────────────────
  const saveUser = useCallback((userData) => {
    if (!clerkUser) return;
    const uid = clerkUser.id;
    const id  = userData.id || Date.now().toString();

    // Recalculate derived metrics
    const weight = sanitizeNumber(userData.weight, 20, 400);
    const height = sanitizeNumber(userData.height, 100, 250);
    const age    = sanitizeNumber(userData.age, 5, 120);
    const bmi    = calcBMI(weight, height);
    const bmr    = calcBMR(weight, height, age, userData.gender || 'male');
    const goalParams = GOALS[userData.goal] || GOALS.general;
    const tdee   = calcTDEE(bmr, goalParams.activityMultiplier);

    const clean = {
      ...userData,
      id,
      name:            sanitizeString(userData.name, 30),
      age,
      weight,
      height,
      bmi,
      bmr,
      tdee,
      streak:          userData.streak          ?? 0,
      xp:              userData.xp              ?? 0,
      lastWorkoutDate: userData.lastWorkoutDate ?? null,
    };

    setProfiles(prev => {
      const idx = prev.findIndex(p => p.id === id);
      const updated = idx > -1
        ? prev.map((p, i) => i === idx ? clean : p)
        : [...prev, clean];
      storage.set(`profiles_${uid}`, updated);
      return updated;
    });
    setActiveProfileID(id);
    storage.set(`activeID_${uid}`, id);
  }, [clerkUser]);

  // ─── Complete workout (streak + XP) ────────────────────────────────────
  const completeWorkout = useCallback((sessionData = {}) => {
    const user = profiles.find(p => p.id === activeProfileID);
    if (!user || !clerkUser) return 0;

    const today = toISODate();
    if (user.lastWorkoutDate === today) return user.streak; // already done today

    let newStreak = (user.streak || 0) + 1;
    if (user.lastWorkoutDate) {
      const diff = daysBetween(user.lastWorkoutDate);
      if (diff > 1) newStreak = 1;
    }

    const xpGained = XP_PER_WORKOUT +
      (newStreak > 1 ? XP_PER_STREAK_DAY : 0) +
      (sessionData.allSetsCompleted ? XP_ALL_SETS_BONUS : 0);

    const updatedUser = {
      ...user,
      streak:          newStreak,
      lastWorkoutDate: today,
      xp:              (user.xp || 0) + xpGained,
    };

    saveUser(updatedUser);
    return newStreak;
  }, [profiles, activeProfileID, clerkUser, saveUser]);

  // ─── Log session to history ─────────────────────────────────────────────
  const logWorkoutSession = useCallback((data) => {
    if (!clerkUser || !activeProfileID) return;
    const key     = `history_${activeProfileID}`;
    const history = storage.get(key, []);
    const entry   = { id: Date.now().toString(), date: new Date().toISOString(), ...data };
    storage.set(key, [...history, entry]);
    return entry;
  }, [clerkUser, activeProfileID]);

  // ─── Get history ────────────────────────────────────────────────────────
  const getWorkoutHistory = useCallback((profileId = activeProfileID) => {
    return storage.get(`history_${profileId}`, []);
  }, [activeProfileID]);

  // ─── Regenerate plan ────────────────────────────────────────────────────
  const regeneratePlan = useCallback((userOverride) => {
    const target = userOverride || profiles.find(p => p.id === activeProfileID);
    if (!target) return null;
    const key  = `plan_${target.id}`;
    const plan = generateWorkoutPlan(target, 1);
    storage.set(key, plan);
    return plan;
  }, [profiles, activeProfileID]);

  // ─── Switch profile ─────────────────────────────────────────────────────
  const switchProfile = useCallback((id) => {
    if (!clerkUser || !profiles.find(p => p.id === id)) return;
    setActiveProfileID(id);
    storage.set(`activeID_${clerkUser.id}`, id);
  }, [clerkUser, profiles]);

  // ─── Delete profile ─────────────────────────────────────────────────────
  const deleteProfile = useCallback((id) => {
    if (!clerkUser) return;
    setProfiles(prev => {
      const updated = prev.filter(p => p.id !== id);
      storage.set(`profiles_${clerkUser.id}`, updated);
      storage.remove(`plan_${id}`);
      storage.remove(`history_${id}`);
      if (activeProfileID === id) {
        const next = updated[0]?.id || null;
        setActiveProfileID(next);
        storage.set(`activeID_${clerkUser.id}`, next);
      }
      return updated;
    });
  }, [clerkUser, activeProfileID]);

  const activeUser = profiles.find(p => p.id === activeProfileID) || null;

  return (
    <AppContext.Provider value={{
      user: activeUser, profiles, activeProfileID, loading,
      saveUser, switchProfile, deleteProfile,
      completeWorkout, logWorkoutSession, getWorkoutHistory, regeneratePlan,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
