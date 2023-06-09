import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconDefinition } from "@fortawesome/free-brands-svg-icons";
import { SignInButton } from "@clerk/nextjs";

interface LinkProps {
  menuOpen: boolean;
  icon: IconDefinition;
  href: string;
  closedY: number;
}

interface SignInButtonProps {
  menuOpen: boolean;
  icon: IconDefinition;
  closedY: number;
}

interface ButtonProps {
  menuOpen: boolean;
  icon: IconDefinition;
  closedY: number;
  onClick: () => void;
}

const NavLink: React.FC<LinkProps> = (props) => {
  const { menuOpen, icon, href, closedY } = props;
  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.span
          className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900"
          initial={{ opacity: 0, y: closedY }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: closedY }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Link href={href}>
            <FontAwesomeIcon icon={icon} className="h-8 w-8 text-white" />
          </Link>
        </motion.span>
      )}
    </AnimatePresence>
  );
};

const NavSignInButton: React.FC<SignInButtonProps> = (props) => {
  const { menuOpen, icon, closedY } = props;
  return (
    <AnimatePresence>
      {menuOpen && (
        <SignInButton>
          <motion.button
            className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900"
            initial={{ opacity: 0, y: closedY }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: closedY }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FontAwesomeIcon icon={icon} className="h-8 w-8 text-white" />
          </motion.button>
        </SignInButton>
      )}
    </AnimatePresence>
  );
};

const NavButton: React.FC<ButtonProps> = (props) => {
  const { menuOpen, icon, closedY, onClick } = props;
  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.button
          className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900"
          initial={{ opacity: 0, y: closedY }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: closedY }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClick}
        >
          <FontAwesomeIcon icon={icon} className="h-8 w-8 text-white" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export { NavLink, NavButton, NavSignInButton };
