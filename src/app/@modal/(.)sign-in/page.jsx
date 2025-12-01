"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useState, useEffect, useRef } from "react";
import { axiosInstance } from "@/lib/axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const SignInModal = () => {
  const [error, setError] = useState(null);
  const [passwordlessEmail, setPasswordlessEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sendingMagicLink, setSendingMagicLink] = useState(false);
  const router = useRouter();
  const dialogCloseRef = useRef();

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;

    try {
      const response = await axiosInstance.post("/auth/google-signin", {
        token,
      });
      localStorage.setItem("data-traffic-auth", response.data.token);
      dialogCloseRef.current.click();
      setTimeout(() => {
        router.push("/dashboard");
      }, 300);
    } catch (error) {
      console.error(
        "Google login failed:",
        error.response ? error.response.data : error.message
      );
    }
  };
  const handleGoogleLoginFailure = () => {
    setError("Google login failed");
  };

  const handlePasswordlessLogin = async (e) => {
    e.preventDefault();
    setSendingMagicLink(true);
    try {
      const response = await axiosInstance.post("/auth/magic-link", {
        email: passwordlessEmail,
      });

      const data = await response.data;

      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.message || "An error occurred");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage(error.response.data.message);
    } finally {
      setSendingMagicLink(false);
    }
  };

  return (
    <Dialog defaultOpen onOpenChange={() => router.back()} ref={dialogCloseRef}>
      <DialogContent className="sm:max-w-[425px] ">
        <DialogHeader>
          <DialogTitle>
            {" "}
            <div className="flex items-center justify-center gap-1 mb-4">
              <Image
                src="/logo-nobg.png"
                alt="Project Logo"
                className=" w-14"
                draggable={false}
                width={56}
                height={56}
              />

              <h2 className="text-xl font-semibold">Data Traffic App</h2>
            </div>
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={handlePasswordlessLogin}
        >
          <div className="flex items-center justify-center">
            <GoogleOAuthProvider
              clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
            >
              <div>
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginFailure}
                  theme="outline"
                  size="large"
                  width="350px"
                  logo_alignment="left"
                  type="standard"
                  text="continue_with"
                />
              </div>
            </GoogleOAuthProvider>
          </div>
          <div className="flex items-center my-1 text-black">
            <hr className="w-1/2 border-gray-300" />
            <span className="mx-2">or</span>
            <hr className="w-1/2 border-gray-300" />
          </div>
          <input
            type="email"
            placeholder="elon@tesla.com"
            value={passwordlessEmail}
            onChange={(e) => setPasswordlessEmail(e.target.value)}
            className="p-2 rounded-md border w-96 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none"
            required
          />
          {error && <p className="text-red-500">{error}</p>}
          {message && <p className="text-green-500">{message}</p>}
        </form>
        <DialogFooter>
          <div className="flex flex-col gap-2 w-full">
            <button
              type="submit"
              className="w-full  bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-md"
              disabled={sendingMagicLink}
            >
              {sendingMagicLink ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin" />
                </div>
              ) : (
                "Continue"
              )}
            </button>
            <p className="text-md text-gray-500 flex gap-1 justify-center">
              Made with <span className="font-bold ">TurboVerify</span>
            </p>
          </div>
        </DialogFooter>
        <DialogClose ref={dialogCloseRef} />
      </DialogContent>
    </Dialog>
  );
};

export default SignInModal;
