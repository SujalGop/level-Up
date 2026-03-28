import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ isOpen, onClose, title, children, variant = 'blue' }) {
  if (!isOpen) return null;

  const borderColor = variant === 'red' ? '#ff003c' : '#00f0ff';
  const shadowColor = variant === 'red' ? 'rgba(255,0,60,0.2)' : 'rgba(0,240,255,0.2)';

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`modal-box ${variant === 'red' ? 'modal-box-red' : ''}`}
          onClick={e => e.stopPropagation()}
          style={{ borderColor, boxShadow: `0 0 40px ${shadowColor}, 0 0 80px ${shadowColor}50` }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2
              className="font-orbitron"
              style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.15em', color: borderColor, margin: 0 }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#8892a0',
                fontSize: '20px',
                cursor: 'pointer',
                lineHeight: 1,
                padding: '4px',
              }}
            >
              ×
            </button>
          </div>
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
