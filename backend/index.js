import express from "express";
import dotenv from "dotenv";
import imaps from "imap-simple";
import cors from "cors";
import { google } from "googleapis";

dotenv.config();

const app = express();
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

app.post("/api/auth/google", async (req, res) => {
  const { googleAccessToken, keywords } = req.body;
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
      emails.push({
        id: msg.id,
        from: getHeader("From"),
        subject: getHeader("Subject"),
        date: getHeader("Date"),
      });
    }

    res.json({ emails });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch emails", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
