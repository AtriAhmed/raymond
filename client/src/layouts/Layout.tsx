import Navbar from "@/components/Navbar";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="font-rubik bg-blue-50">
      <Navbar />
      <Outlet />
    </div>
  );
}
