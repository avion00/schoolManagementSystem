import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ProjectProvider } from "../components/hermes/ProjectProvider";
import { AuthProvider, useAuth } from "../components/hermes/AuthProvider";
import { AppShell } from "../components/hermes/AppShell";
import { Toaster } from "../components/ui/sonner";
import { useNavigate, useRouterState } from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This Hermes page doesn't exist yet.
        </p>
        <div className="mt-6">
          <a href="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Back to Command Center
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Try again</button>
          <a href="/" className="rounded-md border px-4 py-2 text-sm font-medium">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Hermes — Organic Growth Intelligence" },
      { name: "description", content: "Hermes helps businesses grow organically by finding proven viral content, learning why it works, and producing original content that fits." },
      { property: "og:title", content: "Hermes — Organic Growth Intelligence" },
      { property: "og:description", content: "Find viral patterns, produce original content, and grow organically — without ads." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProjectProvider>
          <AuthGate />
          <Toaster />
        </ProjectProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const adminOnlyPaths = ["/", "/projects", "/opportunity", "/research", "/patterns", "/production", "/approvals", "/calendar", "/engagement", "/performance", "/cmo", "/accounts", "/system", "/settings"];
const creatorPaths = ["/my-work", "/tasks", "/revisions", "/completed", "/profile"];

function AuthGate() {
  const { user, hydrated } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isAuthRoute = pathname === "/auth";

  useEffect(() => {
    if (!hydrated) return;
    if (!user && !isAuthRoute) {
      navigate({ to: "/auth", replace: true });
      return;
    }
    if (user && isAuthRoute) {
      if (user.role === "admin") navigate({ to: "/", replace: true });
      else navigate({ to: "/my-work", replace: true });
      return;
    }
    if (user?.role === "creator") {
      const allowed = creatorPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
      if (!allowed && !isAuthRoute) navigate({ to: "/my-work", replace: true });
    }
    if (user?.role === "admin") {
      // admins can visit anything except creator-only pages
      if (creatorPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
        // allow — admin may want to preview creator UI
      }
      void adminOnlyPaths;
    }
  }, [hydrated, user, pathname, isAuthRoute, navigate]);

  if (!hydrated) return null;
  if (isAuthRoute || !user) return <Outlet />;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
