import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { LoginButton } from "@/components/LoginButton";
import { MailFilterIcon } from "@/components/icons/MailFilterIcon";

export function Login() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4">
              <MailFilterIcon className="h-12 w-12 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome to SmartMail Filter</h1>
            <p className="text-sm text-gray-500">
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