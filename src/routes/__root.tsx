// src/routes/__root.tsx
/// <reference types="vite/client" />
import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  ClientOnly,
} from "@tanstack/react-router";
import appCss from "@/styles/globals.css?url";
import { ThemeProvider } from "@/utils/theme-provider";
import {seo} from "@/utils/seo.ts"
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import favicon from "/favicon.ico";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: "Element AI",
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "icon",
        href: favicon,
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <ClientOnly>
        <ThemeProvider defaultTheme="dark" storageKey="mira-ui-theme">
          <Outlet />
        </ThemeProvider>
      </ClientOnly>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
        <TanStackRouterDevtools />
      </body>
    </html>
  );
}
