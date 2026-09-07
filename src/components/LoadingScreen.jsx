import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ message = 'Loading...' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      background: 'var(--bg-base)',
    }}
  >
    <div style={{ fontSize: '4rem', animation: 'float 2s ease-in-out infinite' }}>🏋️</div>
    <div className="spinner" />
    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>{message}</p>
  </motion.div>
);

export default LoadingScreen;
