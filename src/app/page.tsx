"use client";

import * as React from 'react';
import type { Listing } from '@/types';
import Header from '@/components/layout/header';
import ListingCard from '@/components/listings/listing-card';
import ListingFilters from '@/components/listings/listing-filters';

const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Vintage Leather Sofa',
    price: 450,
    category: 'For Sale',
    location: 'Downtown',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'leather sofa',
  },
  {
    id: '2',
    title: 'Web Development Services',
    price: 50,
    category: 'Services',
    location: 'Uptown',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'laptop code',
  },
  {
    id: '3',
    title: 'Apartment for Rent - 2 Bed',
    price: 1800,
    category: 'Housing',
    location: 'Midtown',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'apartment building',
  },
  {
    id: '4',
    title: 'Community Music Festival',
    price: 25,
    category: 'Events',
    location: 'City Park',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'music festival',
  },
  {
    id: '5',
    title: 'Gaming PC - RTX 3080',
    price: 1200,
    category: 'Electronics',
    location: 'Suburbia',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'gaming computer',
  },
  {
    id: '6',
    title: 'Gardening and Landscaping',
    price: 35,
    category: 'Services',
    location: 'Green Valley',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'beautiful garden',
  },
  {
    id: '7',
    title: 'Mid-Century Modern Bookshelf',
    price: 150,
    category: 'For Sale',
    location: 'Arts District',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'modern bookshelf',
  },
  {
    id: '8',
    title: 'Studio Apartment near Campus',
    price: 1100,
    category: 'Housing',
    location: 'University Heights',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'studio apartment',
  },
];


export default function Home() {
  const [category, setCategory] = React.useState('all');
  const [location, setLocation] = React.useState('');

  const filteredListings = React.useMemo(() => {
    return mockListings.filter(listing => {
      const categoryMatch = category === 'all' || listing.category === category;
      const locationMatch = location === '' || listing.location.toLowerCase().includes(location.toLowerCase());
      return categoryMatch && locationMatch;
    });
  }, [category, location]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-headline font-bold text-foreground mb-6">Explore Listings</h2>
        <ListingFilters
          onCategoryChange={setCategory}
          onLocationChange={setLocation}
          currentCategory={category}
          currentLocation={location}
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
            <p>Try adjusting your filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}
