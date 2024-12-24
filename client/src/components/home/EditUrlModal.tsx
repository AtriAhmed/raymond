import CustomToast from "@/components/CustomToast";
import { RingLoader } from "@/components/Loader";
import Modal from "@/components/Modal";
import { Url } from "@/types";
import { AtSymbolIcon, LinkIcon } from "@heroicons/react/16/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const urlSchema = z.object({
  url: z
    .string()
    .url("Please enter a valid URL")
    .refine(
      (val) => {
        const parts = val.split(".");
        return (
          parts.length >= 2 && // Ensure there is at least one period
          parts[0].length >= 2 && // At least 2 characters before the period
          parts[parts.length - 1].length >= 2 // At least 2 characters after the period
        );
      },
      { message: "Please enter a valid URL" }
    ),
  alias: z
    .string()
    .optional()
    .refine((val) => !val || /^[a-zA-Z0-9_-]+$/.test(val), {
      message: "Alias can only contain letters, numbers, underscores, and dashes",
    }),
});

interface UrlFormData extends z.infer<typeof urlSchema> {
  apiError: string;
}

type EditUrlModalProps = {
  show: boolean;
  hide: () => void;
  afterLeave?: () => void;
  fetchUrls: () => void;
  toEdit: Url | null;
};

export default function EditUrlModal({ show, hide, afterLeave, fetchUrls, toEdit }: EditUrlModalProps) {
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UrlFormData>({
    resolver: zodResolver(urlSchema),
  });

  const inputRef = useRef<(() => void) | null>(null);

  const { ref, ...restRegister } = register("url");

  const onSubmit = async (data: UrlFormData) => {
    try {
      await axios.put(`/urls/${toEdit?._id}`, data);

      fetchUrls();

      toast.custom((t) => <CustomToast t={t} message={"URL shortened successfully"} />);

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

  useEffect(() => {
    if (toEdit) {
      setValue("url", toEdit.originalUrl);
      setValue("alias", toEdit.alias);
    }
  }, [toEdit]);

  return (
    <Modal
      initialFocusRef={inputRef}
      show={show}
      hide={hide}
      afterLeave={afterLeave}
      dialogClassName="w-full md:max-w-[500px] h-fit my-auto py-6 px-4 rounded-lg mx-2"
    >
      <div className="">
        <h1 className="text-2xl font-bold text-center" style={{ color: "#8a21ed" }}>
          Edit URL
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          <div className="flex flex-col space-y-4">
            <div>
              <label htmlFor="url" className="flex items-center gap-2 text-sm text-[#8a21ed] font-medium">
                <div>
                  <LinkIcon className="size-4" />
                </div>
                <span>URL</span>
              </label>
              <input
                id="url"
                type="text"
                {...restRegister}
                placeholder="https://example.com"
                className="w-full mt-1 px-4 py-2 text-sm border rounded-lg shadow-sm focus:ring-1 ring-offset-1 focus:ring-purple-700 focus:outline-none border-gray-300 duration-200"
                ref={(e) => {
                  ref(e);
                  inputRef.current = e;
                }}
              />
              {errors.url && <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>}
            </div>
            <div>
              <label htmlFor="alias" className="flex items-center gap-2 text-sm text-[#8a21ed] font-medium">
                <div>
                  <AtSymbolIcon className="size-4" />
                </div>
                <span>Custom Alias (optional)</span>
              </label>
              <input
                id="alias"
                type="text"
                {...register("alias")}
                placeholder="abc123"
                className="mt-1 w-full px-4 py-2 text-sm border rounded-lg shadow-sm focus:ring-1 ring-offset-1 focus:ring-purple-700 focus:outline-none border-gray-300 duration-200"
              />
              {errors.alias && <p className="mt-1 text-sm text-red-600">{errors.alias.message}</p>}
            </div>
            <button
              type="submit"
              className="flex items-center justify-center h-[40px] !mt-8 px-4 py-2 text-white rounded-lg shadow bg-purple hover:bg-purple-dark focus:ring-1 ring-offset-1 focus:ring-purple-700 focus:outline-none duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <RingLoader />
              ) : (
                <div className="flex gap-3 items-center">
                  <span>Save</span>
                  <FloppyDiskIcon className="size-5 mt-0.5" />
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
