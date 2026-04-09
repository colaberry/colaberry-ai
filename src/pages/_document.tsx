import { Html, Head, Main, NextScript } from "next/document";

const themeInitScript = `
(() => {
  try {
    const storedTheme = window.localStorage.getItem("theme");
    // Default to dark mode for premium AI platform feel
    // User can toggle to light via the theme switcher — their preference is persisted
    const isDark = storedTheme ? storedTheme === "dark" : true;
    document.documentElement.classList.toggle("dark", isDark);
    if (!storedTheme) window.localStorage.setItem("theme", "dark");
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
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Google Analytics — loaded with consent defaults (denied until user accepts) */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID || "G-F9YN432TTH"}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('consent', 'default', {
                security_storage: 'granted',
                functionality_storage: 'granted',
                analytics_storage: 'denied',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied'
              });
              try {
                var c = JSON.parse(localStorage.getItem('colaberry_cookie_consent_v1') || 'null');
                if (c && c.analytics) gtag('consent', 'update', { analytics_storage: 'granted' });
                if (c && c.marketing) gtag('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
              } catch(e) {}
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID || "G-F9YN432TTH"}', { anonymize_ip: true, transport_type: 'beacon' });
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
