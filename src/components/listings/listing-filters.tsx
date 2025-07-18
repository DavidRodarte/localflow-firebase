
"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Baby, Book, Brush, Car, Cat, Gamepad2, HeartHandshake, Home, Laptop, MoreHorizontal, Palette, Shirt, ShoppingBag, Sprout, Tag, ToyBrick, Wrench, Calendar, Dumbbell } from "lucide-react";
import { Search } from "lucide-react";

interface ListingFiltersProps {
  onCategoryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  currentCategory: string;
  currentLocation: string;
  currentSearch: string;
}

const categories = [
  { value: 'all', label: 'All Categories', icon: <ShoppingBag className="w-4 h-4 mr-2" /> },
  { value: 'For Sale', label: 'For Sale', icon: <Tag className="w-4 h-4 mr-2" /> },
  { value: 'Electronics', label: 'Electronics', icon: <Laptop className="w-4 h-4 mr-2" /> },
  { value: 'Services', label: 'Services', icon: <Wrench className="w-4 h-4 mr-2" /> },
  { value: 'Housing', label: 'Housing', icon: <Home className="w-4 h-4 mr-2" /> },
  { value: 'Events', label: 'Events', icon: <Calendar className="w-4 h-4 mr-2" /> },
  { value: 'Pets & Animals', label: 'Pets & Animals', icon: <Cat className="w-4 h-4 mr-2" /> },
  { value: 'House & Garden', label: 'House & Garden', icon: <Sprout className="w-4 h-4 mr-2" /> },
  { value: 'Clothes', label: 'Clothes', icon: <Shirt className="w-4 h-4 mr-2" /> },
  { value: 'Collectibles & Art', label: 'Collectibles & Art', icon: <Palette className="w-4 h-4 mr-2" /> },
  { value: 'Books, Movies & Music', label: 'Books, Movies & Music', icon: <Book className="w-4 h-4 mr-2" /> },
  { value: 'Vehicles', label: 'Vehicles', icon: <Car className="w-4 h-4 mr-2" /> },
  { value: 'Sports & Outdoors', label: 'Sports & Outdoors', icon: <Dumbbell className="w-4 h-4 mr-2" /> },
  { value: 'Toys', label: 'Toys', icon: <ToyBrick className="w-4 h-4 mr-2" /> },
  { value: 'Hobbies', label: 'Hobbies', icon: <Gamepad2 className="w-4 h-4 mr-2" /> },
  { value: 'Baby & Kids', label: 'Baby & Kids', icon: <Baby className="w-4 h-4 mr-2" /> },
  { value: 'Health & Beauty', label: 'Health & Beauty', icon: <Brush className="w-4 h-4 mr-2" /> },
  { value: 'Other', label: 'Other', icon: <MoreHorizontal className="w-4 h-4 mr-2" /> },
];

export default function ListingFilters({ 
  onCategoryChange, 
  onLocationChange, 
  onSearchChange,
  currentCategory, 
  currentLocation,
  currentSearch
}: ListingFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-card rounded-lg border shadow-sm">
      <div className="relative w-full md:w-1/3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by title or tag..."
          className="pl-10 w-full"
          onChange={(e) => onSearchChange(e.target.value)}
          value={currentSearch}
        />
      </div>
       <div className="w-full md:w-1/3">
        <Select onValueChange={onCategoryChange} value={currentCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                <div className="flex items-center">
                  {cat.icon}
                  {cat.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="relative w-full md:w-1/3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by location..."
          className="pl-10 w-full"
          onChange={(e) => onLocationChange(e.target.value)}
          value={currentLocation}
        />
      </div>
    </div>
  );
}
