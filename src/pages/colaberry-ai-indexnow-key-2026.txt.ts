import type { GetServerSideProps } from "next";

/**
 * IndexNow key verification file.
 * Bing/Yandex fetch this to verify ownership before accepting URL submissions.
 * Must return the key as plain text at /{key}.txt
 */

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "colaberry-ai-indexnow-key-2026";

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=172800");
  res.write(INDEXNOW_KEY);
  res.end();
  return { props: {} };
};

export default function IndexNowKey() {
  return null;
}
