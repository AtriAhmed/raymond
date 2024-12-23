import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

const urlSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

type UrlFormData = z.infer<typeof urlSchema>;

const Home: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UrlFormData>({
    resolver: zodResolver(urlSchema),
  });

  const onSubmit = async (data: UrlFormData) => {
    try {
      const res = await axios.post("/urls", data);

      console.log("-------------------- res.data --------------------");
      console.log(res.data);
    } catch (err: any) {
      console.log(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">Shorten your long URLs</h1>
        <p className="mt-2 text-center text-gray-500">Enter your long URL below to get a shortened link.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          <div className="flex flex-col space-y-4">
            <div>
              <input
                type="text"
                placeholder="Enter your URL"
                {...register("url")}
                className="w-full px-4 py-2 text-sm border rounded-lg shadow-sm focus:ring focus:ring-blue-300 focus:outline-none border-gray-300"
              />
              {errors.url && <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>}
            </div>
            <button type="submit" className="px-4 py-2 text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 focus:ring focus:ring-blue-300">
              Shorten
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Home;
