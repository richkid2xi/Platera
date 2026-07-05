import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Layout from "../components/feature/Layout";
import ProtectedRoute from "../components/feature/ProtectedRoute";
import Dashboard from "../pages/dashboard/page";
import LiveOrders from "../pages/orders/page";
import MenuManagement from "../pages/menu/page";
import Tables from "../pages/tables/page";
import Inventory from "../pages/inventory/page";
import Reports from "../pages/reports/page";
import Feedback from "../pages/feedback/page";
import Staff from "../pages/staff/page";
import Settings from "../pages/settings/page";
import MyProfile from "../pages/profile/page";
import SignIn from "../pages/auth/SignIn";
import SignUp from "../pages/auth/SignUp";
import Terms from "../pages/legal/Terms";
import Privacy from "../pages/legal/Privacy";

const routes: RouteObject[] = [
  // ── Public auth / legal routes ──
  { path: "/", element: <SignIn /> },
  { path: "/sign-in", element: <SignIn /> },
  { path: "/sign-up", element: <SignUp /> },
  { path: "/terms", element: <Terms /> },
  { path: "/privacy", element: <Privacy /> },

  // ── Protected app routes ──
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/orders", element: <LiveOrders /> },
          { path: "/menu", element: <MenuManagement /> },
          { path: "/tables", element: <Tables /> },
          { path: "/inventory", element: <Inventory /> },
          { path: "/reports", element: <Reports /> },
          { path: "/feedback", element: <Feedback /> },
          { path: "/staff", element: <Staff /> },
          { path: "/settings", element: <Settings /> },
          { path: "/profile", element: <MyProfile /> },
        ],
      },
    ],
  },

  // ── Fallback ──
  { path: "*", element: <NotFound /> },
];

export default routes;