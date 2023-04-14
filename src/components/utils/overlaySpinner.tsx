import Backdrop from "./backdrop";
import Spinner from "./spinner";

const OverlaySpinner = () => {
  return (
    <Backdrop>
      <Spinner />
    </Backdrop>
  );
};

export default OverlaySpinner;
