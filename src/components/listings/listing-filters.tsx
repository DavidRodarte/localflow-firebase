"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Laptop, Wrench, Home, Calendar, ShoppingBag, Search } from "lucide-react";

interface ListingFiltersProps {
  onCategoryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  currentCategory: string;
  currentLocation: string;
}

const categories = [
  { value: 'all', label: 'All Categories', icon: <ShoppingBag className="w-4 h-4 mr-2" /> },
  { value: 'Electronics', label: 'Electronics', icon: <Laptop className="w-4 h-4 mr-2" /> },
  { value: 'Services', label: 'Services', icon: <Wrench className="w-4 h-4 mr-2" /> },
  { value: 'Housing', label: 'Housing', icon: <Home className="w-4 h-4 mr-2" /> },
  { value: 'Events', label: 'Events', icon: <Calendar className="w-4 h-4 mr-2" /> },
  { value: 'For Sale', label: 'For Sale', icon: <ShoppingBag className="w-4 h-4 mr-2" /> },
];

export default function ListingFilters({ onCategoryChange, onLocationChange, currentCategory, currentLocation }: ListingFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-card rounded-lg border shadow-sm">
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
      <div className="relative w-full md:w-2/3">
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
