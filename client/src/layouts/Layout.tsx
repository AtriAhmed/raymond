import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="font-rubik bg-blue-50">
      <Toaster position="bottom-right" reverseOrder={false} toastOptions={{ duration: 2000 }} />
      <Navbar />
      <div className="mt-[55px]">
        <Outlet />
      </div>
    </div>
  );
}
