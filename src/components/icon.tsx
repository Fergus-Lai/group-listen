import Image from "next/image";
import { useEffect } from "react";

interface props {
  src: string | null;
}

const Icon: React.FC<props> = (prop) => {
  const { src } = prop;

  return (
    <Image
      width={128}
      height={128}
      src={!!src ? src : "/blankIcon.webp"}
      alt="icon"
      className="rounded-full"
    />
  );
};

export default Icon;
