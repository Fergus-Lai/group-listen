import VideoCard from "./videoCard";
import { type MusicVideo } from "node-youtube-music";

const VideoList: React.FC<{ videos: MusicVideo[] }> = ({ videos }) => {
  return (
    <div className="flex w-2/3 flex-col">
      {videos.map((video, index) => (
        <VideoCard video={video} key={index} />
      ))}
    </div>
  );
};

export default VideoList;
