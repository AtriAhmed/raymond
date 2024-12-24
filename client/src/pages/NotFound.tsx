import { ScissorsIcon } from "@heroicons/react/16/solid";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-55px)] flex items-center justify-center">
      <div className="flex gap-6 items-center">
        <div className="text-center">
          <h3 className="text-purple text-6xl font-bold">Ooops!</h3>
          <p className="mt-5 text-slate-700 text-xl font-medium">The link that you have accessed is not valid!</p>
          <p className="mt-3 text-slate-950 text-xl font-semibold">Wanna create a short link with that alias ?</p>
          <Link
            to="/"
            className="flex items-center justify-center w-fit h-[40px] mt-8 mx-auto px-4 py-2 text-white rounded-lg shadow bg-purple hover:bg-purple-dark focus:ring-1 ring-offset-1 focus:ring-purple-700 focus:outline-none duration-200"
          >
            <div className="flex gap-3 items-center">
              <span>Start shortening URLs</span>
              <ScissorsIcon className="size-5" />
            </div>
          </Link>
        </div>
        <div>
          <img src="/logo.png" alt="" className="size-48" />
        </div>
      </div>
    </div>
  );
}
