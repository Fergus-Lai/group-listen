import Image from "next/image";
import { motion } from "framer-motion";
import Icon from "../icon";

const ListenerDetailCard: React.FC<{
  id: string;
  name: string;
  image: string;
  discriminator: string | undefined | null;
  displayTag: boolean;
}> = ({ id, name, image, discriminator, displayTag }) => {
  return (
    <motion.div
      className="absolute top-4 -left-48 z-10 flex w-48 flex-col gap-2 rounded-lg bg-slate-700 p-2"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex w-full flex-col rounded-lg  bg-slate-700 p-2">
        <div className="h-10 w-10">
          <Icon src={image} />
        </div>
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            <div className="truncate text-white">{name}</div>
            <div className="min-h-[1.5rem] text-white">
              {displayTag && discriminator ? `#${discriminator}` : ""}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="rounded-lg bg-red-700 p-2 text-white"
          >
            Report
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ListenerDetailCard;
