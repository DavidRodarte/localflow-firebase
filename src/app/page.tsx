import { getListings } from "@/app/listings/actions";
import Header from "@/components/layout/header";
import ListingGrid from "@/components/listings/listing-grid";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const listings = await getListings();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-headline font-bold text-foreground mb-6">Explore Listings</h2>
        <ListingGrid initialListings={listings} />
      </main>
    </div>
  );
}
