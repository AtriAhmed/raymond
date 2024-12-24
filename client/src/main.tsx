import AuthProvider from "@/contexts/AuthProvider";
import AppProvider from "@/contexts/AppProvider";
import "@/index.css";
import Layout from "@/layouts/Layout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import axios from "axios";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Register from "@/pages/Register";
import AuthLayout from "@/layouts/AuthLayout";
import NotFound from "@/pages/NotFound";

axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "chat",
        // element: <ChatLayout />,
        children: [
          {
            index: true,
            // element: <NoSelectedChat />,
          },
          {
            path: ":id",
            // element: <Chat />,
          },
        ],
      },
      {
        path: "auth",
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "register",
            element: <Register />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </AuthProvider>
);
