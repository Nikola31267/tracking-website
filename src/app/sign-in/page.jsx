"use client";

import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Loader from "@/components/layout/Loader";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [error, setError] = useState(null);
  const [passwordlessEmail, setPasswordlessEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sendingMagicLink, setSendingMagicLink] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (
      localStorage.getItem("data-traffic-auth") ||
      !localStorage.getItem("data-traffic-auth") === null ||
      !localStorage.getItem("data-traffic-auth") === ""
    ) {
      router.push("/dashboard");
    } else {
      setLoadingAuth(false);
    }
  }, [router]);

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;

    try {
      const response = await axiosInstance.post("/auth/google-signin", {
        token,
      });
      localStorage.setItem("data-traffic-auth", response.data.token);
      router.push("/dashboard");
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

  if (loadingAuth) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-8 items-center justify-center min-h-screen relative">
      <form
        className="flex flex-col gap-4 px-14 py-8 rounded-xl shadow-xl bg-gray-50"
        onSubmit={handlePasswordlessLogin}
      >
        <div className="flex items-center justify-center mb-4">
          <Image
            src="/logo-nobg.png"
            alt="Project Logo"
            className=" w-14"
            draggable={false}
            width={56}
            height={56}
          />

          <h2 className="text-xl font-semibold">PixelTrack</h2>
        </div>

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
        <button
          type="submit"
          className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-md"
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
        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-green-500">{message}</p>}
        <hr className=" border-gray-100" />
        <p className="text-md text-gray-500 flex gap-1 justify-center">
          Made with <span className="font-bold ">TurboVerify</span>
        </p>
      </form>
      <p className="text-sm text-gray-500">
        By signing up, you agree to our Terms of Service.
      </p>
    </div>
  );
}
