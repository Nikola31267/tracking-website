"use client";

import React, { useEffect, useState, useRef } from "react";
import { axiosInstance } from "@/lib/axios";
import { useParams, useRouter } from "next/navigation";
import UserButton from "@/components/UserButton";
import Loader from "@/components/layout/Loader";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import VisitTable from "./components/VisitTable";
import Settings from "./components/Settings";
import CountryMap from "./components/CountryMap";
import PagesChart from "./components/PagesChart";
import BrowserChart from "./components/BrowserChart";
import WeeklyVisitChart from "./components/WeeklyVisitChart";
import Navigation from "@/components/Navigation";
import TabNavigation from "./components/TabNavigation";
import { Button } from "@/components/ui/button";
import FindSnippet from "@/components/FindSnippet";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import ReferrerChart from "./components/ReferrerChart";
import OsChart from "./components/OsChart";
import Link from "next/link";
import Image from "next/image";
import CountryChart from "./components/CountryChart";
import { NoVisitsTable } from "./components/NoVisitsTable";

const ITEMS_PER_PAGE = 10;

const ProjectPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [visits, setVisits] = useState([]);
  const [specificVisit, setSpecificVisit] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("app");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);
  const tableDropdownRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState(null);
  const [selectedChart, setSelectedChart] = useState("browser");
  const [selectedChart2, setSelectedChart2] = useState("map");
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const checkAuthAndAccess = async () => {
      if (!localStorage.getItem("pixeltrack-auth")) {
        router.push("/sign-in");
        return;
      }

      try {
        const userResponse = await axiosInstance.get(`/auth/user`, {
          headers: {
            "x-auth-token": localStorage.getItem("pixeltrack-auth"),
          },
        });
        setUser(userResponse.data);

        if (!userResponse.data.hasAccess) {
          router.push("/dashboard/pricing");
        } else {
          setLoadingAuth(false);
        }
      } catch (error) {
        setError("Failed to fetch user data");
        router.push("/sign-in");
      }
    };

    checkAuthAndAccess();
  }, [router]);

  useEffect(() => {
    const fetchProjectAndVisits = async () => {
      try {
        const projectResponse = await axiosInstance.get(
          `/dashboard/projects/${id}`,
          {
            headers: {
              "x-auth-token": localStorage.getItem("pixeltrack-auth"),
            },
          }
        );
        setProject(projectResponse.data);
        setVisits(projectResponse.data.visit);
      } catch (error) {
        console.error("Error fetching project or visits:", error);
        if (error.response.status === 404 || error.response.status === 403) {
          router.push("/404");
        }
        setError("Server error");
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await axiosInstance.get("/dashboard/projectsByUsers", {
          headers: {
            "x-auth-token": localStorage.getItem("pixeltrack-auth"),
          },
        });
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("Server error");
      }
    };

    if (!loadingAuth) {
      fetchProjectAndVisits();
      fetchProjects();
    }
  }, [id, loadingAuth]);

  useEffect(() => {
    const currentTab = new URLSearchParams(window.location.search).get("tab");
    const pageFromUrl = new URLSearchParams(window.location.search).get("page");
    if (currentTab) {
      setActiveTab(currentTab);
    }
    if (pageFromUrl) {
      setCurrentPage(Number(pageFromUrl));
    }
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleTableDropdown = (visitId) => {
    setOpenDropdownId((prevId) => (prevId === visitId ? null : visitId));
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }

    if (
      tableDropdownRef.current &&
      !tableDropdownRef.current.contains(event.target)
    ) {
      setOpenDropdownId(null);
    }
  };

  useEffect(() => {
    if (isDropdownOpen || openDropdownId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, openDropdownId]);

  const confirmDeleteVisit = (visitId) => {
    setVisitToDelete(visitId);
    setIsDialogOpen(true);
  };

  const handleDeleteVisit = async () => {
    if (!visitToDelete) return;
    try {
      await axiosInstance.delete(
        `/dashboard/projects/${id}/visits/${visitToDelete}/delete`,
        {
          headers: {
            "x-auth-token": localStorage.getItem("pixeltrack-auth"),
          },
        }
      );
      setVisits((prevVisits) =>
        prevVisits.filter((visit) => visit._id !== visitToDelete)
      );
      setVisitToDelete(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error deleting visit:", error);
      setError("Server error");
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    router.replace(
      `/dashboard/projects/${id}?tab=${activeTab}&page=${newPage}`,
      undefined,
      { shallow: true }
    );
  };

  const paginatedVisits = visits.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(visits.length / ITEMS_PER_PAGE);

  const handleChartChange = (value) => {
    setSelectedChart(value);
  };

  const handleChartChange2 = (value) => {
    setSelectedChart2(value);
  };

  if (loadingAuth) {
    return <Loader />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (project?.addedSnippet === false) {
    return (
      <div className="flex flex-col justify-center items-center bg-white">
        <div className="p-6 mt-20 relative">
          <FindSnippet
            projectName={project.projectName}
            projectId={id}
            apiKey={project.key}
            projectPage={true}
          />
        </div>
      </div>
    );
  }

  if (!project || visits === null) {
    return <Loader />;
  }
  return (
    <div className="p-4">
      <div className="flex justify-between items-center border-b border-gray-200 mb-12">
        <div className="flex items-center">
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
            <Navigation
              toggleDropdown={toggleDropdown}
              isDropdownOpen={isDropdownOpen}
              dropdownRef={dropdownRef}
              setIsDropdownOpen={setIsDropdownOpen}
              project={project}
              activeTab={activeTab}
              projects={projects}
              user={user}
            />
          </div>
        </div>
        <UserButton />
      </div>

      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        id={id}
      />

      {activeTab === "app" && (
        <>
          <WeeklyVisitChart
            visits={visits}
            visitsData={visits}
            project={project}
          />
          <div className="flex justify-between mb-4 mt-6 mr-4">
            <div className="w-64">
              <Select
                value={selectedChart2}
                onValueChange={handleChartChange2}
                className="w-full"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="map">
                    Map
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="chart">
                    Chart
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-64">
              <Select
                value={selectedChart}
                onValueChange={handleChartChange}
                className="w-full"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="browser">
                    Browser
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="os">
                    OS
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {selectedChart2 === "map" && <CountryMap visitsData={visits} />}

            {selectedChart2 === "chart" && <CountryChart visitsData={visits} />}

            {selectedChart === "browser" && (
              <BrowserChart visitsData={visits} />
            )}
            {selectedChart === "os" && <OsChart visitsData={visits} />}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-6">
            <PagesChart visitsData={visits} />
            <ReferrerChart visitsData={visits} />
          </div>

          {visits.length > 0 ? (
            <VisitTable
              paginatedVisits={paginatedVisits}
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
              handleDeleteVisit={handleDeleteVisit}
              deleteVisit={confirmDeleteVisit}
              toggleTableDropdown={toggleTableDropdown}
              isModalOpen={isModalOpen}
              specificVisit={specificVisit}
              openDropdownId={openDropdownId}
              tableDropdownRef={tableDropdownRef}
            />
          ) : (
            <NoVisitsTable />
          )}
        </>
      )}
      {activeTab === "settings" && (
        <Settings project={project} setProject={setProject} id={id} />
      )}

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this record?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              record and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <Button variant="destructive" onClick={handleDeleteVisit}>
              Confirm
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectPage;
