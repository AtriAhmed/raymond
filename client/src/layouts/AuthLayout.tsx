// import RingLoader from "@/components/RingLoader.jsx";
import { RingLoader } from "@/components/Loader";
import { useAuthContext } from "@/contexts/AuthProvider.jsx";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

export default function AuthLayout() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  if (user !== null) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-55px)]">
        <RingLoader className="text-purple !size-8" />
      </div>
    );
  }

  return (
    <>
      <Outlet />
    </>
  );
}
