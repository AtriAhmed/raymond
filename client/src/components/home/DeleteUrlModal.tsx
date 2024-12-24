import CustomToast from "@/components/CustomToast";
import { RingLoader } from "@/components/Loader";
import Modal from "@/components/Modal";
import { Url } from "@/types";
import { TrashIcon } from "@heroicons/react/16/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
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
