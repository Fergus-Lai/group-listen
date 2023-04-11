import { Routes, type RESTGetAPIUserResult } from "discord-api-types/v9";
import { REST } from "@discordjs/rest";

import { env } from "~/env.mjs";

const getDiscordUser = async (userId: string) => {
  const rest = new REST().setToken(env.DISCORD_TOKEN);
  return (await rest.get(Routes.user(userId))) as Promise<RESTGetAPIUserResult>;
};

export default getDiscordUser;
