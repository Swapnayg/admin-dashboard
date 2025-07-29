"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  const router = useRouter();

  useEffect(() => {
    const role = user?.publicMetadata.role;
    //console.log("User role:", role);
    if (role) {
      router.push(`/${role}`);
    }
  }, [user, router]);

  return (
<div className="min-h-screen flex items-center justify-center bg-lamaSkyLight px-4">
  <SignIn.Root>
    <SignIn.Step
      name="start"
      className="bg-white p-6 sm:p-8 md:p-10 lg:p-12 rounded-md shadow-2xl w-full max-w-sm sm:max-w-md"
    >
      <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2 mb-1">
        <Image src="/logo.png" alt="logo" width={24} height={24} />
        SchooLama
      </h1>
      <h2 className="text-sm text-gray-400 mb-4">Sign in to your account</h2>

      <Clerk.GlobalError className="text-sm text-red-400 mb-2" />

      <Clerk.Field name="identifier" className="flex flex-col gap-1 mb-3">
        <Clerk.Label className="text-xs text-gray-500">Username</Clerk.Label>
        <Clerk.Input
          type="text"
          required
          className="p-2 rounded-md ring-1 ring-gray-300 w-full"
        />
        <Clerk.FieldError className="text-xs text-red-400" />
      </Clerk.Field>

      <Clerk.Field name="password" className="flex flex-col gap-1 mb-4">
        <Clerk.Label className="text-xs text-gray-500">Password</Clerk.Label>
        <Clerk.Input
          type="password"
          required
          className="p-2 rounded-md ring-1 ring-gray-300 w-full"
        />
        <Clerk.FieldError className="text-xs text-red-400" />
      </Clerk.Field>

   <div className="flex justify-center">
    <SignIn.Action
    submit
    className="bg-blue-500 hover:bg-blue-600 transition-colors text-white rounded-md text-sm py-2 w-1/2 text-center"
  >
    Sign In
  </SignIn.Action>

</div>

    </SignIn.Step>
  </SignIn.Root>
</div>

  );
};

export default LoginPage;
