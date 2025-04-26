import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Email {
  id: string;
  from: string;
  subject: string;
  date: string;
  snippet?: string;
}

export default function AllMails() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [prioritySort, setPrioritySort] = useState("high-to-low"); // "high-to-low" or "low-to-high"

  // Show signup dialog after 5 seconds, only if not logged in
  useEffect(() => {
    const googleAccessToken = localStorage.getItem("googleAccessToken");
    if (!googleAccessToken) {
      const timer = setTimeout(() => setShowSignup(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Fetch emails on mount
  useEffect(() => {
    handleReloadMails();
    // eslint-disable-next-line
  }, []);

  const handleReloadMails = async () => {
    const googleAccessToken = localStorage.getItem("googleAccessToken");
    if (!googleAccessToken) {
      setShowSignup(true); // Show signup dialog if not signed in
      return;
    }
    setLoading(true);
    try {
      // Send keyword and prioritySort to backend
      const res = await fetch("http://localhost:3000/api/all-mails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleAccessToken,
          keywords: keyword ? [keyword] : [],
          prioritySort,
        }),
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
    <div className="min-h-screen w-screen flex flex-col items-center bg-gradient-to-br from-blue-100 via-indigo-50 to-pink-50 py-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">All Mails</h1>
      {/* Filter Controls */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by keyword"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          className="px-3 py-2 rounded-lg border border-blue-300 bg-white/90 text-blue-900 placeholder:text-blue-400 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <select
          value={prioritySort}
          onChange={e => setPrioritySort(e.target.value)}
          className="px-3 py-2 rounded-lg border border-blue-300 bg-white/90 text-blue-900 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        >
          <option value="high-to-low">Priority: Low to High</option>
          <option value="low-to-high">Priority: High to Low</option>
        </select>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
          onClick={handleReloadMails}
          disabled={loading}
        >
          Sort
        </button>
      </div>
      <button
        className="mb-6 px-6 py-2 bg-green-600 text-white rounded-full shadow hover:bg-green-700 transition-all text-base font-semibold"
        onClick={handleReloadMails}
        disabled={loading}
      >
        {loading ? "Reloading..." : "Reload All Mails"}
      </button>
      {emails.length > 0 ? (
        <div className="w-full max-w-5xl bg-white/80 rounded-xl shadow-lg p-6">
          <ul className="space-y-4">
            {emails.map(email => (
              <li key={email.id} className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="font-semibold text-gray-800">{email.subject}</div>
                <div className="text-sm text-gray-600">From: {email.from}</div>
                <div className="text-xs text-gray-400">Date: {email.date}</div>
                {/* Show priority and reason */}
                {email.priority && (
                  <div className={`inline-block px-2 py-1 rounded text-xs font-bold mt-1
                    ${email.priority === "high" ? "bg-red-200 text-red-800" :
                      email.priority === "medium" ? "bg-yellow-200 text-yellow-800" :
                      "bg-green-200 text-green-800"}`}>
                    Priority: {email.priority.charAt(0).toUpperCase() + email.priority.slice(1)}
                    {email.priorityReason && (
                      <span className="ml-2 text-gray-500 font-normal">({email.priorityReason})</span>
                    )}
                  </div>
                )}
                {/* Message section removed */}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-gray-500 mt-8">No emails loaded yet.</div>
      )}
      {/* Signup Dialog */}
      {showSignup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Sign up to continue</h2>
            <p className="mb-6 text-gray-600 text-center">Sign in with your Google account to access all your mails.</p>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition"
              onClick={() => {
                setShowSignup(false);
                window.location.href = "/login";
              }}
            >
              Sign in with Google
            </button>
            <button
              className="mt-4 text-sm text-gray-500 hover:underline"
              onClick={() => setShowSignup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
