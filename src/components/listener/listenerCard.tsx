import Icon from "../icon";
import { useState } from "react";
import ListenerDetailCard from "./listenerDetailCard";
import { AnimatePresence } from "framer-motion";
import type { UserData } from "~/interfaces/userData";

const ListenerCard: React.FC<{
  user: UserData;
}> = ({ user }) => {
  const [showDetail, setShowDetail] = useState(false);
  user.image ??= "";
  const { id, name, image, discriminator, displayTag } = user;
  if (!name) return <></>;
  return (
    <div className="relative">
      <AnimatePresence>
        {showDetail && (
          <ListenerDetailCard
            name={name}
            id={id}
            image={image}
            discriminator={discriminator}
            displayTag={displayTag}
          />
        )}
      </AnimatePresence>
      <button
        onClick={() => void setShowDetail(!showDetail)}
        className="mt-2 flex h-16 w-full flex-row items-center gap-2 rounded-lg bg-slate-900 p-2 text-slate-300"
      >
        <div className="relative h-10 w-10 rounded-full">
          <Icon src={image ? image : ""} />
        </div>
        <div className="truncate">{name}</div>
      </button>
    </div>
  );
};

export default ListenerCard;
