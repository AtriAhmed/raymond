import ShortenerForm from "@/components/home/ShortenerForm";
import Sidebar from "@/components/home/Sidebar";
import { RingLoader } from "@/components/Loader";
import { useAuthContext } from "@/contexts/AuthProvider";
import { Url } from "@/types";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
  const { fingerprint } = useAuthContext();
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  console.log("-------------------- urls --------------------");
  console.log(urls);

  async function fetchUrls() {
    try {
      const res = await axios.get("/urls", {
        params: {
          fingerprint,
        },
      });
      const _data = res.data.data;

      const data = _data.map((url: any) => {
        return {
          _id: url.id,
          ...url.attributes,
        };
      });

      setUrls(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUrls();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-55px)]">
        <RingLoader className="text-purple !size-8" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-55px)]">
      <div className="grow flex items-center justify-center overflow-x-hidden w-full">
        <ShortenerForm fetchUrls={fetchUrls} />
      </div>
      <Sidebar urls={urls} fetchUrls={fetchUrls} />
    </div>
  );
}
