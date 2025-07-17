
"use client";

import Header from "@/components/layout/header";
import CreatePostForm from "@/components/create-post/create-post-form";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserProfile } from "@/types";
import { getUserProfile } from "@/app/profile/actions";

export default function CreatePostPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const userProfile = await getUserProfile(idToken);
          setProfile(userProfile);
        } catch (error) {
          console.error("Failed to fetch profile for create post page", error);
          // Non-critical error, so we don't need to show a toast
        } finally {
          setProfileLoading(false);
        }
      }
    }
    
    if(!loading) {
       fetchProfile();
    }
  }, [user, loading]);

  if (loading || profileLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="w-full max-w-2xl mx-auto space-y-8">
            <Skeleton className="h-10 w-1/3" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-8">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <CreatePostForm userLocation={profile?.location} />
      </main>
    </div>
  );
}
