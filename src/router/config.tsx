import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Layout from "../components/feature/Layout";
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

const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/orders",
        element: <LiveOrders />,
      },
      {
        path: "/menu",
        element: <MenuManagement />,
      },
      {
        path: "/tables",
        element: <Tables />,
      },
      {
        path: "/inventory",
        element: <Inventory />,
      },
      {
        path: "/reports",
        element: <Reports />,
      },
      {
        path: "/feedback",
        element: <Feedback />,
      },
      {
        path: "/staff",
        element: <Staff />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/profile",
        element: <MyProfile />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;