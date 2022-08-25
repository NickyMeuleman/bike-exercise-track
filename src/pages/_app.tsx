// src/pages/_app.tsx
import { withTRPC } from "@trpc/next";
import type { AppRouter } from "../server/router";
import type { AppType } from "next/dist/shared/lib/utils";
import superjson from "superjson";
import "../styles/globals.css";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const OverlayContainer = dynamic(
  async () => {
    const mod = await import("react-aria");
    return mod.OverlayContainer;
  },
  { ssr: false }
);

const MyApp: AppType = ({ Component, pageProps }) => {
  const { pathname } = useRouter();

  return (
    <OverlayContainer>
      <div className="flex min-h-screen flex-col">
        <div className="flex-1">
          {pathname !== "/" ? <Header /> : null}
          <main>
            <Component {...pageProps} />
          </main>
        </div>
        <Footer />
      </div>
    </OverlayContainer>
  );
};

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }
  if (process.browser) return ""; // Browser should use current path
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`;

    return {
      url,
      transformer: superjson,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp);
