import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { env } from "~/env.mjs";
import Pusher, { type Channel } from "pusher-js";
import { useEffect, useState, useRef } from "react";
import { api } from "~/utils/api";
import type { User, Room, Song } from "@prisma/client";
import ListenerCard from "~/components/listener/listenerCard";
import { toast } from "react-toastify";
import BackToHomeButton from "~/components/backToHomeButton";
import { useUser } from "@clerk/nextjs";
import ReactPlayer from "react-player/youtube";
import Spinner from "~/components/utils/spinner";
import Chat from "~/components/chat";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faForwardStep,
  faBackwardStep,
  faPlay,
  faPause,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";

interface RoomData extends Room {
  users: User[];
}

const Home: NextPage = () => {
  const router = useRouter();
  const { user, isLoaded: userIsLoaded } = useUser();
  const { roomId } = router.query;
  const [song, setSong] = useState<Song | undefined>(undefined);
  const [room, setRoom] = useState<RoomData | undefined>(undefined);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chat, setChat] = useState<{ name: string; message: string }[]>([]);
  const [pusher, setPusher] = useState<Pusher | undefined>();
  const [channel, setChannel] = useState<Channel | undefined>();
  const [volume, setVolume] = useState(50);
  const [playing, setPlaying] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);

  const { mutateAsync: connectRoom, isLoading: roomLoading } =
    api.room.connected.useMutation();
  const { mutateAsync: disconnectRoom } = api.room.disconnected.useMutation();

  const { mutate: songEnded } = api.room.songEnded.useMutation();

  const { mutateAsync: sendMessage } = api.room.sendMessage.useMutation();

  const { mutate: songStateChange } = api.room.songStateChange.useMutation();

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
        if (!pusher) {
          setPusher(
            new Pusher(env.NEXT_PUBLIC_PUSHER_APP_KEY, {
              cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
              forceTLS: false,
            })
          );
        }
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
    const cleanUp = () => {
      disconnectRoom().catch((e) => console.log(e));
    };

    window.addEventListener("beforeunload", cleanUp);
    return () => {
      window.removeEventListener("beforeunload", cleanUp);
    };
  }, []);

  useEffect(() => {
    const exitingFunction = () => {
      disconnectRoom().catch((e) => console.log(e));
    };

    router.events.on("routeChangeStart", exitingFunction);

    return () => {
      router.events.off("routeChangeStart", exitingFunction);
    };
  }, [router]);

  useEffect(() => {
    if (typeof roomId !== "string" || !pusher) return;
    setChannel(pusher.subscribe("room-" + roomId));
    return () => {
      if (typeof roomId !== "string" || !pusher) return;
      pusher.unsubscribe("room-" + roomId);
    };
  }, [pusher]);

  useEffect(() => {
    if (!channel) return;
    channel.bind("new-song", ({ newSong }: { newSong: Song }): void => {
      setSong(newSong);
    });
    channel.bind("user-connected", ({ user }: { user: User }): void => {
      if (!room) return;
      const tempRoom = room;
      tempRoom.users.push(user);
      setRoom(tempRoom);
    });
    channel.bind("user-disconnected", ({ user }: { user: User }): void => {
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
    channel.bind(
      "new-message",
      ({ message }: { message: { name: string; message: string } }) => {
        const tempChat = chat;
        tempChat.push(message);
        setChat(tempChat);
      }
    );
    channel.bind(
      "song-state",
      ({ playing: pusherPlaying }: { playing: boolean }) => {
        setPlaying(pusherPlaying);
      }
    );
    return () => {
      if (!channel) return;
      channel.unbind_all();
    };
  }, [channel]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatRef.current?.scrollHeight]);

  return (
    <>
      <Head>
        <title>Group Listen</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-start overflow-y-auto bg-slate-800 py-4 sm:flex-row sm:items-start sm:justify-center">
        {roomLoading || !userIsLoaded ? (
          <Spinner />
        ) : (
          room &&
          user && (
            <>
              <div className="mx-2 flex h-full w-96 flex-col gap-2">
                <div className="flex w-80 flex-row gap-2 font-semibold text-white">
                  <BackToHomeButton />
                  Room: {roomId}
                </div>
                <ReactPlayer
                  url={`https://www.youtube.com/watch?v=${
                    song ? song.youtubeId : "t6gl5OYUZCE"
                  }`}
                  playing={playing}
                  volume={volume / 100}
                  width="384px"
                  height="384px"
                  onEnded={endHandler}
                  onPlay={() => {
                    if (room.ownerId === user.id)
                      songStateChange({ playing: true });
                    else setPlaying(true);
                  }}
                  onPause={() => {
                    if (room.ownerId === user.id)
                      songStateChange({ playing: false });
                    else setPlaying(false);
                  }}
                />
                <div className="flex flex-row justify-between">
                  <div className="flex w-1/3 flex-col justify-between">
                    <p className="h-6 w-full truncate font-semibold text-white">
                      {song ? (song.title ? song.title : "") : ""}
                    </p>
                    <p className="h-6 text-ellipsis text-sm text-slate-300">
                      {song ? (song.artist ? song.artist : "") : ""}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                  >
                    <FontAwesomeIcon
                      icon={faHeart}
                      className="h-8 w-8 text-slate-100"
                    />
                  </motion.button>
                  <div className="flex w-1/3 flex-col gap-2">
                    <div className="text-right text-slate-100">
                      Volume: {volume}
                    </div>
                    <input
                      id="volumeSlider"
                      type="range"
                      value={volume}
                      min={0}
                      max={100}
                      onChange={(e) => {
                        setVolume(Number(e.target.value));
                      }}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-slate-100"
                    ></input>
                  </div>
                </div>
                {room.ownerId === user.id && (
                  <div className="flex h-16 flex-row justify-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                    >
                      <FontAwesomeIcon
                        icon={faBackwardStep}
                        className="h-8 w-8 text-slate-100"
                      />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                      onClick={() => {
                        songStateChange({ playing: !playing });
                      }}
                    >
                      <FontAwesomeIcon
                        icon={playing ? faPause : faPlay}
                        className="h-8 w-8 text-slate-100"
                      />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                    >
                      <FontAwesomeIcon
                        icon={faForwardStep}
                        className="h-8 w-8 text-slate-100"
                      />
                    </motion.button>
                  </div>
                )}
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
                    <Chat
                      ref={chatRef}
                      messages={chat}
                      disabled={sendingMessage}
                      submit={(msg) => {
                        toast.info("Sending Message");
                        setSendingMessage(true);
                        sendMessage({ message: msg })
                          .then(() => {
                            toast.success("Message Sent");
                          })
                          .catch(() => {
                            toast.error(
                              "Unknown Error Occurred. Please Try Again"
                            );
                          })
                          .finally(() => {
                            setSendingMessage(false);
                          });
                      }}
                    />
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
