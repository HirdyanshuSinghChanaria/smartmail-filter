import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useGoogleLogin } from '@react-oauth/google';

interface LoginButtonProps {
  className?: string;
}

interface EmailHeader {
  name: string;
  value: string;
}
interface Email {
  id: string;
  snippet: string;
  headers: EmailHeader[];
}

export function LoginButton({ className }: LoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [emails, setEmails] = useState<Email[]>([]);

  const handleGoogleLogin = useGoogleLogin({
    scope: "https://www.googleapis.com/auth/gmail.readonly",
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        
        // 1. Get user info from Google using fetch
        const userInfo = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { 
            headers: { 
              Authorization: `Bearer ${tokenResponse.access_token}` 
            } 
          }
        ).then(res => res.json());

        // 2. Send to your backend API using fetch
        const backendResponse = await fetch(
          'http://localhost:3000/api/auth/google',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              googleAccessToken: tokenResponse.access_token,
              keywords: ['invoice', 'payment', 'urgent'] // example keywords
            })
          }
        ).then(res => res.json());

        // 3. Handle successful login
        toast({
          title: "Login successful",
          description: `Welcome ${userInfo.name}!`,
        });

        console.log('User data:', backendResponse);
        setEmails(backendResponse.emails || []);

      } catch (error) {
        console.error('Login error:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to sign in with Google",
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Google login failed",
      });
    }
  });

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className={cn(
          "w-full bg-white text-gray-800 hover:bg-gray-50 border border-gray-300 transition-all duration-300 flex items-center justify-center space-x-2 py-6 relative overflow-hidden group",
          className
        )}
        onClick={() => handleGoogleLogin()}
        disabled={isLoading}
      >
        <div className="relative z-10 flex items-center justify-center space-x-2">
          <GoogleIcon className="w-5 h-5" />
          <span>{isLoading ? "Signing in..." : "Sign in with Google"}</span>
        </div>
        <div className="absolute inset-0 transition-transform duration-300 origin-left transform scale-x-0 bg-blue-50 group-hover:scale-x-100"></div>
      </Button>
      {/* Show emails after login */}
      {emails.length > 0 && (
        <div className="mt-4 text-left">
          <h3 className="font-bold mb-2">Filtered Emails:</h3>
          <ul className="space-y-2">
            {emails.map(email => (
              <li key={email.id} className="p-2 bg-gray-100 rounded">
                <div>
                  <strong>Subject:</strong> {email.subject}
                </div>
                <div>
                  <strong>From:</strong> {email.from}
                </div>
                <div>
                  <strong>Date:</strong> {email.date}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}