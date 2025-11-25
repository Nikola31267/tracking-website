"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios";
import Loader from "@/components/layout/Loader";

function VerifyMagicLinkPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (!token) {
        setMessage("Invalid or missing token.");
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.post("/auth/verify-magic-link", {
          token,
        });

        const data = response.data;

        if (response.status === 200) {
          console.log(data);
          localStorage.setItem("data-traffic-auth", data.token);
          setMessage(data.message);
          setLoading(false);
          router.push("/dashboard");
        } else {
          setMessage(data.message || "An error occurred");
          setLoading(false);
        }
      } catch (error) {
        console.error("Verification error:", error);
        setMessage("An error occurred while verifying the magic link");
        setLoading(false);
      }
    };

    verifyToken();
  }, [router]);

  return (
    <div className="max-w-md mx-auto p-5">
      <h1 className="text-xl font-bold mb-4">Verify Magic Link</h1>
      {loading ? (
        <div className="text-gray-600">
          <Loader />
        </div>
      ) : (
        <p className="text-gray-800">{message}</p>
      )}
    </div>
  );
}

export default VerifyMagicLinkPage;
