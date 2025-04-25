import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { cn } from "@/lib/utils";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface GoogleButtonProps {
  className?: string;
}

export function GoogleButton({ className }: GoogleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Signed in user:", result.user);
      toast({
        title: "Successfully signed in!",
        description: `Welcome ${result.user.displayName}`,
      });
      // Here you would typically redirect to your dashboard
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="lg"
      className={cn(
        "w-full bg-white text-gray-800 hover:bg-gray-50 border border-gray-300 transition-all duration-300 flex items-center justify-center space-x-2 py-6 relative overflow-hidden group",
        className
      )}
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      <div className="flex items-center justify-center space-x-2 relative z-10">
        <GoogleIcon className="h-5 w-5" />
        <span>{isLoading ? "Signing in..." : "Sign in with Google"}</span>
      </div>
      <div className="absolute inset-0 bg-blue-50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </Button>
  );
}