import CustomToast from "@/components/CustomToast";
import { useAuthContext } from "@/contexts/AuthProvider";
import { Url } from "@/types";
import { ArrowTopRightOnSquareIcon, LinkIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

type UrlItemProps = {
  url: Url;
  setToEdit: (url: Url) => void;
  setShowEditModal: (show: boolean) => void;
  setToDelete: (url: Url) => void;
  setShowDeleteModal: (show: boolean) => void;
};

export default function UrlItem({ url, setToEdit, setShowEditModal, setToDelete, setShowDeleteModal }: UrlItemProps) {
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

    setToEdit(url);
    setShowEditModal(true);
  }

  async function handleDelete() {
    if (!user) {
      return toast.custom((t) => <CustomToast t={t} type="warning" message={"Log in to edit your URLs"} />);
    }

    setToDelete(url);
    setShowDeleteModal(true);
  }

  return (
    <div className="px-2 py-2 rounded-lg border border-slate-300">
      <Link target="_blank" to={url.shortenedUrl} className="flex hover:underline">
        <div className="flex w-0 grow gap-3 items-center">
          <div className="shrink-0 flex items-center justify-center w-10 h-10 bg-slate-200 border border-slate-300 rounded-lg overflow-hidden">
            {url.image ? <img src={url.image} alt="" /> : <LinkIcon className="size-8 text-purple" />}
          </div>
          <p className="w-0 grow font-medium text-slate-700 text-ellipsis overflow-hidden">{url.shortenedUrl}</p>
        </div>
        <div className="">
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
          <span className="font-medium text-black">Created:</span>{" "}
          {new Date(url.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </p>
      </div>
      <div className="flex gap-1 mt-3">
        <button onClick={handleCopy} className="flex gap-1 px-2 py-1 rounded bg-slate-400 hover:bg-slate-500 text-white duration-200">
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
