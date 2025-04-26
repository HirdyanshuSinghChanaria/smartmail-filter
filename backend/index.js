import express from "express";
import dotenv from "dotenv";
import imaps from "imap-simple";
import cors from "cors";
import { google } from "googleapis";

dotenv.config();

const app = express();

// Remove or set COOP/COEP headers to avoid browser warnings
app.use((req, res, next) => {
  res.removeHeader("Cross-Origin-Opener-Policy");
  res.removeHeader("Cross-Origin-Embedder-Policy");
  // Or explicitly set to unsafe-none if needed:
  // res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  // res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/api/mails", async (req, res) => {
  const config = {
    imap: {
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASS,
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      tls: true,
      authTimeout: 10000,
    },
  };

  try {
    const connection = await imaps.connect(config);
    await connection.openBox("INBOX");
    const searchCriteria = ["ALL"];
    const fetchOptions = { bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)"], struct: true };
    const messages = await connection.search(searchCriteria, fetchOptions);

    const mails = messages.map(item => {
      const header = item.parts[0].body;
      return {
        from: header.from ? header.from[0] : "",
        to: header.to ? header.to[0] : "",
        subject: header.subject ? header.subject[0] : "",
        date: header.date ? header.date[0] : "",
      };
    });

    res.json(mails);
    connection.end();
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch mails", details: err.message });
  }
});

// Helper to extract plain text and HTML from Gmail API message payload
function extractMailContent(payload) {
  let bodyText = "";
  let bodyHtml = "";

  function traverse(parts) {
    if (!parts) return;
    for (const part of parts) {
      if (part.mimeType === "text/plain" && part.body && part.body.data) {
        bodyText += Buffer.from(part.body.data, "base64").toString("utf-8");
      }
      if (part.mimeType === "text/html" && part.body && part.body.data) {
        bodyHtml += Buffer.from(part.body.data, "base64").toString("utf-8");
      }
      if (part.parts) traverse(part.parts);
    }
  }

  if (payload.parts) {
    traverse(payload.parts);
  } else if (payload.body && payload.body.data) {
    // Single-part message
    if (payload.mimeType === "text/plain") {
      bodyText += Buffer.from(payload.body.data, "base64").toString("utf-8");
    }
    if (payload.mimeType === "text/html") {
      bodyHtml += Buffer.from(payload.body.data, "base64").toString("utf-8");
    }
  }

  return { bodyText, bodyHtml };
}

// Rule-based priority assignment helper
function assignPriority({ subject = "", bodyText = "", snippet = "", from = "" }) {
  // Expanded keyword lists
  const highKeywords = [
    "urgent", "important", "immediate", "asap", "action required", "deadline", "final notice",
    "critical", "alert", "respond now", "response needed", "attention", "overdue", "fail", "failed",
    "payment due", "last chance", "security", "suspended", "blocked", "account locked", "warning",
    "reminder", "today", "expire", "expiring", "submission", "result declared", "result out"
  ];
  const mediumKeywords = [
    "reminder", "upcoming", "soon", "scheduled", "meeting", "appointment", "follow up", "pending",
    "review", "update", "notification", "invitation", "invite", "request", "expected", "processing",
    "awaiting", "in progress", "due", "next week", "tomorrow", "event", "exam", "assessment"
  ];
  const lowKeywords = [
    "newsletter", "promotion", "offer", "discount", "sale", "info", "information", "news", "update",
    "welcome", "thank you", "thanks", "subscribed", "subscription", "registered", "registration",
    "survey", "feedback", "report", "summary", "digest"
  ];

  const content = (subject + " " + (bodyText || "") + " " + (snippet || "")).toLowerCase();
  const fromLower = (from || "").toLowerCase();

  // Exclude mails from "stake" from being high priority
  if (
    highKeywords.some(word => content.includes(word)) &&
    !fromLower.includes("stake")
  ) {
    return { value: "high", reason: "Matched high-priority keywords" };
  }
  // Check for medium priority keywords
  if (mediumKeywords.some(word => content.includes(word))) {
    return { value: "medium", reason: "Matched medium-priority keywords" };
  }
  // Check for low priority keywords
  if (lowKeywords.some(word => content.includes(word))) {
    return { value: "low", reason: "Matched low-priority keywords" };
  }

  // Try to extract a date (YYYY-MM-DD or DD/MM/YYYY or similar)
  const dateRegex = /\b(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})\b/;
  const match = content.match(dateRegex);
  if (match) {
    let dateStr = match[0];
    let date;
    if (dateStr.includes("-")) {
      date = new Date(dateStr);
    } else if (dateStr.includes("/")) {
      const [d, m, y] = dateStr.split("/");
      date = new Date(`${y}-${m}-${d}`);
    }
    if (!isNaN(date)) {
      const today = new Date();
      const diffDays = (date - today) / (1000 * 60 * 60 * 24);
      if (diffDays < 3) return { value: "high", reason: "Date is very close" };
      if (diffDays < 7) return { value: "medium", reason: "Date is soon" };
      return { value: "low", reason: "Date is far" };
    }
  }

  return { value: "low", reason: "No priority keywords or dates found" };
}

app.post("/api/auth/google", async (req, res) => {
  const { googleAccessToken, keywords, priority, prioritySort } = req.body;
  if (!googleAccessToken) {
    return res.status(400).json({ error: "Missing access token" });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: googleAccessToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Search for emails matching keywords, or get latest 10 emails
    let query = "";
    if (Array.isArray(keywords) && keywords.length > 0) {
      query = keywords.map(k => `"${k}"`).join(" OR ");
    }

    const messagesRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
      q: query || undefined,
    });

    const messages = messagesRes.data.messages || [];
    const emails = [];

    for (const msg of messages) {
      const msgRes = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "Date"],
      });
      const headers = msgRes.data.payload.headers;
      const getHeader = (name) =>
        headers.find((h) => h.name === name)?.value || "";
      // Only include from, subject, date
      emails.push({
        id: msg.id,
        from: getHeader("From"),
        subject: getHeader("Subject"),
        date: getHeader("Date"),
      });
    }

    // Sort emails by priority (high > medium > low or low > medium > high), then by date
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sortDir = prioritySort === "low-to-high" ? 1 : -1;
    emails.sort((a, b) => {
      const pa = priorityOrder[a.priority] ?? 3;
      const pb = priorityOrder[b.priority] ?? 3;
      if (pa !== pb) return sortDir * (pa - pb);
      return new Date(b.date) - new Date(a.date);
    });

    // Filter by priority if requested
    let filteredEmails = emails;
    if (priority && ["high", "medium", "low"].includes(priority)) {
      filteredEmails = emails.filter(e => e.priority === priority);
    }

    // Only return from, subject, date in the response
    res.json({ emails: filteredEmails.map(({ from, subject, date }) => ({ from, subject, date })) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch emails", details: err.message });
  }
});

app.post("/api/all-mails", async (req, res) => {
  const { googleAccessToken, keywords, priority, prioritySort } = req.body;
  if (!googleAccessToken) {
    return res.status(400).json({ error: "Missing access token" });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: googleAccessToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    let query = "";
    if (Array.isArray(keywords) && keywords.length > 0) {
      query = keywords.map(k => `"${k}"`).join(" OR ");
    }

    const messagesRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: 50, // fetch more mails for better sorting/filtering
      q: query || undefined,
    });
    const messages = messagesRes.data.messages || [];
    const emails = [];

    for (const msg of messages) {
      const msgRes = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "Date"],
      });
      const headers = msgRes.data.payload.headers;
      const getHeader = (name) =>
        headers.find((h) => h.name === name)?.value || "";
      // Assign priority to each email
      const email = {
        id: msg.id,
        from: getHeader("From"),
        subject: getHeader("Subject"),
        date: getHeader("Date"),
      };
      // Assign priority using subject/bodyText/snippet/from (bodyText/snippet not available here)
      email.priority = assignPriority({ subject: email.subject, from: email.from }).value;
      emails.push(email);
    }

    // Sort emails by priority (high > medium > low or low > medium > high), then by date
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    let sortDir = -1;
    if (prioritySort === "low-to-high") sortDir = 1;
    // default to high-to-low if not set
    emails.sort((a, b) => {
      const pa = priorityOrder[a.priority] ?? 3;
      const pb = priorityOrder[b.priority] ?? 3;
      if (pa !== pb) return sortDir * (pa - pb);
      return new Date(b.date) - new Date(a.date);
    });

    // Filter by priority if requested and not "all"
    let filteredEmails = emails;
    if (
      priority &&
      ["high", "medium", "low"].includes(priority)
    ) {
      filteredEmails = emails.filter(e => e.priority === priority);
    }
    // If priority is "all" or not set, do not filter

    // Only return from, subject, date in the response
    res.json({ emails: filteredEmails.map(({ from, subject, date }) => ({ from, subject, date })) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all emails", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
