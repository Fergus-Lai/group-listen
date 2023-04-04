import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { env } from "~/env.mjs";
import Pusher from "pusher-js";
import { useEffect, useState } from "react";
import { type Song } from "~/interfaces/song";
import Player from "~/components/videoPlayer";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { type Room } from "@prisma/client";
import type { UserData } from "~/interfaces/userData";
import ListenerCard from "~/components/listener/listenerCard";

interface RoomData extends Room {
  users: {
    id: string;
    name: string | null;
    image: string | null;
    discriminator: string | null;
    displayTag: boolean;
  }[];
}

const Home: NextPage = () => {
  const router = useRouter();
  const { data: sessionData, status: sessionStatus } = useSession();
  const { roomId } = router.query;
  const [song, setSong] = useState<Song | undefined>(undefined);
  const [room, setRoom] = useState<RoomData | undefined>(undefined);

  const { mutateAsync: connectRoom } = api.room.connected.useMutation();

  const endHandler = () => {};

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (typeof roomId !== "string" || !/[A-Z0-9]{6}/.test(roomId)) {
      void router.push("/");
      return;
    }
    const pusher = new Pusher(env.NEXT_PUBLIC_PUSHER_APP_KEY, {
      cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
    void connectRoom({ roomId })
      .then((roomData) => {
        setRoom(roomData);
      })
      .catch((error) => void router.push("/"));
    const channel = pusher.subscribe(roomId);
    channel.bind("newSong", ({ newSong }: { newSong: Song }): void => {
      setSong(newSong);
    });
    channel.bind("connected", ({ user }: { user: UserData }): void => {
      const tempRoom = room;
      if (!tempRoom) return;
      tempRoom.users.push(user);
      setRoom(tempRoom);
    });
    return () => {
      pusher.disconnect();
    };
  }, [sessionStatus]);

  return (
    <>
      <Head>
        <title>Group Listen</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-start overflow-y-auto bg-slate-800 py-4 sm:flex-row sm:items-start sm:justify-center">
        {room && (
          <>
            <div className="mx-2 flex h-full w-80 flex-col gap-2">
              <p className="font-semibold text-white">Room: {roomId}</p>
              <Player
                id={song ? song.youtubeId : undefined}
                onEnd={endHandler}
              />
              <p className="h-6 font-semibold text-white">
                {song ? (song.title ? song.title : "") : ""}
              </p>
              <p className="h-6 text-sm text-slate-300">
                {song ? (song.artists ? song.artists : "") : ""}
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
        )}
      </main>
    </>
  );
};

export default Home;
