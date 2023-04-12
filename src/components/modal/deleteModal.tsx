import Backdrop from "../utils/backdrop";

interface props {
  closeHandler: () => void;
  deleteHandler: () => Promise<void>;
}

const DeleteModal: React.FC<props> = ({ closeHandler, deleteHandler }) => {
  return (
    <Backdrop onClick={closeHandler}>
      <div className="flex h-48 w-1/2 flex-col justify-between rounded-lg bg-slate-800 p-4">
        <div>
          <div className="text-lg font-semibold text-white">Delete Account</div>
          <div>Are you sure you want to delete your account?</div>
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
            onClick={() => void deleteHandler()}
          >
            Delete
          </button>
        </div>
      </div>
    </Backdrop>
  );
};

export default DeleteModal;
