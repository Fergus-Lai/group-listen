import { type MusicVideo, type Artist } from "node-youtube-music";
import Image from "next/image";

interface props {
  video: MusicVideo;
}

const VideoCard: React.FC<props> = (props) => {
  const artistString = (artists: Artist[]) => {
    return artists.map((artist) => artist.name).join(", ");
  };

  const { video } = props;

  return (
    <div className="flex w-full flex-row gap-2">
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
    </div>
  );
};

export default VideoCard;
