import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8f7] px-4 py-10">
      <Suspense>
        <SignIn forceRedirectUrl="/dashboard" />
      </Suspense>
    </div>
  );
}
