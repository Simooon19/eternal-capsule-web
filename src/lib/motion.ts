import { Variants } from "framer-motion";

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.15,
      ease: "easeInOut",
    },
  },
};

export const fadeOut: Variants = {
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: "easeInOut",
    },
  },
  show: { opacity: 1 },
}; 