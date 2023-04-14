import { type AppType } from "next/app";

import { ClerkProvider } from "@clerk/nextjs";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";

import { ToastContainer } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";

const MyApp: AppType = ({ Component, pageProps }) => {
  const router = useRouter();
  return (
    <ClerkProvider {...pageProps}>
      <ToastContainer theme="dark" />
      <AnimatePresence mode="wait">
        <motion.div
          key={router.route}
          initial={{ opacity: 0, x: "-100vh" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100vh" }}
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
