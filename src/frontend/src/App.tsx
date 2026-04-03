import { Toaster } from "@/components/ui/sonner";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import FeedPage from "./components/feed/FeedPage";
import AppLayout from "./components/layout/AppLayout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useCallerProfile } from "./hooks/useQueries";
import AdminPage from "./pages/AdminPage";
import ExplorePage from "./pages/ExplorePage";
import LandingPage from "./pages/LandingPage";
import MessagesPage from "./pages/MessagesPage";
import NotificationsPage from "./pages/NotificationsPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProfilePage from "./pages/ProfilePage";
import TimelinePage from "./pages/TimelinePage";

// ---- Route definitions ----
const rootRoute = createRootRoute({
  component: RootComponent,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: AppLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: HomeWrapper,
});

const exploreRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/explore",
  component: ExplorePage,
});

const timelineRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/timeline",
  component: TimelinePage,
});

const messagesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/messages",
  component: MessagesPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/notifications",
  component: NotificationsPage,
});

const profileRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/profile",
  component: () => <ProfilePage />,
});

const profileByIdRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/profile/$principalId",
  component: ProfileByIdPage,
});

function ProfileByIdPage() {
  const params = profileByIdRoute.useParams();
  return <ProfilePage principalId={params.principalId} />;
}

const adminRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    homeRoute,
    exploreRoute,
    timelineRoute,
    messagesRoute,
    notificationsRoute,
    profileRoute,
    profileByIdRoute,
    adminRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ---- Home wrapper: shows landing or feed based on auth ----
function HomeWrapper() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !profileLoading && profile === null) {
      setShowOnboarding(true);
    } else if (profile) {
      setShowOnboarding(false);
    }
  }, [isAuthenticated, profile, profileLoading]);

  if (showOnboarding) {
    return <OnboardingPage onComplete={() => setShowOnboarding(false)} />;
  }

  if (!isAuthenticated && !isInitializing) {
    return <LandingPage />;
  }

  return <FeedPage />;
}

// ---- Root component ----
function RootComponent() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}

export default function App() {
  return <RouterProvider router={router} />;
}
