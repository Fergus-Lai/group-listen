import { motion } from "framer-motion";
import Icon from "../icon";
import type { User } from "@prisma/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarning } from "@fortawesome/free-solid-svg-icons";

const ListenerDetailCard: React.FC<{ user: User }> = ({ user }) => {
  return (
    <motion.div
      className="absolute top-4 -left-48 z-10 flex w-48 flex-col gap-2 rounded-lg bg-slate-700 p-2"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex w-full flex-col rounded-lg  bg-slate-700 p-2">
        <div className="h-10 w-10">
          <Icon src={user.image} />
        </div>
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            <div className="truncate">{user.name}</div>
            <div className="min-h-[1.5rem] text-slate-300">
              {user.discriminator ? `#${user.discriminator}` : ""}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="h-6 rounded-lg bg-red-700 px-4 text-white"
          >
            <FontAwesomeIcon icon={faWarning} className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ListenerDetailCard;
