/**
 * Animation Constants - Consolidated Framer Motion variants used across the app
 * Ensures consistent animation timing and easing throughout the UI
 */

/** Standard stagger animation for container elements */
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/** Standard fade-in + slide-up animation for child items */
export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

/** Reduced-motion variants for container (instant transition) */
export const reducedContainerVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

/** Reduced-motion variants for items (instant transition) */
export const reducedItemVariants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

/**
 * List item animation with custom delay based on index
 * Use with custom prop in Framer Motion
 */
export const listItemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, delay: i * 0.04 },
  }),
};
