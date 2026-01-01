import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import { NotFound } from "./components/NotFound";
import { OrderList } from "./components/OrderList";
import { ShippingForm } from "./components/ShippingForm";
import { DeliveryOptions } from "./components/DeliveryOptions";
import AdminDashboard from "./components/AdminDashboard";
import { Mailbox } from "./components/Mailbox";

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
    path: "/dashboard",
    element: <Dashboard />,
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
  <>
    <RouterProvider router={router} />
    <Toaster />
  </>
);
