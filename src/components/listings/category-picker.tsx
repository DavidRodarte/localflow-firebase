
"use client";

import * as React from 'react';
import type { ListingCategory } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Baby, Book, Brush, Car, Cat, Gamepad2, Home, Laptop, MoreHorizontal, Palette, Shirt, ShoppingBag, Sprout, Tag, ToyBrick, Wrench, Calendar, Dumbbell, ChevronDown
} from 'lucide-react';

const categories: { value: ListingCategory; label: string; icon: React.ReactNode }[] = [
    { value: 'For Sale', label: 'For Sale', icon: <Tag className="w-6 h-6" /> },
    { value: 'Electronics', label: 'Electronics', icon: <Laptop className="w-6 h-6" /> },
    { value: 'Services', label: 'Services', icon: <Wrench className="w-6 h-6" /> },
    { value: 'Housing', label: 'Housing', icon: <Home className="w-6 h-6" /> },
    { value: 'Events', label: 'Events', icon: <Calendar className="w-6 h-6" /> },
    { value: 'Pets & Animals', label: 'Pets & Animals', icon: <Cat className="w-6 h-6" /> },
    { value: 'House & Garden', label: 'House & Garden', icon: <Sprout className="w-6 h-6" /> },
    { value: 'Clothes', label: 'Clothes', icon: <Shirt className="w-6 h-6" /> },
    { value: 'Collectibles & Art', label: 'Collectibles & Art', icon: <Palette className="w-6 h-6" /> },
    { value: 'Books, Movies & Music', label: 'Books, Movies & Music', icon: <Book className="w-6 h-6" /> },
    { value: 'Vehicles', label: 'Vehicles', icon: <Car className="w-6 h-6" /> },
    { value: 'Sports & Outdoors', label: 'Sports & Outdoors', icon: <Dumbbell className="w-6 h-6" /> },
    { value: 'Toys', label: 'Toys', icon: <ToyBrick className="w-6 h-6" /> },
    { value: 'Hobbies', label: 'Hobbies', icon: <Gamepad2 className="w-6 h-6" /> },
    { value: 'Baby & Kids', label: 'Baby & Kids', icon: <Baby className="w-6 h-6" /> },
    { value: 'Health & Beauty', label: 'Health & Beauty', icon: <Brush className="w-6 h-6" /> },
    { value: 'Other', label: 'Other', icon: <MoreHorizontal className="w-6 h-6" /> },
];

interface CategoryPickerProps {
  value?: ListingCategory;
  onChange: (value: ListingCategory) => void;
}

export default function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (category: ListingCategory) => {
    onChange(category);
    setOpen(false);
  };
  
  const selectedCategory = categories.find(c => c.value === value);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selectedCategory ? (
            <div className="flex items-center gap-2">
              {React.cloneElement(selectedCategory.icon as React.ReactElement, { className: 'w-4 h-4' })}
              <span>{selectedCategory.label}</span>
            </div>
          ) : (
            'Select a category'
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Choose a Category</DialogTitle>
          <DialogDescription>
            Select the category that best fits your listing.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant="outline"
              onClick={() => handleSelect(cat.value)}
              className="h-24 flex-col gap-2"
            >
              {cat.icon}
              <span className="text-center text-sm">{cat.label}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
