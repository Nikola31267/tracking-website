"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { axiosInstance } from "@/lib/axios";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import CodeSnippetDialog from "@/components/CodeSnippet";

const Settings = ({ project, setProject, id }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const updateProjectSettings = async (updatedData) => {
    setIsUpdating(true);
    const formData = new FormData();
    formData.append("goal", updatedData.goal);
    if (updatedData.logo) {
      formData.append("logo", updatedData.logo);
    }

    try {
      const response = await axiosInstance.put(`/settings/${id}`, formData, {
        headers: {
          "x-auth-token": localStorage.getItem("data-traffic-auth"),
          "Content-Type": "multipart/form-data",
        },
      });
      setProject((prevProject) => ({ ...prevProject, ...updatedData }));
      toast({
        title: "Success",
        description: "Project settings updated successfully.",
      });
    } catch (error) {
      console.error("Error updating project settings:", error);
      setError("Server error");
      toast({
        title: "Error",
        description: "Failed to update project settings.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDeleteProject = async () => {
    setIsUpdating(true);
    try {
      await axiosInstance.delete(`/settings/${id}`, {
        headers: {
          "x-auth-token": localStorage.getItem("data-traffic-auth"),
        },
      });
      router.push("/dashboard");
      toast({ title: "Success", description: "Project deleted successfully." });
    } catch (error) {
      console.error("Error deleting project:", error);
      setError("Server error");
      toast({ title: "Error", description: "Failed to delete project." });
    } finally {
      setIsUpdating(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const removeLogo = async () => {
    setIsUpdating(true);
    try {
      await axiosInstance.put(`/settings/${id}/removeLogo`);
      setProject((prevProject) => ({ ...prevProject, logo: null }));
      toast({ title: "Success", description: "Logo removed successfully." });
    } catch (error) {
      console.error("Error deleting project:", error);
      setError("Server error");
      toast({ title: "Error", description: "Failed to remove logo." });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left column */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="space-y-4 flex flex-col justify-center items-center">
            <p className="text-sm text-gray-500">
              Upload a new logo for your project
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setProject({ ...project, logo: e.target.files[0] })
              }
              className="hidden"
              id="logoInput"
            />
            <label
              htmlFor="logoInput"
              className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer"
            >
              <Image
                src={
                  project.logo instanceof File
                    ? URL.createObjectURL(project.logo)
                    : project.logo || "/logo-nobg.png"
                }
                alt="Project Logo"
                className="h-12 w-12"
                width={48}
                height={48}
              />
            </label>
            <h1 className="text-xl font-bold text-gray-800">
              {project?.projectName.replace(/^https?:\/\//, "")}
            </h1>
            <AlertDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full btn"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Delete Project"
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to delete your project?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your project and remove the data for it from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <Button variant="destructive" onClick={confirmDeleteProject}>
                    Confirm
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant="destructiveOutline"
              className="w-full btn text-red-500 transition-colors duration-300"
              onClick={removeLogo}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Remove Logo"
              )}
            </Button>
          </div>
        </div>

        {/* Right column */}
        <div className="w-full md:w-2/3 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">General Settings</h3>
            <hr />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const updatedData = {
                  goal: e.target.goal.value,
                  logo: project.logo,
                };
                updateProjectSettings(updatedData);
              }}
            >
              <div className="space-y-1">
                <Label htmlFor="goal" className="text-md">
                  Visit Goal
                </Label>
                <Input
                  id="goal"
                  placeholder="Enter visitors goal"
                  defaultValue={project.goal}
                  className="w-full p-2 border rounded-lg focus-visible:ring-purple-500"
                />
              </div>
              <Button
                variant="purpleOutline"
                className="btn w-full transition duration-300 mt-4 text-purple-500 hover:bg-purple-500 hover:text-neutral-50"
                type="submit"
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="animate-spin" /> : "Update"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
