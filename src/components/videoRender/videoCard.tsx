import { type MusicVideo, type Artist } from "node-youtube-music";
import Image from "next/image";
import { motion } from "framer-motion";

interface props {
  video: MusicVideo;
}

const slideIn = {
  hidden: { x: "-100vh", opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: "100vh", opacity: 0 },
};

const VideoCard: React.FC<props> = (props) => {
  const artistString = (artists: Artist[]) => {
    return artists.map((artist) => artist.name).join(", ");
  };

  const { video } = props;

  return (
    <motion.div
      initial={{ opacity: 0, x: "-100vh" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100vh" }}
      className="flex w-full flex-row gap-2 rounded-lg bg-slate-600 p-2"
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
            <p className="text-lg">{video.title}</p>
            <p className="text-sm text-slate-300">
              {artistString(video.artists)}
            </p>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default VideoCard;
