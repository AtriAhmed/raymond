"use client";

import Dropdown from "@/components/Dropdown";
import { useAppContext } from "@/contexts/AppProvider";
import { useAuthContext } from "@/contexts/AuthProvider";
import { Bars3Icon } from "@heroicons/react/16/solid";
import { ArrowLeftStartOnRectangleIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

function Navbar() {
  const { user, logout } = useAuthContext();
  const { setShowMobileSidebar } = useAppContext();

  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      console.error(err);
    }
  }

  const dropdownItems = [
    // <Link
    //   to="/app"
    //   className="grid grid-cols-[25px_1fr] items-center py-2 px-3 rounded font-normal text-black text-[15px] hover:bg-slate-200 transition duration-300"
    // >
    //   <UserIcon className="size-4" />
    //   <span>Dashboard</span>
    // </Link>,
    <button
      onClick={handleLogout}
      className="grid grid-cols-[25px_1fr] items-center w-full text-left py-2 px-3 rounded font-normal text-black text-[15px] hover:bg-slate-200 transition duration-300"
    >
      <ArrowLeftStartOnRectangleIcon className="size-4" />
      <span>Logout</span>
    </button>,
  ];

  return (
    <header className="shrink-0 fixed w-full top-0 left-0 z-[20] flex items-center h-[55px] px-4 border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Link className="flex items-center gap-2" to="/">
            <img src="/logo.png" alt="" width={32} height={32} />
            <span className={`text-lg font-semibold mt-1`}>URLShortener</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Dropdown items={dropdownItems} position="right" renderItem={(item) => item}>
              {(isOpen) => (
                <div className={`relative`}>
                  <div className="flex gap-2 items-center">
                    <p className="hidden sm:block text-sm font-medium">{user?.username}</p>
                    <div className="relative w-10 aspect-square rounded-full border border-purple overflow-hidden">
                      <img src={`${import.meta.env.VITE_API_URL}${user?.picture}` || ""} alt="" className="absolute inset-0 object-cover" />
                    </div>
                  </div>
                  <i className="absolute bottom-0 right-0 translate-x-1 translate-y-1 flex items-center justify-center size-4 bg-white rounded-full overflow-hidden">
                    <ChevronDownIcon className={`size-4 duration-200 ${isOpen ? "-rotate-180" : ""}`} />
                  </i>
                </div>
              )}
            </Dropdown>
          ) : (
            <Link
              className={`flex items-center gap-1 py-1 px-4 rounded-xl bg-[#8a21ed] hover:bg-[#690fbd] text-white text-[15px] duration-200 shadow-md`}
              to="/auth/login"
            >
              <LockClosedIcon className="w-4 h-4" />
              <span>Login</span>
            </Link>
          )}
          {/* <ShoppingCartIcon className="h-6" /> */}
          <button
            className={`block md:hidden`}
            onClick={() => {
              setShowMobileSidebar(true);
            }}
          >
            <Bars3Icon className="h-7 w-7 text-purple hover:text-purple-dark" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

function ChevronDownIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
