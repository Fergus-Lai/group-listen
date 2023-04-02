import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsUpToLine } from "@fortawesome/free-solid-svg-icons";

const BackToTopButton: React.FC = () => {
  return (
    <motion.button
      className="fixed bottom-8 left-8 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => void window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <FontAwesomeIcon icon={faArrowsUpToLine} className="h-8 w-8 text-white" />
    </motion.button>
  );
};

export default BackToTopButton;
