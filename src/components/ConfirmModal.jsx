import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false, onConfirm, onCancel }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className="modal-content"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {danger && <AlertTriangle size={22} color="var(--coral)" />}
              <h3 style={{ fontSize: '1.2rem' }}>{title}</h3>
            </div>
            <button className="btn-icon" onClick={onCancel} style={{ width: '32px', height: '32px', flexShrink: 0 }}>
              <X size={16} />
            </button>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.5 }}>{message}</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary btn-full" onClick={onCancel}>{cancelLabel}</button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`btn-full ${danger ? 'btn-coral' : 'btn-primary'}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ConfirmModal;
