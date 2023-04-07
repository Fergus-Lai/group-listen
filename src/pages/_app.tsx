import { type AppType } from "next/app";
import { type Session } from "next-auth";

import { ClerkProvider } from "@clerk/nextjs";

import type { AppProps } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";

import { ToastContainer } from "react-toastify";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps,
}) => {
  return (
    <ClerkProvider {...pageProps}>
      <ToastContainer theme="dark" />
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
