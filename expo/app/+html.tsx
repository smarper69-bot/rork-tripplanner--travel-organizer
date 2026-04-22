import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

/**
 * Root HTML document for the Expo Router web build.
 * This file is only rendered on web — it has no effect on native.
 *
 * Served at tripnest.app when the static web build is deployed.
 * The .well-known/apple-app-site-association and assetlinks.json files
 * in public/.well-known/ must also be deployed for Universal Links /
 * App Links to work on iOS and Android respectively.
 */
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/*
          iOS Smart App Banner.
          Replace APP_STORE_ID with the numeric App Store app ID once the app
          is listed. Until then this tag is present but inactive.
          The banner appears in Safari and lets users open / install the app.
        */}
        <meta
          name="apple-itunes-app"
          content="app-id=APP_STORE_ID"
        />

        {/* Prevent iOS from auto-linking phone numbers / addresses in invite pages */}
        <meta name="format-detection" content="telephone=no, address=no, email=no" />

        {/* Allow iOS to run as a standalone web app if added to home screen */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TripNest" />

        <title>TripNest</title>

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
