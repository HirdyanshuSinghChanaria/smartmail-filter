import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoginButton } from "@/components/LoginButton";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<any[]>([]);
  const [showSignup, setShowSignup] = useState(false);

  // Only use timer for popup
  useEffect(() => {
    const timer = setTimeout(() => setShowSignup(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Handler for reload all mails
  const handleReloadMails = async () => {
    const googleAccessToken = localStorage.getItem("googleAccessToken");
    if (!googleAccessToken) {
      setOpen(true); // Ask to sign in if not already
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/all-mails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleAccessToken }),
      });
      const data = await res.json();
      setEmails(data.emails || []);
    } catch (err) {
      alert("Failed to reload mails.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-200 via-indigo-100 to-pink-100 flex flex-col items-center justify-center relative overflow-x-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300 rounded-full opacity-30 blur-3xl animate-pulse -z-10" style={{animationDuration: "6s"}} />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300 rounded-full opacity-30 blur-3xl animate-pulse -z-10" style={{animationDuration: "8s"}} />

      {/* App Illustration */}
      <img
        src="https://imgs.search.brave.com/poX8AeMpucE_UFiS1fK6GftHuuv-_OFnaj-TZDEkhp0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Y3VzdG9tZ3VpZGUu/Y29tL2ltYWdlcy9j/b3Zlci1pbWFnZXMv/Z21haWwud2VicA"
        alt="SmartMail Illustration"
        className="w-72 h-72 object-contain mb-8 drop-shadow-xl animate-float"
        draggable={false}
      />

      {/* App Title and Description */}
      <h1 className="text-5xl font-extrabold text-gray-900 drop-shadow-lg mb-4 animate-fade-in">
        SmartMail Filter
      </h1>
      <p className="text-lg text-gray-700 mb-8 max-w-xl text-center animate-fade-in delay-200">
        Organize and filter your emails with AI-powered magic. Sign in to experience a smarter inbox!
      </p>

      {/* Call to Action Button */}
      <button
        className="px-8 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all text-lg font-semibold animate-bounce"
        onClick={() => setShowSignup(true)}
      >
        Get Started
      </button>

      {/* Reload All Mails Button */}
      <button
        className="mt-4 px-6 py-2 bg-green-600 text-white rounded-full shadow hover:bg-green-700 transition-all text-base font-semibold"
        onClick={handleReloadMails}
        disabled={loading}
      >
        {loading ? "Reloading..." : "Reload All Mails"}
      </button>

      {/* Show emails if loaded */}
      {emails.length > 0 && (
        <div className="w-full max-w-5xl mt-8 bg-white/80 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-blue-700">All Mails</h3>
          <ul className="space-y-4">
            {emails.map(email => (
              <li key={email.id} className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="font-semibold text-gray-800">{email.subject}</div>
                <div className="text-sm text-gray-600">From: {email.from}</div>
                <div className="text-xs text-gray-400">Date: {email.date}</div>
                {(email.bodyText || email.snippet) && (
                  <div className="mt-2 text-gray-700 text-sm">
                    <strong>Message:</strong>{" "}
                    {email.bodyText
                      ? <pre style={{whiteSpace: "pre-wrap"}}>{email.bodyText}</pre>
                      : email.snippet}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* For scroll demonstration */}
      <div style={{ height: "120vh" }} />

      {/* Team Section */}
      <div className="w-full max-w-5xl flex flex-col items-center mt-12 mb-8">
        <div className="w-full bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center border border-blue-100 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-2 tracking-wide flex items-center gap-2">
            <span className="inline-block animate-float">🚀</span>
            Team <span className="text-pink-600 font-extrabold">KanyeDev</span>
          </h2>
          <div className="flex flex-col md:flex-row gap-4 mt-2">
            <div className="flex flex-col items-center">
              <img src="https://ui-avatars.com/api/?name=Ayush+Kalakoti&background=4f8cff&color=fff&rounded=true&size=64" alt="Ayush Kalakoti" className="w-16 h-16 rounded-full shadow-md mb-1 border-2 border-blue-300" />
              <span className="font-medium text-gray-800">Ayush Kalakoti</span>
            </div>
            <div className="flex flex-col items-center">
              <img src="https://ui-avatars.com/api/?name=Hirdyanshu&background=ff7eb3&color=fff&rounded=true&size=64" alt="Hirdyanshu" className="w-16 h-16 rounded-full shadow-md mb-1 border-2 border-pink-300" />
              <span className="font-medium text-gray-800">Hirdyanshu</span>
            </div>
            <div className="flex flex-col items-center">
              <img src="https://ui-avatars.com/api/?name=Gaurav+Verma&background=7ee787&color=fff&rounded=true&size=64" alt="Gaurav Verma" className="w-16 h-16 rounded-full shadow-md mb-1 border-2 border-green-300" />
              <span className="font-medium text-gray-800">Gaurav Verma</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 italic animate-fade-in delay-300">
            Building with ❤️ for the hackathon!
          </div>
        </div>
      </div>

      {/* Signup Dialog */}
      {showSignup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Sign up to continue</h2>
            <p className="mb-6 text-gray-600 text-center">Sign in with your Google account to experience a smarter inbox!</p>
            <div className="w-full flex flex-col items-center">
              <LoginButton className="w-full" />
            </div>
            <button
              className="mt-4 text-sm text-gray-500 hover:underline"
              onClick={() => setShowSignup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Signup Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign up to continue</DialogTitle>
          </DialogHeader>
          <LoginButton />
        </DialogContent>
      </Dialog>
    </div>
  );
}
