import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Dumbbell, BookOpen, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/',          label: 'Home',      icon: Home },
  { path: '/workout',   label: 'Workout',   icon: Dumbbell },
  { path: '/exercises', label: 'Library',   icon: BookOpen },
  { path: '/profiles',  label: 'Profile',   icon: User },
];

const BottomNav = () => {
  const location = useLocation();

  // Don't show nav on workout player
  if (location.pathname === '/workout') return null;

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
        const isActive = path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(path);

        return (
          <NavLink
            key={path}
            to={path}
            className="bottom-nav__item"
            style={{ color: isActive ? '#080B12' : undefined }}
          >
            <AnimatePresence>
              {isActive && (
                <motion.span
                  layoutId="nav-active"
                  className="bottom-nav__active-bg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </AnimatePresence>
            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            <span style={{ fontSize: '0.65rem', fontWeight: isActive ? 700 : 500 }}>{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
