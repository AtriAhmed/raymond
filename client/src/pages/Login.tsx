import LoginForm from "@/components/auth/login/LoginForm";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <main className="w-full max-w-[400px] mx-1 my-2 rounded-lg bg-white shadow-md overflow-hidden">
        <div className="py-10 px-4 bg-slate-950 text-center">
          <div className="w-fit mx-auto">
            <img src="/icon.png" width={60} height={60} alt="" sizes="100px" className="bg-contain" />
          </div>
          <h3 className="mt-2 font-bold text-white text-lg">Let's Get Started WalletMap</h3>
          <p className="text-slate-400 text-sm">Sign in to continue to WalletMap</p>
        </div>
        <div className="py-10">
          <LoginForm />
          <p className="mt-4 text-center text-[13px] font-medium">
            Don't have an account ?{" "}
            <Link to="/auth/register" className="text-green-700 hover:text-green-800 duration-200">
              Register
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
