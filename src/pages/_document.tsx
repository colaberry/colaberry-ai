import { Html, Head, Main, NextScript } from "next/document";

const themeInitScript = `
(() => {
  try {
    const storedTheme = window.localStorage.getItem("theme");
    const isDark = storedTheme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
  } catch (_) {}
})();
`;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        {/* CMS preconnect for faster image/data loading */}
        {process.env.NEXT_PUBLIC_CMS_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_CMS_URL.replace(/\/$/, "")} crossOrigin="anonymous" />
        )}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
