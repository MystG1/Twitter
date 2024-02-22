import { motion } from "framer-motion";

export default function Logo() {
  return (
    <motion.img
      src="/logo.png"
      alt="logo"
      className="lg:w-[50px] w-8 mx-10  "
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.5,
      }}
      initial={{
        opacity: 0,
        y: -30,
        scale: 0.5,
      }}
    />
  );
}
