import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconDefinition } from "@fortawesome/free-brands-svg-icons";

interface props {
  menuOpen: boolean;
  icon: IconDefinition;
  href: string;
  closedY: number;
}

const NavButton: React.FC<props> = (props) => {
  const { menuOpen, icon, href, closedY } = props;
  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.span
          className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900"
          initial={{ opacity: 0, y: closedY }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: closedY }}
        >
          <Link href={href}>
            <FontAwesomeIcon icon={icon} className="h-8 w-8 text-white" />
          </Link>
        </motion.span>
      )}
    </AnimatePresence>
  );
};

export default NavButton;
