import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Layout from "../components/feature/Layout";
import ProtectedRoute from "../components/feature/ProtectedRoute";
import { NAV_PERMISSIONS } from "../config/permissions";
import Dashboard from "../pages/dashboard/page";
import LiveOrders from "../pages/orders/page";
import MenuManagement from "../pages/menu/page";
import Tables from "../pages/tables/page";
import Inventory from "../pages/inventory/page";
import Reports from "../pages/reports/page";
import Feedback from "../pages/feedback/page";
import Staff from "../pages/staff/page";
import Settings from "../pages/settings/page";
import AuditLog from "../pages/audit/page";
import MyProfile from "../pages/profile/page";
import SignIn from "../pages/auth/SignIn";
import SignUp from "../pages/auth/SignUp";
import Terms from "../pages/legal/Terms";
import Privacy from "../pages/legal/Privacy";
import OrderPlaceholder from "../pages/order/page";

const routes: RouteObject[] = [
  // ── Public auth / legal routes ──
  { path: "/", element: <SignIn /> },
  { path: "/sign-in", element: <SignIn /> },
  { path: "/sign-up", element: <SignUp /> },
  { path: "/terms", element: <Terms /> },
  { path: "/privacy", element: <Privacy /> },
  { path: "/order/:token", element: <OrderPlaceholder /> },

  // ── Protected app routes ──
  {
    element: <ProtectedRoute />, // Base authentication check
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/dashboard", element: <ProtectedRoute allowedRoles={NAV_PERMISSIONS['/dashboard']}><Dashboard /></ProtectedRoute> },
          { path: "/orders", element: <ProtectedRoute allowedRoles={NAV_PERMISSIONS['/orders']}><LiveOrders /></ProtectedRoute> },
          { path: "/menu", element: <ProtectedRoute allowedRoles={NAV_PERMISSIONS['/menu']}><MenuManagement /></ProtectedRoute> },
          { path: "/tables", element: <ProtectedRoute allowedRoles={NAV_PERMISSIONS['/tables']}><Tables /></ProtectedRoute> },
          { path: "/inventory", element: <ProtectedRoute allowedRoles={NAV_PERMISSIONS['/inventory']}><Inventory /></ProtectedRoute> },
          { path: "/reports", element: <ProtectedRoute allowedRoles={NAV_PERMISSIONS['/reports']}><Reports /></ProtectedRoute> },
          { path: "/feedback", element: <ProtectedRoute allowedRoles={NAV_PERMISSIONS['/feedback']}><Feedback /></ProtectedRoute> },
          { path: "/staff", element: <ProtectedRoute allowedRoles={NAV_PERMISSIONS['/staff']}><Staff /></ProtectedRoute> },
          { path: "/settings", element: <ProtectedRoute allowedRoles={NAV_PERMISSIONS['/settings']}><Settings /></ProtectedRoute> },
          { path: "/audit", element: <ProtectedRoute allowedRoles={NAV_PERMISSIONS['/audit']}><AuditLog /></ProtectedRoute> },
          { path: "/profile", element: <MyProfile /> },
        ],
      },
    ],
  },

  // ── Fallback ──
  { path: "*", element: <NotFound /> },
];

export default routes;