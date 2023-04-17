import Backdrop from "../utils/backdrop";

interface props {
  closeHandler: () => void;
}

const InRoomModal: React.FC<props> = ({ closeHandler }) => {
  return (
    <Backdrop onClick={closeHandler}>
      <div
        className="flex h-48 w-1/2 flex-col justify-between rounded-lg bg-slate-800 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="text-lg font-semibold text-white">Entering Room</div>
          <div>
            You are currently in a room, please leave the room first to enter or
            create a new room.
          </div>
          <div>Not in a room? Contact support for help.</div>
        </div>
        <div className="relative mb-4 flex flex-row justify-end gap-4 self-end">
          <button
            className="w-24 rounded-lg bg-slate-600 p-2 hover:opacity-50"
            onClick={() => void closeHandler()}
          >
            Close
          </button>
        </div>
      </div>
    </Backdrop>
  );
};

export default InRoomModal;
