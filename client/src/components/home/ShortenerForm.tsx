import CustomToast from "@/components/CustomToast";
import { RingLoader } from "@/components/Loader";
import { useAuthContext } from "@/contexts/AuthProvider";
import { ArrowTopRightOnSquareIcon, AtSymbolIcon, LinkIcon } from "@heroicons/react/16/solid";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { z } from "zod";

const urlSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
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

type ShortenerFormProps = {
  fetchUrls: () => void;
};

export default function ShortenerForm({ fetchUrls }: ShortenerFormProps) {
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const { fingerprint } = useAuthContext();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UrlFormData>({
    resolver: zodResolver(urlSchema),
  });

  const onSubmit = async (data: UrlFormData) => {
    setError("apiError", {
      message: "",
    });
    setShortenedUrl(null);
    setOriginalUrl(null);

    const payload = {
      ...data,
      fingerprint,
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const res = await axios.post("/urls", payload);
      setShortenedUrl(res.data.data.attributes.shortenedUrl);
      setOriginalUrl(data.url);
    } catch (err: any) {
      if (err.response?.data?.errors?.[0]?.detail) {
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

  async function handleCopy() {
    if (shortenedUrl) {
      await navigator.clipboard.writeText(shortenedUrl);
      toast.custom((t) => <CustomToast t={t} message={"URL copied to clipboard"} />);
    }
  }

  if (shortenedUrl) {
    return (
      <div className="w-full max-w-md mx-2 py-6 px-3 md:px-6 bg-white rounded border">
        <h1 className="text-2xl font-bold text-center" style={{ color: "#8a21ed" }}>
          Shortened URL
        </h1>
        <div className="mt-6">
          <div className="flex items-center gap-2 mt-4 text-sm text-[#8a21ed] font-medium">
            <div>
              <LinkIcon className="size-4" />
            </div>
            <span>Original URL</span>
          </div>
          <Link
            to={originalUrl || ""}
            target="_blank"
            className="block relative mt-1 px-4 py-2 text-center text-lg font-bold text-gray-700 rounded-lg border border-[#8a21ed] shadow-sm bg-gray-100 hover:bg-gray-200 hover:underline focus:ring-1 ring-offset-1 focus:ring-purple-700 focus:outline-none duration-200"
          >
            <span>{originalUrl}</span>
            <div className="absolute top-1 right-1">
              <ArrowTopRightOnSquareIcon className="size-5" />
            </div>
          </Link>
          {/* <p className="mt-4 text-center text-sm font-medium text-gray-700">Shortened URL:</p> */}
          <div className="flex items-center gap-2 mt-4 text-sm text-[#8a21ed] font-medium">
            <div>
              <AtSymbolIcon className="size-4" />
            </div>
            <span>Shortened URL</span>
          </div>
          <Link
            to={shortenedUrl}
            target="_blank"
            className="block relative mt-1 px-4 py-1.5 text-center text-lg font-bold text-gray-700 rounded-lg border border-[#8a21ed] shadow-sm bg-gray-100 hover:bg-gray-200 hover:underline focus:ring-1 ring-offset-1 focus:ring-purple-700 focus:outline-none duration-200"
          >
            <span>{shortenedUrl}</span>
            <div className="absolute top-1 right-1">
              <ArrowTopRightOnSquareIcon className="size-5" />
            </div>
          </Link>
          <div className="flex justify-between mt-4">
            <button
              onClick={handleCopy}
              className="flex gap-1 items-center px-4 py-1.5 text-white rounded-lg shadow bg-[#8a21ed] hover:bg-[#690fbd] focus:ring-1 ring-offset-1 focus:ring-purple-700 focus:outline-none duration-200"
            >
              <ClipboardIcon className="size-4" />
              <p className="">Copy</p>
            </button>
            <button
              onClick={() => {
                setShortenedUrl(null);
                setOriginalUrl(null);
              }}
              className="px-4 py-2 text-white rounded-lg shadow bg-gray-500 hover:bg-gray-700 focus:ring-1 ring-offset-1 focus:ring-gray-700 focus:outline-none duration-200"
            >
              Shorten New URL
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-2 py-6 px-3 md:px-6 bg-white rounded border">
      <h1 className="text-2xl font-bold text-center" style={{ color: "#8a21ed" }}>
        Shorten your long URLs
      </h1>
      <p className="mt-2 text-center text-gray-500">Enter your long URL below to get a shortened link.</p>
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
              {...register("url")}
              placeholder="https://example.com"
              className="w-full mt-1 px-4 py-2 text-sm border rounded-lg shadow-sm focus:ring-1 ring-offset-1 focus:ring-purple-700 focus:outline-none border-gray-300 duration-200"
              autoFocus
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
            className="flex items-center justify-center h-[40px] px-4 py-2 text-white rounded-lg shadow bg-purple hover:bg-purple-dark focus:ring-1 ring-offset-1 focus:ring-purple-700 focus:outline-none duration-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? <RingLoader /> : "Shorten"}
          </button>
        </div>
      </form>
      {errors.apiError?.message && <p className="mt-4 text-sm text-center text-red-600">{errors.apiError.message}</p>}
    </div>
  );
}
