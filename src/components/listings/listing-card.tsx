import type { Listing } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="aspect-video overflow-hidden">
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            width={600}
            height={400}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={listing.imageHint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-headline leading-tight mb-2 truncate">{listing.title}</CardTitle>
        <CardDescription className="text-primary font-bold text-lg">
          ${listing.price.toLocaleString()}
          {listing.category === 'Services' && ' / hr'}
          {listing.category === 'Housing' && ' / mo'}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm text-muted-foreground">
        <span>{listing.location}</span>
        <Badge variant="secondary">{listing.category}</Badge>
      </CardFooter>
    </Card>
  );
}
