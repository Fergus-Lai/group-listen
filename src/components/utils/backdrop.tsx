import { motion } from "framer-motion";

interface props {
  children: React.ReactNode;
  onClick: () => void;
}

const Backdrop: React.FC<props> = (props) => {
  const { children, onClick } = props;
  return (
    <motion.div
      className="absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center bg-black bg-opacity-50"
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
};

export default Backdrop;
