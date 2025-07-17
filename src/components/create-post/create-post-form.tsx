
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Lightbulb, Loader2, Tag, X, Image as ImageIcon } from "lucide-react";
import { getTagSuggestions, createPost } from "@/app/create-post/actions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useAuth } from "@/context/auth-context";
import Image from 'next/image';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100),
  description: z.string().min(20, "Description must be at least 20 characters.").max(5000),
  category: z.enum(["Electronics", "Services", "Housing", "Events", "For Sale"]),
  price: z.coerce.number().min(0, "Price can't be negative.").optional(),
  location: z.string().min(2, "Location is required."),
  tags: z.array(z.string()).max(10, "You can add up to 10 tags."),
  imageUrl: z.string().refine((val) => val.length > 0, { message: "Please upload an image." }),
});

type FormValues = z.infer<typeof formSchema>;

interface CreatePostFormProps {
  userLocation?: string;
}

export default function CreatePostForm({ userLocation }: CreatePostFormProps) {
  const { user } = useAuth();
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState("");
  const [suggestedTags, setSuggestedTags] = React.useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: userLocation || "",
      tags: [],
      price: 0,
      imageUrl: "",
    },
  });

  React.useEffect(() => {
    form.setValue("tags", tags);
  }, [tags, form]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        form.setError("imageUrl", { message: "Image is too large. Max size is 4MB." });
        return;
      }
       if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        form.setError("imageUrl", { message: "Invalid image format. Please use JPG, PNG, or WEBP." });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        form.setValue("imageUrl", dataUrl);
        form.clearErrors("imageUrl");
      };
      reader.readAsDataURL(file);
    }
  };


  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      if (tags.length < 10 && !tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };
  
  const addSuggestedTag = (tag: string) => {
    if (tags.length < 10 && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setSuggestedTags(suggestedTags.filter(t => t !== tag));
  }

  const handleSuggestTags = async () => {
    const { title, description } = form.getValues();
    if (!title || !description) {
      toast({
        variant: "destructive",
        title: "Title and Description Needed",
        description: "Please fill out the title and description before suggesting tags.",
      });
      return;
    }
    setIsSuggesting(true);
    try {
      const result = await getTagSuggestions({ title, description });
      const newSuggestions = result.tags.filter(tag => !tags.includes(tag));
      setSuggestedTags(newSuggestions);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Suggestion Failed",
        description: "Could not get tag suggestions. Please try again.",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  async function onSubmit(values: FormValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to create a post.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const idToken = await user.getIdToken();
      await createPost(values, idToken);
      // On success, the server action will redirect.
    } catch (error: any) {
      if (error.message.includes('NEXT_REDIRECT')) {
        // This is expected on success, so we re-throw it to let Next.js handle it.
        throw error;
      }
       toast({
          variant: 'destructive',
          title: 'Submission Failed',
          description: error.message || 'Could not create your post. Please try again.',
      });
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Create a New Listing</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
             <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                   <FormControl>
                    <Input type="file" accept="image/*" onChange={handleImageChange} className="file:text-primary file:font-medium" />
                  </FormControl>
                  {imagePreview && (
                    <div className="mt-4 relative w-full aspect-video rounded-lg overflow-hidden border">
                       <Image src={imagePreview} alt="Image preview" fill className="object-cover" />
                    </div>
                  )}
                  <FormDescription>Upload a high-quality photo of your item (max 4MB).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    <Textarea placeholder="Describe your item, service, or announcement in detail." className="min-h-[150px]" {...field} />
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
                   <Input
                    placeholder="Type a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="rounded-full hover:bg-muted-foreground/20">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                Add up to 10 tags to help people find your listing.
              </FormDescription>
              {suggestedTags.length > 0 && (
                <div className="mt-2 p-3 bg-secondary/50 rounded-md">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><Tag className="h-4 w-4"/>Suggested Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((tag) => (
                      <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-accent hover:text-accent-foreground" onClick={() => addSuggestedTag(tag)}>
                        + {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <FormMessage />
            </FormItem>
            
            <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : "Create Post"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
