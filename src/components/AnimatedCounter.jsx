import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, useMotionValueEvent } from 'framer-motion';
import { cn } from '../utils/cn';

export default function AnimatedCounter({ value, className, prefix = '', suffix = '', decimals = 1 }) {
  const [isChanging, setIsChanging] = useState(false);

  // Rapid spring config (no bounce, aggressive snapping to target)
  const spring = useSpring(value, {
    stiffness: 400,
    damping: 40,
    mass: 1,
  });

  // Keep spring updated
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  // Hook into the spring to know if we are currently animating numbers.
  // When animating, change text to orange.
  useMotionValueEvent(spring, 'change', (latest) => {
    // Check difference at the specified precision
    const diff = Math.abs(latest - value);
    const threshold = 1 / Math.pow(10, decimals + 1); // small threshold for floats
    
    if (diff > threshold) {
      if (!isChanging) setIsChanging(true);
    } else {
      if (isChanging) setIsChanging(false);
    }
  });

  // Calculate formatted output
  const displayValue = useTransform(spring, (current) => {
    return prefix + current.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    }) + suffix;
  });

  return (
    <motion.span
      className={cn(
        "transition-colors duration-200",
        isChanging ? "text-[#ff8c00] drop-shadow-[0_0_8px_rgba(255,140,0,0.6)] font-bold scale-[1.05]" : "",
        className
      )}
      style={{
        display: 'inline-block', // so scale transform works if applied
        ...((isChanging && !className.includes('text-[#ff8c00]')) ? { color: '#ff8c00' } : {})
      }}
    >
      {displayValue}
    </motion.span>
  );
}
