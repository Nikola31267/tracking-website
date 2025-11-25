"use client";

import Image from "next/image";
import Link from "next/link";
import Navigation from "./Navigation";
import UserButton from "./UserButton";
import Pricing from "@/app/(site)/components/Pricing";
import { useEffect, useRef, useState } from "react";
import Loader from "./layout/Loader";
import { axiosInstance } from "@/lib/axios";
import { useRouter } from "next/navigation";

const NoAccessDashboard = ({}) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndAccess = async () => {
      try {
        const response = await axiosInstance.get("/auth/user", {
          headers: {
            "x-auth-token": localStorage.getItem("data-traffic-auth"),
          },
        });
        setUser(response.data);

        if (response.data.hasAccess) {
          router.push("/dashboard");
        } else {
          setLoadingAuth(false);
        }
      } catch (error) {
        setError("Error fetching user profile");
        console.error(error);
        setLoadingAuth(false);
      }
    };

    checkAuthAndAccess();
  }, [router]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get("/auth/user", {
          headers: {
            "x-auth-token": localStorage.getItem("data-traffic-auth"),
          },
        });
        setUser(response.data);
      } catch (error) {
        setError("Error fetching user profile");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const dropdownRef = useRef(null);

  if (loadingAuth) return <Loader />;
  if (loading) return <Loader />;
  if (error) return <p>Error fetching user profile</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center border-b border-gray-200 mb-12">
        <div className="flex items-center p-2">
          <Link href="/dashboard">
            <Image
              src="/logo-nobg.png"
              alt="Logo"
              className="h-12 w-12 mr-2"
              width={48}
              height={48}
            />
          </Link>
          <div className="relative" ref={dropdownRef}>
            <Navigation dashboardPage={true} user={user} />
          </div>
        </div>
        <UserButton />
      </div>
      <Pricing user={user} />
    </div>
  );
};

export default NoAccessDashboard;
