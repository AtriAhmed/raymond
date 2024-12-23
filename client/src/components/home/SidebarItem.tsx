import { Link, useLocation } from "react-router-dom";

export default function SidebarItem({ item }: any) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <Link
      to={item.path}
      className={`grid grid-cols-[15px_1fr] items-center gap-4 mt-1 px-3 py-2.5 rounded-lg transition duration-300 ${
        (!item.strict && pathname.startsWith(item.path)) || pathname === item.path ? "bg-green-700 hover:bg-green-800 text-white" : "hover:bg-slate-200"
      }`}
    >
      {item.Icon}
      <span>{item.name}</span>
    </Link>
  );
}
