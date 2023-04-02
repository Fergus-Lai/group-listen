import Image from "next/image";
import { Reorder, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { type Song } from "~/interfaces/song";

interface props {
  video: Song;
  removeSong: () => void;
}

const PlaylistCard: React.FC<props> = ({ video, removeSong }) => {
  const artistString = (artists: string[]) => {
    return artists.join(", ");
  };

  return (
    <Reorder.Item
      initial={{ opacity: 0, x: "-100vh" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100vh" }}
      className="mb-2 flex w-full flex-row gap-2 rounded-lg bg-slate-600 p-2"
      value={video}
    >
      {video.thumbnailUrl && video.title && video.artists && (
        <>
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            width={80}
            height={80}
          />
          <div className="flex w-full flex-col">
            <p className="text-left text-lg">{video.title}</p>
            <p className="text-left text-sm text-slate-300">
              {artistString(video.artists)}
            </p>
          </div>
          <motion.button
            className="mr-4"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              removeSong();
            }}
          >
            <FontAwesomeIcon
              icon={faTrash}
              className="flex w-8 items-center justify-center"
            />
          </motion.button>
        </>
      )}
    </Reorder.Item>
  );
};

export default PlaylistCard;
