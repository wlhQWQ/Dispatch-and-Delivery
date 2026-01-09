import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import { APIProvider } from "@vis.gl/react-google-maps";

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import { NotFound } from "./components/NotFound";
import { OrderList } from "./components/OrderList";
import { ShippingForm } from "./components/ShippingForm";
import { DeliveryOptions } from "./components/DeliveryOptions";
import AdminDashboard from "./pages/AdminDashboard";
import { Mailbox } from "./components/Mailbox";
import { MailboxProvider } from "./contexts/MailboxContext";
import StripeMockPage from "./pages/StripeMockPage";

import { Toaster } from "./components/ui/sonner";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace={true} />,
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <NotFound />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/signup",
    element: <Register />,
    errorElement: <NotFound />,
  },
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />,
    errorElement: <NotFound />,
  },
  {
    path: "/mock-stripe",
    element: <StripeMockPage />,
  },
  {
    path: "/dashboard",
    element: (
      <MailboxProvider>
        <Dashboard />
      </MailboxProvider>
    ),
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <OrderList />,
      },
      {
        path: "orders",
        element: <OrderList />,
      },
      {
        path: "new-order",
        element: <ShippingForm />,
      },
      {
        path: "delivery-options",
        element: <DeliveryOptions />,
      },
      {
        path: "mailbox",
        element: <Mailbox />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <APIProvider
    apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
    libraries={["geocoding", "geometry"]}
  >
    <RouterProvider router={router} />
    <Toaster />
  </APIProvider>
);
