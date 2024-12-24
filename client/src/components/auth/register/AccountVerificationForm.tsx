import { RingLoader } from "@/components/Loader";
import { useAuthContext } from "@/contexts/AuthProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import OtpInput from "react-otp-input";
import * as z from "zod";

const schema = z.object({
  otp: z.string().min(6, "Confirm Password must be at least 6 characters"),
});

interface FormValues extends z.infer<typeof schema> {
  apiError?: string;
}

type AccountVerificationFormProps = {
  verificationToken: string | null;
  setVerificationToken: (token: string) => void;
};

export default function AccountVerificationForm({ verificationToken }: AccountVerificationFormProps) {
  const { fetchUser } = useAuthContext();

  const {
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const otp = watch("otp");

  async function onSubmit(data: FormValues) {
    const payload = {
      otp: data.otp,
      token: verificationToken,
    };

    try {
      await axios.put("/users/verify", payload);

      fetchUser();
    } catch (err: any) {
      const msg = err.response?.data?.errors?.[0]?.detail;
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
      <p className="text-slate-700 text-sm text-center">We have sent you a code via email</p>
      <div className="">
        <label className="flex items-center gap-2 text-sm text-[#8a21ed] font-medium" htmlFor="otp"></label>

        <div className="w-fit mx-auto mt-2 focus:[&_input]:ring-1 [&_input]:ring-offset-1 [&_input]:ring-purple-700 focus:[&_input]:outline-none [&_input]:duration-200">
          <OtpInput
            value={otp}
            onChange={(value) => {
              setValue("otp", value);
            }}
            numInputs={6}
            renderSeparator={<span>-</span>}
            renderInput={(props) => <input {...props} />}
            inputStyle={{ width: "40px", height: "40px", border: "1px solid #ddd", borderRadius: "5px", margin: "0 5px" }}
          />
        </div>
        {errors.otp?.message && <p className="mt-1 text-red-500">{errors.otp?.message}</p>}
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
            <span>Verify</span>
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
