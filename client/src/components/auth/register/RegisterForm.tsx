import { RingLoader } from "@/components/Loader";
import { useAuthContext } from "@/contexts/AuthProvider";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as z from "zod";

const schema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

interface FormValues extends z.infer<typeof schema> {
  apiError?: string;
}

type RegisterFormProps = {
  verificationToken: string | null;
  setVerificationToken: (token: string) => void;
};

export default function RegisterForm({ verificationToken, setVerificationToken }: RegisterFormProps) {
  const navigate = useNavigate();
  const { fetchUser } = useAuthContext();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(data: any) {
    try {
      const res = await axios.post("/users", data);

      setVerificationToken(res.data.data.attributes.token);
    } catch (err: any) {
      const msg = err.response?.data?.errors?.[0]?.detail;
      console.log(err);
      if (msg === "EmailAlreadyExists") {
        setError("apiError", {
          type: "manual",
          message: "Email already exists",
        });
      } else {
        setError("apiError", { type: "manual", message: msg });
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-6 text-sm">
      <div className="">
        <label className="flex items-center gap-2 text-sm text-[#8a21ed] font-medium" htmlFor="email">
          Email
        </label>
        <input
          {...register("email")}
          id="email"
          placeholder="Enter Email"
          className="w-full mt-1 px-4 py-2 text-sm border rounded-lg shadow-sm focus:ring-1 ring-offset-1 focus:ring-purple-700 focus:outline-none border-gray-300 duration-200"
        />
        {errors.email?.message && <p className="mt-1 text-red-500">{errors.email?.message}</p>}
      </div>
      <div className="mt-2">
        <label className="flex items-center gap-2 text-sm text-[#8a21ed] font-medium" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            {...register("password")}
            id="password"
            placeholder="Enter Password"
            type={showPassword ? "text" : "password"}
            className="w-full mt-1 px-4 py-2 text-sm border rounded-lg shadow-sm focus:ring-1 ring-offset-1 focus:ring-purple-700 focus:outline-none border-gray-300 duration-200"
          />
          <button
            type="button"
            onClick={() => {
              setShowPassword((prev) => !prev);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            {showPassword ? <EyeSlashIcon className="size-5" /> : <EyeIcon className="size-5" />}
          </button>
        </div>
        {errors.password?.message && <p className="mt-1 text-red-500">{errors.password?.message}</p>}
      </div>
      <div className="mt-2">
        <label className="flex items-center gap-2 text-sm text-[#8a21ed] font-medium" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <input
          {...register("confirmPassword")}
          id="confirmPassword"
          placeholder="Enter Password"
          type={showPassword ? "text" : "password"}
          className="w-full mt-1 px-4 py-2 text-sm border rounded-lg shadow-sm focus:ring-1 ring-offset-1 focus:ring-purple-700 focus:outline-none border-gray-300 duration-200"
        />
        {errors.confirmPassword?.message && <p className="mt-1 text-red-500">{errors.confirmPassword?.message}</p>}
      </div>
      <button
        disabled={isSubmitting}
        type="submit"
        className="relative flex justify-center items-center gap-3 w-full h-9 mt-6 px-4 py-2 rounded-lg bg-purple hover:bg-green-dark text-white shadow-md disabled:opacity-75 disabled:cursor-not-allowed duration-200"
      >
        {isSubmitting ? (
          <RingLoader className=" !size-4 !border-[2px]" />
        ) : (
          <>
            <span>Register</span>
            <LoginIcon className="size-3.5" />
          </>
        )}
      </button>
      {errors.apiError?.message && <p className="mt-1 text-red-500">{errors.apiError?.message}</p>}
    </form>
  );
}

const LoginIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 512 512" {...props}>
    <path d="m217.9 105.9 122.8 122.8c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L217.9 406.1c-6.4 6.4-15 9.9-24 9.9-18.7 0-33.9-15.2-33.9-33.9V320H32c-17.7 0-32-14.3-32-32v-64c0-17.7 14.3-32 32-32h128v-62.1c0-18.7 15.2-33.9 33.9-33.9 9 0 17.6 3.6 24 9.9M352 416h64c17.7 0 32-14.3 32-32V128c0-17.7-14.3-32-32-32h-64c-17.7 0-32-14.3-32-32s14.3-32 32-32h64c53 0 96 43 96 96v256c0 53-43 96-96 96h-64c-17.7 0-32-14.3-32-32s14.3-32 32-32"></path>
  </svg>
);
