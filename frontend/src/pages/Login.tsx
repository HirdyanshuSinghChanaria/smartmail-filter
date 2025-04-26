import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { LoginButton } from "@/components/LoginButton";
import { MailFilterIcon } from "@/components/icons/MailFilterIcon";

export function Login() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-200 via-indigo-100 to-pink-100 animate-gradient-x">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-2xl bg-white/60 backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:shadow-3xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4">
              <MailFilterIcon className="h-14 w-14 text-blue-500 drop-shadow-lg animate-float" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">SmartMail Filter</h1>
            <p className="text-base text-gray-600">
              Sign in with your Google account to continue
            </p>
          </CardHeader>
          <CardContent className="grid gap-4">
            <LoginButton />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-0">
            <div className="text-xs text-center text-gray-500">
              We respect your privacy. No spam, ever.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}