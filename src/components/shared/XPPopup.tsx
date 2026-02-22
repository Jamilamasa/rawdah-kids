'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface XPPopupProps {
  xp: number;
  show: boolean;
  onDone?: () => void;
}

export function XPPopup({ xp, show, onDone }: XPPopupProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show && xp > 0) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDone?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, xp, onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1, y: 0, scale: 0.8 }}
          animate={{ opacity: 1, y: -20, scale: 1 }}
          exit={{ opacity: 0, y: -60, scale: 1.1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold text-2xl px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2">
            <span>⭐</span>
            <span>+{xp} XP</span>
            <span>⭐</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
