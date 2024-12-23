import { Link } from "react-router-dom";
import RegisterComponent from "@/components/auth/register/Register";

export default function Register() {
  return (
    <div className="min-h-[calc(100vh-55px)] flex items-center justify-center">
      <main className="w-full max-w-[400px] mx-1 my-2 rounded-lg border bg-white overflow-hidden">
        <div className="py-10 px-4 bg-purple text-center">
          <div className="w-fit mx-auto bg-slate-100 rounded-lg">
            <img src="/logo.png" width={60} height={60} alt="" sizes="100px" className="bg-contain" />
          </div>
          <h3 className="mt-2 font-bold text-white text-lg">Let's Get Started With URLShortener</h3>
          <p className="text-slate-200 text-sm">Sign in to continue to URLShortener</p>
        </div>
        <div className="py-10">
          <RegisterComponent />
          <p className="mt-4 text-center text-[13px] font-medium">
            Already have an account ?{" "}
            <Link to="/auth/login" className="text-purple hover:text-purple-dark duration-200">
              Log In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
