import Icon from "../icon";
import { useState } from "react";
import ListenerDetailCard from "./listenerDetailCard";
import { AnimatePresence } from "framer-motion";
import type { User } from "@prisma/client";

const ListenerCard: React.FC<{
  user: User;
}> = ({ user }) => {
  const [showDetail, setShowDetail] = useState(false);
  if (!user.name) return <></>;
  return (
    <div className="relative">
      <AnimatePresence>
        {showDetail && <ListenerDetailCard user={user} />}
      </AnimatePresence>
      <button
        onClick={() => void setShowDetail(!showDetail)}
        className="mt-2 flex h-16 w-full flex-row items-center gap-2 rounded-lg bg-slate-900 p-2 text-slate-300"
      >
        <div className="relative h-10 w-10 rounded-full">
          <Icon src={user.image ?? ""} />
        </div>
        <div className="truncate">{user.name}</div>
      </button>
    </div>
  );
};

export default ListenerCard;
