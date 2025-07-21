
import type { Listing } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const displayPrice = () => {
    if (listing.price !== undefined && listing.price !== null) {
      if (listing.price > 0) {
        return `$${listing.price.toLocaleString()}`;
      }
      return 'Contact for more information';
    }
    return 'Contact for price';
  };

  const getTimeAgo = () => {
    const dateToCompare = listing.updatedAt || listing.createdAt;
    if (!dateToCompare) return null;
    return formatDistanceToNow(new Date(dateToCompare), { addSuffix: true });
  };

  const timeAgo = getTimeAgo();
  
  return (
    <Link href={`/listings/${listing.id}`} className="group">
      <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="p-0">
          <Carousel className="w-full">
            <CarouselContent>
               {listing.imageUrls && listing.imageUrls.length > 0 ? (
                listing.imageUrls.map((url, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-video overflow-hidden">
                      <Image
                        src={url}
                        alt={listing.title}
                        width={600}
                        height={400}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={listing.imageHint}
                      />
                    </div>
                  </CarouselItem>
                ))
              ) : (
                 <CarouselItem>
                    <div className="aspect-video overflow-hidden bg-secondary">
                       <Image
                        src="https://placehold.co/600x400"
                        alt="Placeholder image"
                        width={600}
                        height={400}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </CarouselItem>
              )}
            </CarouselContent>
          </Carousel>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-headline leading-tight mb-2 truncate">{listing.title}</CardTitle>
          <CardDescription className="text-primary font-bold text-lg">
            {displayPrice()}
            {listing.category === 'Services' && listing.price > 0 && ' / hr'}
            {listing.category === 'Housing' && listing.price > 0 && ' / mo'}
          </CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex-col items-start gap-2">
           <div className="flex justify-between items-center w-full text-sm text-muted-foreground">
             <span>{listing.location}</span>
             <Badge variant="secondary">{listing.category}</Badge>
           </div>
           {timeAgo && (
              <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1.5" />
                  {timeAgo}
              </div>
            )}
        </CardFooter>
      </Card>
    </Link>
  );
}
