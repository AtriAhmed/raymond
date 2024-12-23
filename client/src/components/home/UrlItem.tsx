import CustomToast from "@/components/CustomToast";
import { useAuthContext } from "@/contexts/AuthProvider";
import { Url } from "@/types";
import { ArrowTopRightOnSquareIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function UrlItem({ url }: { url: Url }) {
  const { user } = useAuthContext();

  async function handleCopy() {
    if (url.shortenedUrl) {
      await navigator.clipboard.writeText(url.shortenedUrl);
      toast.custom((t) => <CustomToast t={t} message={"URL copied to clipboard"} />);
    }
  }

  async function handleEdit() {
    if (!user) {
      return toast.custom((t) => <CustomToast t={t} type="warning" message={"Log in to edit your URLs"} />);
    }
  }

  async function handleDelete() {
    if (!user) {
      return toast.custom((t) => <CustomToast t={t} type="warning" message={"Log in to edit your URLs"} />);
    }
  }

  return (
    <div className="px-2 py-2 rounded-lg border border-slate-300">
      <Link target="_blank" to={url.shortenedUrl} className="flex hover:underline">
        <p className="font-medium text-slate-700">{url.shortenedUrl}</p>
        <div className="ml-auto">
          <ArrowTopRightOnSquareIcon className="size-4" />
        </div>
      </Link>
      <p className="mt-1.5 pl-2 text-xs text-slate-500">
        <span className="font-medium text-black">Original:</span> {url.originalUrl}
      </p>
      <div className="flex gap-1">
        <p className="mt-1.5 pl-2 text-xs text-slate-500">
          <span className="font-medium text-black">Visits:</span> {url.visits}
        </p>
        <p className="mt-1.5 pl-2 text-xs text-slate-500">
          <span className="font-medium text-black">Created:</span> {new Date(url.createdAt).toLocaleDateString("en-US")}
        </p>
      </div>
      <div className="flex gap-1 mt-3">
        <button onClick={handleCopy} className="flex gap-1 px-2 py-1 rounded bg-green-600 hover:bg-green-700 text-white duration-200">
          <ClipboardIcon className="size-4" />
          <p className="text-xs">Copy</p>
        </button>
        <button onClick={handleEdit} className="flex gap-1 ml-auto px-2 py-1 rounded bg-purple hover:bg-purple-dark text-white duration-200">
          <PencilSquareIcon className="size-4" />
          <p className="text-xs">Edit</p>
        </button>
        <button onClick={handleDelete} className="flex gap-1 px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white duration-200">
          <TrashIcon className="size-4" />
          <p className="text-xs">Delete</p>
        </button>
      </div>
    </div>
  );
}
