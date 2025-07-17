
"use client";

import * as React from 'react';
import type { Listing } from '@/types';
import ListingCard from '@/components/listings/listing-card';
import ListingFilters from '@/components/listings/listing-filters';

interface ListingGridProps {
  initialListings: Listing[];
}

export default function ListingGrid({ initialListings }: ListingGridProps) {
  const [category, setCategory] = React.useState('all');
  const [location, setLocation] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredListings = React.useMemo(() => {
    return initialListings.filter(listing => {
      const categoryMatch = category === 'all' || listing.category === category;
      const locationMatch = location === '' || (listing.location && listing.location.toLowerCase().includes(location.toLowerCase()));
      const searchMatch = searchQuery === '' || 
        (listing.title && listing.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (listing.tags && listing.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

      return categoryMatch && locationMatch && searchMatch;
    });
  }, [category, location, searchQuery, initialListings]);

  return (
    <>
      <ListingFilters
        onCategoryChange={setCategory}
        onLocationChange={setLocation}
        onSearchChange={setSearchQuery}
        currentCategory={category}
        currentLocation={location}
        currentSearch={searchQuery}
      />
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8 animate-in fade-in duration-500">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-xl">No listings found.</p>
          <p>Try adjusting your filters or creating a new post!</p>
        </div>
      )}
    </>
  );
}
