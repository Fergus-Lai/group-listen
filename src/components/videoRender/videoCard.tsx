import { type MusicVideo, type Artist } from "node-youtube-music";
import Image from "next/image";
import { motion } from "framer-motion";

interface props {
  video: MusicVideo;
  onClick: () => void;
}

const VideoCard: React.FC<props> = ({ video, onClick }) => {
  const artistString = (artists: Artist[]) => {
    return artists.map((artist) => artist.name).join(", ");
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: "-100vh" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100vh" }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="flex w-full flex-row gap-2 rounded-lg bg-slate-600 p-2"
      onClick={onClick}
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
        </>
      )}
    </motion.button>
  );
};

export default VideoCard;
