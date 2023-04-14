import { type NextPage } from "next";
import Head from "next/head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import Switch from "react-switch";
import { useState } from "react";
import { api } from "~/utils/api";
import { toast } from "react-toastify";

import VideoCard from "~/components/videoRender/videoCard";
import { type MusicVideo } from "node-youtube-music";
import BackToTopButton from "~/components/backToTopButton";
import PlaylistCard from "~/components/playlistRender/playlistCard";
import { type Song } from "~/interfaces/song";
import { useRouter } from "next/router";
import BackToHomeButton from "~/components/backToHomeButton";
import OverlaySpinner from "~/components/utils/overlaySpinner";

const Create: NextPage = () => {
  const [anonymous, setAnonymous] = useState(false);
  const [chat, setChat] = useState(false);
  const [searchTarget, setSearchTarget] = useState("");
  const [result, setResult] = useState<MusicVideo[]>([]);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [creatingRoom, setCreatingRoom] = useState(false);

  const router = useRouter();
  const search = api.youtube.search.useQuery(
    {
      target: searchTarget,
    },
    { enabled: false }
  );

  const { mutateAsync: createRoom } = api.room.create.useMutation();

  return (
    <>
      <Head>
        <title>Create Room • Group Listen</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center gap-2 bg-slate-800 py-8 text-white">
        <BackToTopButton />
        {creatingRoom && (
          <AnimatePresence>
            <OverlaySpinner />
          </AnimatePresence>
        )}
        <div className="flex w-2/3 flex-row items-center gap-2 text-left text-xl font-bold">
          <BackToHomeButton />
          Create a Room
        </div>
        <div className="flex w-2/3 flex-row justify-between">
          Anonymous mode
          <Switch
            onChange={() => void setAnonymous(!anonymous)}
            checked={anonymous}
          />
        </div>
        <div className="flex w-2/3 flex-row justify-between">
          Chat
          <Switch onChange={() => void setChat(!chat)} checked={chat} />
        </div>
        <div className="flex w-2/3 text-left font-semibold">Playlist</div>
        <Reorder.Group
          values={playlist}
          onReorder={setPlaylist}
          className="max-h-[25vh] min-h-0 w-2/3 overflow-x-hidden overflow-y-scroll"
        >
          <AnimatePresence>
            {playlist.map((video) => (
              <PlaylistCard
                key={video.youtubeId}
                video={video}
                removeSong={() =>
                  void setPlaylist(playlist.filter((music) => music !== video))
                }
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>
        <div className="flex w-2/3 justify-end ">
          <motion.button
            className="rounded-lg bg-slate-500 p-2 hover:bg-slate-700"
            onClick={() => {
              toast.info("Creating Room");
              setCreatingRoom(true);
              if (playlist.length <= 0) {
                toast.error("No Song In Playlist");
                setCreatingRoom(false);
                return;
              }
              createRoom({ playlist, anonymous, chat })
                .then((roomId) => {
                  setCreatingRoom(false);
                  void router.push(`/room/${roomId}`);
                })
                .catch(() =>
                  toast.error("Error Occurred Please Try Again Later")
                );
            }}
          >
            Create
          </motion.button>
        </div>
        <div className="flex w-2/3 text-left font-semibold">
          Search (Click To Add To Playlist)
        </div>
        <form
          className="flex w-2/3 flex-row"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            toast("Search In Progress");
            setResult([]);
            void search
              .refetch()
              .then(({ data }) => {
                data && data.length > 0
                  ? setResult(data)
                  : toast.error("No result");
              })
              .catch((e) => void toast.error(JSON.stringify(e)));
          }}
        >
          <input
            name="target"
            className="w-full rounded-l-lg px-2 text-black focus:outline-none"
            value={searchTarget}
            onChange={(e) => {
              setSearchTarget(e.target.value);
              setResult([]);
            }}
          />
          <button className="flex w-1/12 min-w-fit items-center justify-center rounded-r-lg bg-white px-2 text-slate-500">
            <FontAwesomeIcon icon={faSearch} className="w-4" />
          </button>
        </form>
        {result && (
          <div className="flex w-2/3 flex-col gap-2">
            <AnimatePresence initial={false} mode="wait">
              {result.map((video, index) => (
                <VideoCard
                  video={video}
                  key={index}
                  onClick={() => {
                    if (
                      !video.artists ||
                      !video.thumbnailUrl ||
                      !video.title ||
                      !video.youtubeId
                    )
                      return;
                    const localVideo = {
                      thumbnailUrl: video.thumbnailUrl,
                      title: video.title,
                      youtubeId: video.youtubeId,
                      artists: video.artists.map((artist) => artist.name),
                    };
                    if (
                      playlist.findIndex(
                        (playlistVideo) => playlistVideo === localVideo
                      ) === -1
                    ) {
                      setPlaylist([...playlist, localVideo]);
                      toast.success("Song added to playlist");
                    } else {
                      toast.error("Song already in playlist");
                    }
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </>
  );
};

export default Create;
