
'use client';

import Header from '@/components/layout/header';
import UpdatePostForm from '@/components/listings/update-post-form';
import { useAuth } from '@/context/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getListing } from './actions';
import type { Listing } from '@/types';
import { useToast } from '@/hooks/use-toast';

function EditPostSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <Skeleton className="h-10 w-1/3" />
       <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-48 w-full" />
      </div>
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
  );
}

export default function EditPostPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const listingId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && listingId) {
      const fetchListing = async () => {
        try {
          const idToken = await user.getIdToken();
          const data = await getListing(listingId, idToken);
          if (data) {
            setListing(data);
          } else {
            setError('Listing not found or you do not have permission to edit it.');
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Listing not found or you do not have permission to edit it.'
            });
            router.push('/dashboard');
          }
        } catch (err) {
          setError('Failed to fetch listing data.');
           toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Failed to fetch listing data. Please try again.'
            });
        } finally {
          setLoading(false);
        }
      };
      fetchListing();
    }
  }, [user, listingId, router, toast]);

  const isLoading = authLoading || loading;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <EditPostSkeleton />
        ) : listing ? (
          <UpdatePostForm listing={listing} />
        ) : (
          <div className="text-center py-16 text-destructive">
            <h2 className="text-2xl font-bold">Error</h2>
            <p>{error || 'An unexpected error occurred.'}</p>
          </div>
        )}
      </main>
    </div>
  );
}
