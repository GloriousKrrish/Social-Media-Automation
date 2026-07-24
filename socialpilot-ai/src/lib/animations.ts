// Animation variants for Framer Motion
export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
};

export const slideInRight = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 12 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerFast = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const cardHover = {
  rest: { scale: 1, y: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  hover: {
    scale: 1.015,
    y: -2,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

export const buttonTap = {
  whileTap: { scale: 0.97 },
  whileHover: { scale: 1.02 },
};

export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
};

export const sidebarVariants = {
  expanded: { width: 260, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  collapsed: { width: 72, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const pulseRing = {
  animate: {
    scale: [1, 1.15, 1],
    opacity: [0.7, 0.3, 0.7],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
};

export const floatAnimation = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

export const counterAnimation = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
