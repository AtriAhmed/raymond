import CustomToast from "@/components/CustomToast";
import { RingLoader } from "@/components/Loader";
import Modal from "@/components/Modal";
import { Url } from "@/types";
import { AtSymbolIcon, LinkIcon, TrashIcon } from "@heroicons/react/16/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const urlSchema = z.object({});

interface UrlFormData extends z.infer<typeof urlSchema> {
  apiError: string;
}

type DeleteUrlModalProps = {
  show: boolean;
  hide: () => void;
  afterLeave?: () => void;
  fetchUrls: () => void;
  toDelete: Url | null;
};

export default function DeleteUrlModal({ show, hide, afterLeave, fetchUrls, toDelete }: DeleteUrlModalProps) {
  const {
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UrlFormData>({
    resolver: zodResolver(urlSchema),
  });

  const onSubmit = async () => {
    try {
      await axios.delete(`/urls/${toDelete?._id}`);

      fetchUrls();

      toast.custom((t) => <CustomToast t={t} message={"URL deleted successfully"} />);

      hide();
    } catch (err: any) {
      if (err?.status === 429) {
        setError("apiError", {
          message: "You have created too many URLs in a short period of time. Please try again later.",
        });
      } else if (err.response?.data?.errors?.[0]?.detail) {
        setError("apiError", {
          message: err.response.data.errors[0].detail,
        });
      } else {
        setError("apiError", {
          message: "An unexpected error occurred. Please try again.",
        });
      }
    }
  };

  return (
    <Modal show={show} hide={hide} afterLeave={afterLeave} dialogClassName="w-full md:max-w-[500px] h-fit my-auto py-6 px-4 rounded-lg mx-2">
      <div className="">
        <h1 className="text-2xl font-bold text-center" style={{ color: "#8a21ed" }}>
          Delete URL
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          <div className="flex flex-col">
            <p className="font-bold">Would you like to delete the URL?</p>
            <p className="mt-1.5 pl-2 text-sm text-slate-700 font-medium">
              <span className="text-black">Short URL:</span> {toDelete?.shortenedUrl}
            </p>
            <p className="mt-1.5 pl-2 text-sm text-slate-700 font-medium">
              <span className="text-black">Original URL:</span> {toDelete?.originalUrl}
            </p>
            <button
              type="submit"
              className="flex items-center justify-center h-[40px] mt-8 px-4 py-2 text-white rounded-lg shadow bg-red-600 hover:bg-red-700 focus:ring-1 ring-offset-1 focus:ring-purple-700 focus:outline-none duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <RingLoader />
              ) : (
                <div className="flex gap-3 items-center">
                  <span>Delete</span>
                  <TrashIcon className="size-5" />
                </div>
              )}
            </button>
          </div>
        </form>
        {errors.apiError?.message && <p className="mt-1 text-red-500 text-sm">{errors.apiError?.message}</p>}
      </div>
    </Modal>
  );
}

function FloppyDiskIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className={className}>
      <path d="M48 96l0 320c0 8.8 7.2 16 16 16l320 0c8.8 0 16-7.2 16-16l0-245.5c0-4.2-1.7-8.3-4.7-11.3l33.9-33.9c12 12 18.7 28.3 18.7 45.3L448 416c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l245.5 0c17 0 33.3 6.7 45.3 18.7l74.5 74.5-33.9 33.9L320.8 84.7c-.3-.3-.5-.5-.8-.8L320 184c0 13.3-10.7 24-24 24l-192 0c-13.3 0-24-10.7-24-24L80 80 64 80c-8.8 0-16 7.2-16 16zm80-16l0 80 144 0 0-80L128 80zm32 240a64 64 0 1 1 128 0 64 64 0 1 1 -128 0z" />
    </svg>
  );
}
