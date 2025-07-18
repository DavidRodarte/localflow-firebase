
export type ListingCategory = "Electronics" | "Services" | "Housing" | "Events" | "For Sale" | "Pets & Animals" | "House & Garden" | "Clothes" | "Collectibles & Art" | "Books, Movies & Music" | "Vehicles" | "Sports & Outdoors" | "Toys" | "Hobbies" | "Baby & Kids" | "Health & Beauty" | "Other";

export interface Listing {
  id: string;
  title: string;
  description: string;
  price?: number;
  category: ListingCategory;
  location: string;
  tags: string[];
  imageUrls: string[]; // Can be a URL or a Base64 data URI
  imageHint: string;
  authorId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string; // This will be the user's UID
  email: string;
  name?: string;
  location?: string;
  phoneNumber?: string;
}
