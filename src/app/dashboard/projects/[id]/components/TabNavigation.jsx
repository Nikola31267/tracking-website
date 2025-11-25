import { useRouter } from "next/navigation";
import React from "react";

const TabNavigation = ({ activeTab, setActiveTab, id }) => {
  const router = useRouter();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    router.push(`/dashboard/projects/${id}?tab=${tab}`);
  };
  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <button
        className={`px-4 py-2 border-b-2 ${
          activeTab === "app"
            ? "border-purple-500 text-purple-500"
            : "border-transparent"
        }`}
        onClick={() => handleTabChange("app")}
      >
        App
      </button>
      <button
        className={`px-4 py-2 border-b-2 ${
          activeTab === "settings"
            ? "border-purple-500 text-purple-500"
            : "border-transparent"
        }`}
        onClick={() => handleTabChange("settings")}
      >
        Settings
      </button>
    </div>
  );
};

export default TabNavigation;
