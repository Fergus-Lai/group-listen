import Image from "next/image";

interface props {
  src: string;
}

const Icon: React.FC<props> = (prop) => {
  const { src } = prop;
  return (
    <Image
      width={128}
      height={128}
      src={src}
      alt="icon"
      className="rounded-full"
    />
  );
};

export default Icon;
