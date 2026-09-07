import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { storage } from '../utils/storage';
import { getUnlocked } from '../utils/achievements';
import {
  getLevel, getLevelTitle, getLevelEmoji, getXPProgress, getXPToNextLevel, getStreakStatus
} from '../constants/fitness';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Plus, Trash2, Check, User, Activity, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../components/ConfirmModal';

const ProfileCard = ({ profile, isActive, onSelect, onDelete }) => {
  const level      = getLevel(profile.xp || 0);
  const levelTitle = getLevelTitle(profile.xp || 0);
  const levelEmoji = getLevelEmoji(profile.xp || 0);
  const streakInfo = getStreakStatus(profile.streak || 0);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`profile-card${isActive ? ' profile-card--active' : ''}`}
      onClick={onSelect}
    >
      <div className="profile-avatar">{profile.name?.[0]?.toUpperCase() || '?'}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h3 style={{ fontSize: '1.05rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.name}</h3>
          {isActive && <span className="badge badge--teal">Active</span>}
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
          {levelEmoji} Lv.{level} {levelTitle} · {streakInfo.emoji} {profile.streak || 0} day streak
        </p>
      </div>
      {isActive && <Check size={20} color="var(--teal)" style={{ flexShrink: 0 }} />}
      {!isActive && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: 'var(--coral)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          <Trash2 size={15} />
        </button>
      )}
    </motion.div>
  );
};

const ProfileSwitcher = () => {
  const { user, profiles, activeProfileID, switchProfile, deleteProfile } = useApp();
  const { user: clerkUser } = useUser();
  const navigate = useNavigate();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [tab, setTab] = useState('profile'); // 'profile' | 'achievements' | 'stats'

  const history      = user ? storage.get(`history_${user.id}`, []) : [];
  const level        = getLevel(user?.xp || 0);
  const xpProgress   = getXPProgress(user?.xp || 0);
  const xpToNext     = getXPToNextLevel(user?.xp || 0);
  const levelTitle   = getLevelTitle(user?.xp || 0);
  const levelEmoji   = getLevelEmoji(user?.xp || 0);
  const unlocked     = user ? getUnlocked(history, user, level) : [];
  const totalMins    = history.reduce((a, s) => a + Math.floor((s.durationSeconds || 0) / 60), 0);

  const handleDelete = () => {
    deleteProfile(deleteTarget);
    setDeleteTarget(null);
  };

  const tabs = [
    { id: 'profile',      label: 'Profile',      icon: User },
    { id: 'stats',        label: 'Stats',         icon: Activity },
    { id: 'achievements', label: 'Achievements',  icon: Award },
  ];

  return (
    <div className="page-container">
      {/* Clerk Account button */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
        <UserButton afterSignOutUrl="/" />
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '4px' }}>Profiles</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {clerkUser?.primaryEmailAddress?.emailAddress || ''}
        </p>
      </motion.div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-full)', padding: '6px', marginBottom: '28px' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            whileTap={{ scale: 0.97 }}
            onClick={() => setTab(id)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '10px', borderRadius: 'var(--r-full)', fontSize: '0.8rem', fontWeight: 700,
              background: tab === id ? 'var(--teal)' : 'transparent',
              color:      tab === id ? '#080B12'     : 'var(--text-muted)',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: tab === id ? '0 0 15px var(--teal-glow)' : 'none',
            }}
          >
            <Icon size={14} />
            <span>{label}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* PROFILE TAB */}
        {tab === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {user && (
              <div style={{ padding: '20px', background: 'var(--glass-bg)', border: '1px solid rgba(0,217,255,0.2)', borderRadius: 'var(--r-xl)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div className="profile-avatar" style={{ width: '64px', height: '64px', fontSize: '2rem', borderColor: 'var(--teal)', borderWidth: '3px' }}>
                    {user.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h2 style={{ marginBottom: '4px' }}>{user.name}</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {user.goal?.replace('_', ' ')} · {user.fitness_level}
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="level-badge">{levelEmoji} Lv.{level} {levelTitle}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{xpToNext} XP to next</span>
                  </div>
                  <div className="xp-bar">
                    <motion.div className="xp-bar__fill" initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 1, delay: 0.3 }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { label: 'XP', value: (user.xp || 0).toLocaleString() },
                    { label: 'Streak', value: `${user.streak || 0}🔥` },
                    { label: 'Workouts', value: history.length },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ textAlign: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--r-md)' }}>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--teal)', marginBottom: '2px' }}>{value}</p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h3 style={{ marginBottom: '14px', color: 'var(--text-secondary)' }}>Switch Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {profiles.map(p => (
                <ProfileCard
                  key={p.id}
                  profile={p}
                  isActive={p.id === activeProfileID}
                  onSelect={() => switchProfile(p.id)}
                  onDelete={() => setDeleteTarget(p.id)}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary btn-full"
              onClick={() => navigate('/onboarding', { state: { addNew: true } })}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Plus size={18} /> Add New Profile
            </motion.button>
          </motion.div>
        )}

        {/* STATS TAB */}
        {tab === 'stats' && (
          <motion.div key="stats" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '12px' }}>📊</div>
                <p style={{ fontWeight: 600 }}>No workouts yet</p>
                <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Complete a workout to see your stats here.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  {[
                    { label: 'Total Workouts', value: history.length, icon: '🏋️' },
                    { label: 'Total Minutes',   value: totalMins,      icon: '⏱' },
                    { label: 'Best Streak',     value: `${user?.streak || 0}🔥`, icon: '🔥' },
                    { label: 'XP Earned',       value: (user?.xp || 0).toLocaleString(), icon: '⚡' },
                  ].map(({ label, value, icon }) => (
                    <motion.div key={label} whileHover={{ y: -2 }} style={{ padding: '20px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-lg)', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{icon}</div>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--teal)', marginBottom: '4px' }}>{value}</p>
                      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{label}</p>
                    </motion.div>
                  ))}
                </div>

                <h3 style={{ marginBottom: '14px' }}>Recent Workouts</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[...history].reverse().slice(0, 10).map(session => (
                    <motion.div key={session.id} whileHover={{ scale: 1.01 }} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-lg)' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(0,217,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>🏋️</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, marginBottom: '2px', fontSize: '0.95rem' }}>{session.workoutName || 'Workout'}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {Math.floor((session.durationSeconds || 0) / 60)} min
                        </p>
                      </div>
                      {session.allSetsCompleted && <span className="badge badge--green">✓ Perfect</span>}
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ACHIEVEMENTS TAB */}
        {tab === 'achievements' && (
          <motion.div key="achievements" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.2rem' }}>🏆</span>
              <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{unlocked.length} of 15 unlocked</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {unlocked.map(a => (
                <motion.div
                  key={a.id}
                  whileHover={{ y: -3 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="achievement-badge achievement-badge--unlocked"
                >
                  <span className="achievement-badge__emoji">{a.emoji}</span>
                  <span className="achievement-badge__name" style={{ color: 'var(--gold)', fontWeight: 800 }}>{a.name}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>{a.desc}</span>
                </motion.div>
              ))}

              {/* Locked achievements */}
              {Array.from({ length: Math.max(0, 15 - unlocked.length) }).map((_, i) => (
                <div key={`locked-${i}`} className="achievement-badge achievement-badge--locked">
                  <span className="achievement-badge__emoji">🔒</span>
                  <span className="achievement-badge__name">Locked</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Profile"
        message="This will permanently delete this profile and all its workout history. This cannot be undone."
        confirmLabel="Delete Profile"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ProfileSwitcher;
