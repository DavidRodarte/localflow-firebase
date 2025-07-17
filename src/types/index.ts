
export type ListingCategory = "Electronics" | "Services" | "Housing" | "Events" | "For Sale";

export interface Listing {
  id: string;
  title: string;
  description: string;
  price?: number;
  category: ListingCategory;
  location: string;
  tags: string[];
  imageUrl: string;
  imageHint: string;
  authorId: string;
}
