import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { ShinyButton } from "./ui/shiny-button";

const HeroSection = () => {
  const router = useRouter();

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/${targetId}`);
    }
  };

  return (
    <div className="">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Data Traffic App</h1>
      </div>
    </div>
  );
};

export default HeroSection;
