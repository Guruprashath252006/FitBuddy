import React, { useState, useMemo } from 'react';
import { EXERCISES, CATEGORIES } from '../constants/exercises';
import { Search, ChevronDown, Play, Lightbulb, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DIFF_COLORS = {
  beginner:     { badge: 'badge--teal',   border: 'rgba(0,217,255,0.25)',  bg: 'rgba(0,217,255,0.05)'  },
  intermediate: { badge: 'badge--violet', border: 'rgba(167,139,250,0.25)', bg: 'rgba(167,139,250,0.05)' },
  advanced:     { badge: 'badge--coral',  border: 'rgba(255,107,107,0.25)', bg: 'rgba(255,107,107,0.05)' },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const cardAnim = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const ExerciseLibrary = () => {
  const [category,    setCategory]    = useState('All');
  const [difficulty,  setDifficulty]  = useState('All');
  const [search,      setSearch]      = useState('');
  const [expandedId,  setExpandedId]  = useState(null);

  const categories   = ['All', ...Object.values(CATEGORIES)];
  const difficulties = ['All', 'beginner', 'intermediate', 'advanced'];

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return EXERCISES.filter(ex => {
      const matchCat  = category   === 'All' || ex.category === category;
      const matchDiff = difficulty === 'All' || ex.difficulty === difficulty;
      const matchQ    = !q || ex.name.toLowerCase().includes(q) ||
                        ex.muscles?.some(m => m.toLowerCase().includes(q)) ||
                        ex.instructions?.toLowerCase().includes(q);
      return matchCat && matchDiff && matchQ;
    });
  }, [category, difficulty, search]);

  const toggle = (id) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '4px' }}>Exercise Library</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{EXERCISES.length} exercises · tap to explore</p>
      </motion.div>

      {/* Sticky search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ position: 'sticky', top: '10px', zIndex: 50, marginBottom: '18px' }}
      >
        <div style={{ position: 'relative', borderRadius: 'var(--r-lg)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <Search size={17} color="var(--teal)" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search exercises, muscles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '48px', paddingRight: search ? '44px' : '18px', background: 'rgba(14,20,32,0.92)', backdropFilter: 'blur(20px)', height: '52px', borderColor: search ? 'rgba(0,217,255,0.3)' : 'var(--glass-border)', borderRadius: 'var(--r-lg)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
              <X size={16} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Category Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} style={{ marginBottom: '12px' }}>
        <div className="scroll-x">
          {categories.map(cat => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(cat)}
              style={{
                padding: '10px 18px', borderRadius: 'var(--r-full)', whiteSpace: 'nowrap', fontSize: '0.85rem', fontWeight: 600,
                background: category === cat ? 'var(--teal)' : 'var(--glass-bg)',
                color:      category === cat ? '#080B12'     : 'var(--text-muted)',
                border:     `1px solid ${category === cat ? 'var(--teal)' : 'var(--glass-border)'}`,
                boxShadow:  category === cat ? '0 4px 16px var(--teal-glow)' : 'none',
                flexShrink: 0,
              }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Difficulty Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {difficulties.map(d => {
          const active = difficulty === d;
          return (
            <motion.button
              key={d}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDifficulty(d)}
              style={{
                padding: '8px 16px', borderRadius: 'var(--r-full)', fontSize: '0.78rem', fontWeight: 700,
                background: active ? (d === 'beginner' ? 'rgba(0,217,255,0.12)' : d === 'intermediate' ? 'rgba(167,139,250,0.12)' : d === 'advanced' ? 'rgba(255,107,107,0.12)' : 'var(--glass-hover)') : 'var(--glass-bg)',
                color:      active ? (d === 'beginner' ? 'var(--teal)' : d === 'intermediate' ? 'var(--violet)' : d === 'advanced' ? 'var(--coral)' : 'var(--text-primary)') : 'var(--text-muted)',
                border: `1px solid ${active ? (d === 'beginner' ? 'rgba(0,217,255,0.3)' : d === 'intermediate' ? 'rgba(167,139,250,0.3)' : d === 'advanced' ? 'rgba(255,107,107,0.3)' : 'rgba(255,255,255,0.2)') : 'var(--glass-border)'}`,
                textTransform: 'capitalize',
              }}
            >
              {d === 'All' ? 'All Levels' : d}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Results count */}
      {(search || category !== 'All' || difficulty !== 'All') && (
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', fontWeight: 600 }}>
          {filtered.length} of {EXERCISES.length} exercises
        </p>
      )}

      {/* Exercise List */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🔍</div>
          <p style={{ fontWeight: 600 }}>No exercises found</p>
          <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Try a different search or filter</p>
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(ex => {
            const isOpen = expandedId === ex.id;
            const diffStyle = DIFF_COLORS[ex.difficulty] || DIFF_COLORS.beginner;
            return (
              <motion.div
                key={ex.id}
                variants={cardAnim}
                whileHover={{ scale: 1.008 }}
                onClick={() => toggle(ex.id)}
                className="exercise-card"
                style={{
                  borderLeft: `3px solid ${isOpen ? 'var(--teal)' : 'transparent'}`,
                  background: isOpen ? diffStyle.bg : 'var(--glass-bg)',
                  border: `1px solid ${isOpen ? diffStyle.border : 'var(--glass-border)'}`,
                  cursor: 'pointer',
                }}
              >
                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ marginBottom: '4px', fontSize: '1.1rem' }}>{ex.name}</h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--teal)', fontWeight: 600 }}>{ex.category}</span>
                      {ex.muscles?.slice(0, 2).map(m => (
                        <span key={m} style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>· {m}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span className={`badge ${diffStyle.badge}`}>{ex.difficulty}</span>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={18} color="var(--text-muted)" />
                    </motion.div>
                  </div>
                </div>

                {/* Expanded */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: '16px', paddingTop: '18px' }}>
                        {/* Quick Stats */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                          {[
                            { label: 'Sets', value: ex.sets },
                            { label: 'Reps', value: ex.reps },
                            { label: 'Rest', value: `${ex.rest}s` },
                            { label: 'Cal/min', value: ex.calsPerMin },
                          ].map(({ label, value }) => (
                            <div key={label} style={{ flex: 1, textAlign: 'center', padding: '10px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--r-md)' }}>
                              <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '2px' }}>{value}</p>
                              <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{label}</p>
                            </div>
                          ))}
                        </div>

                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '14px' }}>
                          {ex.instructions}
                        </p>

                        {ex.tip && (
                          <div style={{ display: 'flex', gap: '12px', padding: '14px', background: 'rgba(255,176,32,0.06)', border: '1px dashed rgba(255,176,32,0.2)', borderRadius: 'var(--r-md)', marginBottom: '14px' }}>
                            <Lightbulb size={16} color="var(--gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <p style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{ex.tip}</p>
                          </div>
                        )}

                        {ex.benefits?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                            {ex.benefits.map((b, i) => (
                              <span key={i} className="badge badge--muted">{b}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default ExerciseLibrary;
