import { ScaleLoader } from "react-spinners";

const Spinner = () => {
  return (
    <div className="flex min-h-screen min-w-full items-center justify-center">
      <ScaleLoader color={"#cbd5e1"} />
    </div>
  );
};

export default Spinner;
