
"use client";

import { useEffect, useState, useTransition } from "react";
import Header from "@/components/layout/header";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import type { Listing } from "@/types";
import { getUserListings, deleteListing } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/4" />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-5 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-5 w-16" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-5 w-16" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-5 w-12" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchListings() {
      if (user) {
        setLoading(true);
        try {
          const idToken = await user.getIdToken();
          const userListings = await getUserListings(idToken);
          setListings(userListings);
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Failed to fetch listings",
            description: "Could not load your listings. Please try again.",
          });
        } finally {
          setLoading(false);
        }
      }
    }
    fetchListings();
  }, [user, toast]);

  const handleDelete = () => {
    if (!selectedListingId || !user) return;

    startDeleteTransition(async () => {
      try {
        const idToken = await user.getIdToken();
        const result = await deleteListing(selectedListingId, idToken);
        if (result.success) {
          setListings(listings.filter(l => l.id !== selectedListingId));
          toast({
            title: "Listing Deleted",
            description: "Your listing has been successfully deleted.",
          });
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Deletion Failed",
          description: error instanceof Error ? error.message : "Could not delete listing. Please try again.",
        });
      } finally {
        setShowDeleteAlert(false);
        setSelectedListingId(null);
      }
    });
  };

  const openDeleteDialog = (id: string) => {
    setSelectedListingId(id);
    setShowDeleteAlert(true);
  };
  
  if (authLoading || loading) {
     return (
        <div className="flex flex-col min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <DashboardSkeleton />
          </main>
        </div>
      );
  }

  if (!user) {
    return null; // or a redirect component
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-headline font-bold">My Listings</h1>
           <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/create-post">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Listing
            </Link>
          </Button>
        </div>

        {listings.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-medium">{listing.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{listing.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {listing.price ? `$${listing.price.toLocaleString()}` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openDeleteDialog(listing.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
           <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
              <h3 className="text-xl font-semibold">No listings yet</h3>
              <p className="mb-4">You haven't created any listings. Get started now!</p>
              <Button asChild>
                <Link href="/create-post">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Listing
                </Link>
              </Button>
            </div>
        )}
      </main>
      
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              listing from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
