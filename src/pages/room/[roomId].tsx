import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { env } from "~/env.mjs";
import Pusher from "pusher-js";
import { useEffect, useState } from "react";
import Player from "~/components/videoPlayer";
import { api } from "~/utils/api";
import type { User, Room, Song } from "@prisma/client";
import ListenerCard from "~/components/listener/listenerCard";
import { toast } from "react-toastify";
import { ScaleLoader } from "react-spinners";
import BackToHomeButton from "~/components/backToHomeButton";
import { useUser } from "@clerk/nextjs";
import ReactPlayer from "react-player/youtube";

interface RoomData extends Room {
  users: User[];
}

const Home: NextPage = () => {
  const router = useRouter();
  const {
    user,
    isLoaded: userIsLoaded,
    isSignedIn: userIsSignedIn,
  } = useUser();
  const { roomId } = router.query;
  const [song, setSong] = useState<Song | undefined>(undefined);
  const [room, setRoom] = useState<RoomData | undefined>(undefined);

  const { mutateAsync: connectRoom, isLoading: roomLoading } =
    api.room.connected.useMutation();
  const { mutateAsync: disconnectRoom } = api.room.disconnected.useMutation();

  const { mutate: songEnded } = api.room.songEnded.useMutation();

  const pusher: Pusher = new Pusher(env.NEXT_PUBLIC_PUSHER_APP_KEY, {
    cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
  });

  const endHandler = () => {
    if (!room || !user) return;
    if (room.ownerId !== user.id) return;
    songEnded();
  };

  useEffect(() => {
    if (!roomId) return;
    if (typeof roomId !== "string" || !/[A-Z0-9]{6}/.test(roomId)) {
      if (!toast.isActive("invalidRoomId"))
        toast.error("Invalid Room Id", { toastId: "invalidRoomId" });
      void router.push("/");
      return;
    }
    connectRoom({ roomId })
      .then((roomData) => {
        setRoom(roomData);
        if (roomData.index >= roomData.playlist.length) return;
        setSong(roomData.playlist[roomData.index]);
        const channel = pusher.subscribe(roomId);
        channel.bind("newSong", ({ newSong }: { newSong: Song }): void => {
          setSong(newSong);
        });
        channel.bind("connected", ({ user }: { user: User }): void => {
          if (!room) return;
          const tempRoom = room;
          tempRoom.users.push(user);
          setRoom(tempRoom);
        });
        channel.bind("disconnected", ({ user }: { user: User }): void => {
          if (!room) return;
          const tempRoom = room;
          tempRoom.users = tempRoom.users.filter((x) => x.id !== user.id);
          setRoom(tempRoom);
        });
        channel.bind("closed", () => {
          if (!toast.isActive("roomCloseToast"))
            toast.warning("Room Closed", { toastId: "roomCloseToast" });
          void router.push("/");
        });
      })
      .catch((error: Error) => {
        if (error.message === "Room Not Found") {
          if (!toast.isActive("roomNotFound"))
            toast.error("Room Not Found", { toastId: "roomNotFound" });
          void router.push("/");
        }
      });
  }, [roomId]);

  useEffect(() => {
    return () => {
      pusher.disconnect();
      if (room) {
        disconnectRoom({
          roomId: room.id,
          owner: room.ownerId === (user ? user.id : false),
        }).catch((e) => console.log(e));
      }
    };
  }, [room]);

  return (
    <>
      <Head>
        <title>Group Listen</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-start overflow-y-auto bg-slate-800 py-4 sm:flex-row sm:items-start sm:justify-center">
        {roomLoading || !userIsLoaded ? (
          <div className="flex min-h-screen min-w-full items-center justify-center">
            <ScaleLoader color={"#cbd5e1"} />
          </div>
        ) : (
          room && (
            <>
              <div className="mx-2 flex h-full w-80 flex-col gap-2">
                <div className="flex flex-row gap-2 font-semibold text-white">
                  <BackToHomeButton />
                  Room: {roomId}
                </div>
                <ReactPlayer
                  url={`https://www.youtube.com/watch?v=${
                    song ? song.youtubeId : "t6gl5OYUZCE"
                  }`}
                  playing={true}
                  width="300px"
                  height="300px"
                  onEnded={endHandler}
                />
                <p className="h-6 font-semibold text-white">
                  {song ? (song.title ? song.title : "") : ""}
                </p>
                <p className="h-6 text-sm text-slate-300">
                  {song ? (song.artist ? song.artist : "") : ""}
                </p>
              </div>
              <div className="mx-2 flex h-full w-80 flex-col md:w-1/3">
                <div className="w-full ">
                  <div className="font-semibold text-white">Listeners</div>
                  {room.users.map((user) => (
                    <ListenerCard user={user} key={user.id} />
                  ))}
                </div>
                {room.chat && (
                  <>
                    <div className="font-semibold text-white">Chat</div>
                  </>
                )}
              </div>
            </>
          )
        )}
      </main>
    </>
  );
};

export default Home;
