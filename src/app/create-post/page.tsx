import Header from "@/components/layout/header";
import CreatePostForm from "@/components/create-post/create-post-form";

export default function CreatePostPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <CreatePostForm />
      </main>
    </div>
  );
}
