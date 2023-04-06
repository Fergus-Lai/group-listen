import { motion } from "framer-motion";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const BackToHomeButton: React.FC = () => {
  return (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <Link href="/">
        <FontAwesomeIcon icon={faArrowLeft} className="w-4  " />
      </Link>
    </motion.div>
  );
};

export default BackToHomeButton;
