import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

const Login = () => (
  <div className="login-page">
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <div className="login-logo">🏋️</div>
      <h1 className="gradient-text--teal" style={{ marginBottom: '8px', fontSize: '2.8rem' }}>FitBuddy</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1.05rem' }}>
        Your AI-powered personal trainer
      </p>
    </motion.div>

    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
      <SignIn routing="hash" />
    </motion.div>

    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      style={{ marginTop: '32px', fontSize: '0.8rem', color: 'var(--text-disabled)' }}
    >
      Personalised plans · Progress tracking · Gamification
    </motion.p>
  </div>
);

export default Login;
