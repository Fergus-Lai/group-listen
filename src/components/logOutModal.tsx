import Backdrop from "./utils/backdrop";
import { useClerk } from "@clerk/clerk-react";

interface props {
  closeHandler: () => void;
}

const LogOutModal: React.FC<props> = (props) => {
  const { closeHandler } = props;
  const { signOut } = useClerk();
  return (
    <Backdrop onClick={closeHandler}>
      <div className="flex h-48 w-1/2 flex-col justify-between rounded-lg bg-slate-800 p-4">
        <div>
          <div className="text-lg font-semibold text-white">Log Out</div>
          <div>Are you sure you want to log out?</div>
        </div>
        <div className="relative mb-4 flex flex-row justify-end gap-4 self-end">
          <button
            className="w-24 hover:underline"
            onClick={() => void closeHandler()}
          >
            Cancel
          </button>
          <button
            className="w-24 rounded-lg bg-red-500 p-2 hover:opacity-50"
            onClick={() => void signOut()}
          >
            Log Out
          </button>
        </div>
      </div>
    </Backdrop>
  );
};

export default LogOutModal;
