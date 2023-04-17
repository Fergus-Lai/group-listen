import type { Room, Song, User } from "@prisma/client";
import Icon from "./icon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faComments,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const RoomCard: React.FC<{
  room: Room & { playlist: Song[]; users: User[] };
}> = ({ room }) => {
  const owner = room.users.find((user) => user.id === room.ownerId);

  if (!owner) return <></>;

  return (
    <button className="flex h-40 w-full flex-col items-start justify-evenly border-y border-slate-700 py-2 px-4">
      <div className="flex flex-row gap-2 font-bold">
        <div className="h-12 w-12">
          <Icon src={owner.image ?? ""} />
        </div>
        {`${owner.name} ${
          owner.discriminator ? `#${owner.discriminator}` : ""
        }`}
      </div>
      <div className="flex w-full flex-row justify-between">
        <div>Room Code: {room.id}</div>
        <div>
          Currently Playing:{" "}
          {`${room.playlist[room.index]?.title ?? ""}
              -
              ${room.playlist[room.index]?.artist ?? ""}`}
        </div>
      </div>

      <div className="flex flex-row items-center gap-2">
        <FontAwesomeIcon icon={faComments} className="h-4 w-4" />
        <FontAwesomeIcon
          icon={room.chat ? faCheck : faXmark}
          className="h-4 w-4"
        />
        <FontAwesomeIcon icon={faUsers} className="h-4 w-4" />
        {room.users.length}
      </div>
    </button>
  );
};

export default RoomCard;
