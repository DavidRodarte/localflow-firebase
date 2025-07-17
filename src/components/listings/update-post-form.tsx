
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Lightbulb, Loader2, Tag, X } from 'lucide-react';
import { getTagSuggestions } from '@/app/create-post/actions';
import { updateListing } from '@/app/listings/[id]/edit/actions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '@/context/auth-context';
import type { Listing } from '@/types';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters.').max(5000),
  category: z.enum(['Electronics', 'Services', 'Housing', 'Events', 'For Sale']),
  price: z.coerce.number().min(0, "Price can't be negative.").optional(),
  location: z.string().min(2, 'Location is required.'),
  tags: z.array(z.string()).max(10, 'You can add up to 10 tags.'),
  imageUrls: z.array(z.string()).min(1, 'Please upload at least one image.').max(5, "You can upload up to 5 images."),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdatePostFormProps {
  listing: Listing;
}

export default function UpdatePostForm({ listing }: UpdatePostFormProps) {
  const { user } = useAuth();
  const [tags, setTags] = React.useState<string[]>(listing.tags || []);
  const [tagInput, setTagInput] = React.useState('');
  const [suggestedTags, setSuggestedTags] = React.useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  
  // State for image management
  const [existingImageUrls, setExistingImageUrls] = React.useState<string[]>(listing.imageUrls || []);
  const [newImagePreviews, setNewImagePreviews] = React.useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = React.useState<string[]>([]); // Store as data URIs

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: listing.title,
      description: listing.description,
      category: listing.category,
      location: listing.location,
      tags: listing.tags,
      price: listing.price || undefined,
      imageUrls: existingImageUrls,
    },
  });

  React.useEffect(() => {
    form.setValue('tags', tags);
  }, [tags, form]);
  
  React.useEffect(() => {
    form.setValue('imageUrls', existingImageUrls);
     if (existingImageUrls.length + newImagePreviews.length === 0) {
        form.setError("imageUrls", { message: "Please upload at least one image." });
    } else {
        form.clearErrors("imageUrls");
    }
  }, [existingImageUrls, newImagePreviews.length, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImageUrls.length + newImagePreviews.length;
    
    if (files.length + totalImages > 5) {
      form.setError("imageUrls", { message: "You cannot have more than 5 images in total." });
      return;
    }
    
    const fileReadPromises = files.map(file => {
      if (file.size > MAX_FILE_SIZE) {
        form.setError("imageUrls", { message: `Image ${file.name} is too large. Max size is 4MB.` });
        return Promise.reject();
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        form.setError("imageUrls", { message: `Invalid format for ${file.name}. Please use JPG, PNG, or WEBP.` });
        return Promise.reject();
      }
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileReadPromises).then(newFilesAsDataUri => {
        setNewImagePreviews([...newImagePreviews, ...newFilesAsDataUri]);
        setNewImageFiles([...newImageFiles, ...newFilesAsDataUri]);
        form.clearErrors("imageUrls");
    }).catch(() => {
        // Errors are set inside the map
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImageUrls(existingImageUrls.filter((_, i) => i !== index));
  }

  const removeNewImage = (index: number) => {
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
    setNewImageFiles(newImageFiles.filter((_, i) => i !== index));
  }


  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (tags.length < 10 && !tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const addSuggestedTag = (tag: string) => {
    if (tags.length < 10 && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setSuggestedTags(suggestedTags.filter((t) => t !== tag));
  };

  const handleSuggestTags = async () => {
    const { title, description } = form.getValues();
    if (!title || !description) {
      toast({
        variant: 'destructive',
        title: 'Title and Description Needed',
        description:
          'Please fill out the title and description before suggesting tags.',
      });
      return;
    }
    setIsSuggesting(true);
    try {
      const result = await getTagSuggestions({ title, description });
      const newSuggestions = result.tags.filter((tag) => !tags.includes(tag));
      setSuggestedTags(newSuggestions);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'AI Suggestion Failed',
        description: 'Could not get tag suggestions. Please try again.',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  async function onSubmit(values: FormValues) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to update a post.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const idToken = await user.getIdToken();
      // We pass the new images separately. `values.imageUrls` contains only the kept existing URLs.
      await updateListing(listing.id, values, newImageFiles, idToken);
    } catch(error: any) {
       if (error.message.includes('NEXT_REDIRECT')) {
        throw error;
      }
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update your post. Please try again.',
      });
      setIsSubmitting(false);
    }
  }
  
  const totalImageCount = existingImageUrls.length + newImagePreviews.length;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Edit Your Listing</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Vintage Leather Sofa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your item..." className="min-h-[150px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="For Sale">For Sale</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Services">Services</SelectItem>
                        <SelectItem value="Housing">Housing</SelectItem>
                        <SelectItem value="Events">Events</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 450" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Downtown" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Tags</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={handleSuggestTags} disabled={isSuggesting}>
                  {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                  Suggest Tags
                </Button>
              </div>
              <FormControl>
                <div>
                  <Input placeholder="Type a tag and press Enter" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="rounded-full hover:bg-muted-foreground/20"><X className="h-3 w-3" /></button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </FormControl>
              <FormDescription>Add up to 10 tags.</FormDescription>
              {suggestedTags.length > 0 && (
                <div className="mt-2 p-3 bg-secondary/50 rounded-md">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><Tag className="h-4 w-4" />Suggested Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((tag) => (
                      <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-accent hover:text-accent-foreground" onClick={() => addSuggestedTag(tag)}>+ {tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <FormMessage />
            </FormItem>

            <FormField
              control={form.control}
              name="imageUrls"
              render={() => (
                <FormItem>
                  <FormLabel>Images</FormLabel>
                   <FormControl>
                    <Input type="file" accept="image/*" multiple onChange={handleImageChange} className="file:text-primary file:font-medium" disabled={totalImageCount >= 5}/>
                  </FormControl>
                  {(existingImageUrls.length > 0 || newImagePreviews.length > 0) && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {existingImageUrls.map((url, index) => (
                         <div key={url} className="relative group">
                            <div className="aspect-video rounded-lg overflow-hidden border">
                               <Image src={url} alt={`Existing image ${index+1}`} fill className="object-cover" />
                            </div>
                            <Button type="button" size="icon" variant="destructive" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeExistingImage(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                         </div>
                      ))}
                      {newImagePreviews.map((preview, index) => (
                         <div key={index} className="relative group">
                            <div className="aspect-video rounded-lg overflow-hidden border">
                               <Image src={preview} alt={`New image preview ${index+1}`} fill className="object-cover" />
                            </div>
                            <Button type="button" size="icon" variant="destructive" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeNewImage(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                         </div>
                      ))}
                    </div>
                  )}
                  <FormDescription>Manage your listing images. You can have up to 5 photos (max 4MB each).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
              {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
