import YouTube, { type YouTubeEvent, type YouTubeProps } from "react-youtube";

const Player: React.FC<{
  id: string | undefined;
  onEnd: () => void;
}> = ({ id, onEnd }) => {
  const onPlayerReady: YouTubeProps["onReady"] = (event: YouTubeEvent) => {
    // access to player in all event handlers via event.target

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    event.target.pauseVideo();
  };

  return (
    <YouTube
      onReady={onPlayerReady}
      videoId={id}
      onEnd={onEnd}
      opts={{
        width: "320",
        height: "320",
        playerVars: {
          // https://developers.google.com/youtube/player_parameters
          autoplay: 1,
        },
      }}
    />
  );
};

export default Player;
