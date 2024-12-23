import AccountVerificationForm from "@/components/auth/register/AccountVerificationForm";
import RegisterForm from "@/components/auth/register/RegisterForm";
import React, { useState } from "react";

export default function Register() {
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  if (verificationToken) {
    return <AccountVerificationForm verificationToken={verificationToken} setVerificationToken={setVerificationToken} />;
  }

  return <RegisterForm verificationToken={verificationToken} setVerificationToken={setVerificationToken} />;
}
