import AuthForm from "@/components/auth/auth-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

function AuthFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <Skeleton className="h-8 w-1/2 mx-auto" />
        <Skeleton className="h-5 w-3/4 mx-auto" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<AuthFormSkeleton />}>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}
