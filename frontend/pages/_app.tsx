import type { AppProps } from "next/app";
import Head from "next/head";
import Layout from "@/components/Layout";
import "@/pages/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Quiz Builder</title>
        <meta content="Create and manage custom quizzes" name="description" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
