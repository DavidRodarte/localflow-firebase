
import { getListingDetails } from './actions';
import Header from '@/components/layout/header';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MapPin, Phone, User as UserIcon, CalendarIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { format } from 'date-fns';

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const listingDetails = await getListingDetails(params.id);

  if (!listingDetails) {
    notFound();
  }

  const { title, description, price, category, location, tags, imageUrls, imageHint, author, createdAt } =
    listingDetails;

  const formattedDate = createdAt ? format(new Date(createdAt), "MMM d, yyyy 'at' h:mm a") : 'Date not available';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Carousel className="w-full">
              <CarouselContent>
                {imageUrls.map((url, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-video w-full overflow-hidden rounded-lg border">
                      <Image
                        src={url}
                        alt={`${title} - image ${index + 1}`}
                        width={1200}
                        height={800}
                        className="object-cover w-full h-full"
                        data-ai-hint={imageHint}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <h1 className="text-3xl font-headline font-bold text-foreground">
                  {title}
                </h1>
                <p className="text-3xl font-bold text-primary">
                  {price ? `$${price.toLocaleString()}` : 'Contact for price'}
                   {category === 'Services' && ' / hr'}
                   {category === 'Housing' && ' / mo'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1.5" />
                        {location}
                    </div>
                    <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1.5" />
                        Posted on {formattedDate}
                    </div>
                </div>
                <Badge variant="secondary">{category}</Badge>
              </CardContent>
            </Card>

            {author && (
              <Card>
                <CardHeader>
                  <CardTitle>Seller Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                   <div className="flex items-center">
                    <UserIcon className="h-5 w-5 mr-3 text-muted-foreground" />
                    <span className="font-medium">{author.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                    <span className="text-sm">{author.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-3 text-muted-foreground" />
                     <span className="text-sm">{author.phoneNumber || 'Not provided'}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Separator className="my-8" />

        <div className="max-w-4xl">
            <h2 className="text-2xl font-headline font-bold mb-4">Description</h2>
            <p className="text-foreground/80 whitespace-pre-wrap">{description}</p>

            {tags && tags.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                        {tag}
                        </Badge>
                    ))}
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
