import "dotenv/config";
import cors from "cors";
import express from "express";
import multer from "multer";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import {
  addMessage,
  addSeeMore,
  blockUser,
  createLike,
  createReport,
  conversationForMatch,
  dashboardForUser,
  getCompliments,
  getDiscover,
  getLikesReceived,
  getMatchDetails,
  getMatches,
  getPersonalityTestQuestions,
  getQuestions,
  getSettings,
  getUserFromToken,
  login,
  matchQualityBreakdown,
  messagesForMatch,
  moderationQueue,
  passProfile,
  patchSettings,
  profileForUser,
  profileSchema,
  savePromptAnswers,
  savePersonalityTest,
  sendCompliment,
  signup,
  signupSchema,
  undoLastPass,
  updateCompliment,
  updateSettings,
  upsertProfile,
  verifyPhoto,
  trustForUser,
  addMessageReaction
} from "./store";

const app = express();
const server = createServer(app);
const port = Number(process.env.PORT || 4100);
const upload = multer({
  dest: process.env.UPLOAD_DIR || "uploads",
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      callback(new Error("Photos must be JPEG, PNG, or WEBP files."));
      return;
    }
    callback(null, true);
  }
});
const photoUpload = upload.array("photos", 6);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static(process.env.UPLOAD_DIR || "uploads"));

function auth(request: express.Request, response: express.Response, next: express.NextFunction) {
  const user = getUserFromToken(request.headers.authorization);
  if (!user) return response.status(401).json({ error: "Authentication required" });
  response.locals.user = user;
  next();
}

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, app: "ClearMatch" });
});

app.post("/api/auth/signup", async (request, response) => {
  try {
    const input = signupSchema.parse(request.body);
    response.json(await signup(input.email, input.password));
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Signup failed" });
  }
});

app.post("/api/auth/login", async (request, response) => {
  try {
    const input = signupSchema.parse(request.body);
    response.json(await login(input.email, input.password));
  } catch (error) {
    response.status(401).json({ error: error instanceof Error ? error.message : "Login failed" });
  }
});

app.get("/api/me", auth, (request, response) => {
  response.json({ user: response.locals.user, profile: profileForUser(response.locals.user.id) });
});

app.get("/api/profile", auth, (_request, response) => {
  response.json(profileForUser(response.locals.user.id));
});

app.get("/api/questions", auth, (_request, response) => {
  response.json(getQuestions());
});

app.get("/api/personality-test", auth, (_request, response) => {
  response.json(getPersonalityTestQuestions());
});

app.post("/api/profile/answers", auth, (request, response) => {
  try {
    response.json(savePromptAnswers(response.locals.user.id, request.body));
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Could not save answers" });
  }
});

app.post("/api/personality-test", auth, (request, response) => {
  try {
    response.json(savePersonalityTest(response.locals.user.id, request.body));
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Could not save personality test" });
  }
});

app.put("/api/profile", auth, (request, response) => {
  try {
    const input = profileSchema.parse(request.body);
    response.json(upsertProfile(response.locals.user.id, input));
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Profile validation failed" });
  }
});

app.post("/api/photos", auth, (request, response) => {
  photoUpload(request, response, (error) => {
    if (error) {
      const message = error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
        ? "Each photo must be under 4 MB."
        : error instanceof Error ? error.message : "Photo validation failed.";
      response.status(400).json({ error: message });
      return;
    }
    const files = (request.files || []) as Express.Multer.File[];
    if (!files.length) {
      response.status(400).json({ error: "Choose at least one JPEG, PNG, or WEBP photo to validate." });
      return;
    }
    response.json({
      photos: files.map((file) => ({
        url: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
        sizeBytes: file.size
      })),
      message: `${files.length} photo${files.length === 1 ? "" : "s"} passed validation.`
    });
  });
});

app.get("/api/discover", auth, (_request, response) => {
  response.json(getDiscover(response.locals.user.id));
});

app.get("/api/profiles/:profileId", auth, (request, response) => {
  const profileId = String(request.params.profileId);
  const details = getMatchDetails(response.locals.user.id, profileId);
  if (!details) return response.status(404).json({ error: "Profile not found" });
  addSeeMore(response.locals.user.id, profileId);
  response.json(details);
});

app.post("/api/profiles/:userId/like", auth, (request, response) => {
  try {
    response.json(createLike(response.locals.user.id, String(request.params.userId), request.body.type === "super_like" ? "super_like" : "like"));
  } catch (error) {
    response.status(429).json({ error: error instanceof Error ? error.message : "Like failed" });
  }
});

app.post("/api/profiles/:userId/pass", auth, (request, response) => {
  response.json(passProfile(response.locals.user.id, String(request.params.userId)));
});

app.post("/api/passes/undo", auth, (_request, response) => {
  response.json({ restored: undoLastPass(response.locals.user.id) });
});

app.get("/api/likes", auth, (_request, response) => {
  response.json(getLikesReceived(response.locals.user.id));
});

app.get("/api/matches", auth, async (_request, response) => {
  response.json(await getMatches(response.locals.user.id));
});

app.get("/api/matches/:matchId/messages", auth, async (request, response) => {
  try {
    response.json(await messagesForMatch(String(request.params.matchId), response.locals.user.id));
  } catch (error) {
    response.status(404).json({ error: error instanceof Error ? error.message : "Match not found" });
  }
});

app.get("/api/messages/:matchId", auth, async (request, response) => {
  try {
    response.json(await messagesForMatch(String(request.params.matchId), response.locals.user.id));
  } catch (error) {
    response.status(404).json({ error: error instanceof Error ? error.message : "Match not found" });
  }
});

app.post("/api/messages", auth, (request, response) => {
  try {
    response.json(addMessage(String(request.body.matchId), response.locals.user.id, String(request.body.body || "")));
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Message failed" });
  }
});

app.get("/api/matches/:matchId/conversation", auth, async (request, response) => {
  try {
    response.json(await conversationForMatch(String(request.params.matchId), response.locals.user.id));
  } catch (error) {
    response.status(404).json({ error: error instanceof Error ? error.message : "Match not found" });
  }
});

app.get("/api/matches/:matchId/quality", auth, (request, response) => {
  try {
    response.json(matchQualityBreakdown(String(request.params.matchId), response.locals.user.id));
  } catch (error) {
    response.status(404).json({ error: error instanceof Error ? error.message : "Match not found" });
  }
});

app.get("/api/trust", auth, (_request, response) => {
  response.json(trustForUser(response.locals.user.id));
});

app.post("/api/trust/photo-verification", auth, (_request, response) => {
  response.json(verifyPhoto(response.locals.user.id));
});

app.get("/api/analytics/match-quality", auth, (_request, response) => {
  response.json(dashboardForUser(response.locals.user.id));
});

app.get("/api/compliments", auth, (_request, response) => {
  response.json(getCompliments(response.locals.user.id));
});

app.post("/api/compliments", auth, (request, response) => {
  try {
    response.json(sendCompliment(response.locals.user.id, request.body));
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Compliment failed" });
  }
});

app.patch("/api/compliments/:complimentId", auth, (request, response) => {
  try {
    response.json(updateCompliment(response.locals.user.id, String(request.params.complimentId), request.body.status));
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Compliment update failed" });
  }
});

app.post("/api/reports", auth, (request, response) => {
  response.json(createReport(response.locals.user.id, request.body.reportedUserId, request.body.reason, request.body.details || ""));
});

app.post("/api/like", auth, (request, response) => {
  try {
    response.json(createLike(response.locals.user.id, String(request.body.toUserId), request.body.type === "super_like" ? "super_like" : "like"));
  } catch (error) {
    response.status(429).json({ error: error instanceof Error ? error.message : "Like failed" });
  }
});

app.post("/api/block", auth, (request, response) => {
  response.json(blockUser(response.locals.user.id, request.body.blockedUserId));
});

app.put("/api/settings", auth, (request, response) => {
  response.json(updateSettings(response.locals.user.id, request.body));
});

app.get("/api/settings", auth, (_request, response) => {
  response.json(getSettings(response.locals.user.id));
});

app.patch("/api/settings", auth, (request, response) => {
  response.json(patchSettings(response.locals.user.id, request.body));
});

app.post("/api/messages/:messageId/reactions", auth, (request, response) => {
  try {
    response.json(addMessageReaction(String(request.params.messageId), response.locals.user.id, request.body));
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Reaction failed" });
  }
});

app.get("/api/admin/reports", auth, (_request, response) => {
  response.json(moderationQueue());
});

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (socket, request) => {
  const token = new URL(request.url || "", "http://localhost").searchParams.get("token") || undefined;
  const user = getUserFromToken(token);
  if (!user) {
    socket.close();
    return;
  }

  socket.on("message", (raw) => {
    const event = JSON.parse(raw.toString()) as { type: string; matchId: string; body?: string };
    if (event.type === "typing") {
      wss.clients.forEach((client) => client.send(JSON.stringify({ type: "typing", matchId: event.matchId, fromUserId: user.id })));
    }
    if (event.type === "message" && event.body) {
      try {
        const message = addMessage(event.matchId, user.id, event.body);
        wss.clients.forEach((client) => client.send(JSON.stringify({ type: "message", message })));
      } catch (error) {
        socket.send(JSON.stringify({ type: "error", error: error instanceof Error ? error.message : "Message failed" }));
      }
    }
    if (event.type === "read") {
      wss.clients.forEach((client) => client.send(JSON.stringify({ type: "read", matchId: event.matchId, fromUserId: user.id, at: new Date().toISOString() })));
    }
  });
});

server.listen(port, () => {
  console.log(`ClearMatch API listening on http://localhost:${port}`);
});
