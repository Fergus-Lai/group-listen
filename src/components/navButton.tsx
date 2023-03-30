import Link from "next/link";
import { motion } from "framer-motion";
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
    <Link href={href} hidden={!menuOpen}>
      <motion.span
        className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900"
        animate={menuOpen ? "open" : "closed"}
        variants={{
          open: { opacity: 1, y: 0 },
          closed: { opacity: 0, y: closedY },
        }}
      >
        <FontAwesomeIcon icon={icon} className="h-8 w-8 text-white" />
      </motion.span>
    </Link>
  );
};

export default NavButton;
