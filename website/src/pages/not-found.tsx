import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <p className="text-primary text-xs tracking-widest uppercase font-semibold mb-3">404</p>
        <h1 className="font-serif text-5xl font-bold text-foreground mb-4">Page Not Found</h1>
        <p className="text-muted-foreground text-base mb-8 max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
