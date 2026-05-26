import type { Transition } from "framer-motion";

/** Single-target springs (entrance, taps, slides between two states). */
export const springFast: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 20,
};

/** Keyframe / loop / multi-step motion — never pair with spring. */
export const smooth: Transition = {
  duration: 0.45,
  ease: "easeOut",
};

export const smoothIn: Transition = {
  duration: 0.6,
  ease: "easeOut",
};

export const smoothLoop: Transition = {
  duration: 2,
  ease: "easeInOut",
  repeat: Infinity,
};

export const smoothPulse: Transition = {
  duration: 1.5,
  ease: "easeInOut",
  repeat: Infinity,
};

export const smoothLinear: Transition = {
  duration: 20,
  ease: "linear",
  repeat: Infinity,
};

/** Quick UI feedback (hover / tap). */
export const tweenFast: Transition = {
  type: "tween",
  duration: 0.15,
  ease: "easeOut",
};

/** Question slide between worlds */
export const slideTransition: Transition = {
  duration: 0.5,
  ease: "easeInOut",
};

/** Camera pan between result and next world */
export const cameraPan: Transition = {
  duration: 0.7,
  ease: "easeInOut",
};

/** Dim question layer when result shows */
export const dimLayer: Transition = {
  duration: 0.45,
  ease: "easeOut",
};

/** Stage block idle bob */
export const stageBob: Transition = {
  duration: 3,
  ease: "easeInOut",
  repeat: Infinity,
  repeatType: "mirror",
};
