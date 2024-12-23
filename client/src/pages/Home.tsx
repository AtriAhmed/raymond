import ShortenerForm from "@/components/home/ShortenerForm";
import Sidebar from "@/components/home/Sidebar";
import { useAuthContext } from "@/contexts/AuthProvider";
import { Url } from "@/types";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
  const { fingerprint } = useAuthContext();
  const [urls, setUrls] = useState<Url[]>([]);

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
    }
  }

  useEffect(() => {
    fetchUrls();
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-55px)]">
      <div className="grow flex items-center justify-center overflow-x-hidden w-full">
        <ShortenerForm fetchUrls={fetchUrls} />
      </div>
      <Sidebar urls={urls} />
    </div>
  );
}
