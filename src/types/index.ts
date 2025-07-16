export type ListingCategory = "Electronics" | "Services" | "Housing" | "Events" | "For Sale";

export interface Listing {
  id: string;
  title: string;
  price: number;
  category: ListingCategory;
  location: string;
  imageUrl: string;
  imageHint: string;
}
