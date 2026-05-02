const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "submissions.json");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]\n");
  }
}

function readSubmissions() {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")).map((submission) => ({
      status: "active",
      ...submission
    }));
  } catch (error) {
    return [];
  }
}

function writeSubmissions(submissions) {
  ensureStore();
  fs.writeFileSync(DATA_FILE, `${JSON.stringify(submissions, null, 2)}\n`);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Request body too large."));
      }
    });

    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": contentTypes[".json"],
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  response.end(JSON.stringify(payload));
}

function clean(value) {
  return String(value || "").trim();
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function validateSubmission(payload) {
  const submission = {
    id: makeId(),
    college: clean(payload.college) || "JECRC University, Jaipur",
    course: clean(payload.course),
    fullName: clean(payload.fullName),
    email: clean(payload.email),
    mobile: clean(payload.mobile),
    state: clean(payload.state),
    source: clean(payload.source) || "website",
    status: "active",
    createdAt: new Date().toISOString()
  };

  const missing = ["course", "fullName", "email", "mobile", "state"].filter((field) => !submission[field]);
  if (missing.length > 0) {
    return { error: `Missing required field(s): ${missing.join(", ")}` };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email)) {
    return { error: "Please enter a valid email address." };
  }

  if (!/^[0-9+\-\s()]{7,20}$/.test(submission.mobile)) {
    return { error: "Please enter a valid mobile number." };
  }

  return { submission };
}

async function handleApi(request, response) {
  const parsedUrl = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "GET" && parsedUrl.pathname === "/api/applications") {
    const status = parsedUrl.searchParams.get("status");
    const submissions = readSubmissions();
    sendJson(response, 200, status ? submissions.filter((submission) => submission.status === status) : submissions);
    return;
  }

  if (request.method === "POST" && parsedUrl.pathname === "/api/applications") {
    try {
      const body = await readBody(request);
      const payload = JSON.parse(body || "{}");
      const result = validateSubmission(payload);

      if (result.error) {
        sendJson(response, 400, { ok: false, error: result.error });
        return;
      }

      const submissions = readSubmissions();
      submissions.unshift(result.submission);
      writeSubmissions(submissions);
      sendJson(response, 201, { ok: true, application: result.submission });
    } catch (error) {
      sendJson(response, 400, { ok: false, error: "Could not save this application." });
    }
    return;
  }

  if (request.method === "PATCH" && /^\/api\/applications\/[^/]+$/.test(parsedUrl.pathname)) {
    try {
      const id = decodeURIComponent(parsedUrl.pathname.split("/").pop());
      const body = await readBody(request);
      const payload = JSON.parse(body || "{}");
      const nextStatus = clean(payload.status);

      if (!["active", "trash"].includes(nextStatus)) {
        sendJson(response, 400, { ok: false, error: "Invalid lead status." });
        return;
      }

      const submissions = readSubmissions();
      const submission = submissions.find((item) => item.id === id);

      if (!submission) {
        sendJson(response, 404, { ok: false, error: "Lead not found." });
        return;
      }

      submission.status = nextStatus;
      submission.updatedAt = new Date().toISOString();
      writeSubmissions(submissions);
      sendJson(response, 200, { ok: true, application: submission });
    } catch (error) {
      sendJson(response, 400, { ok: false, error: "Could not update this lead." });
    }
    return;
  }

  sendJson(response, 404, { ok: false, error: "API route not found." });
}

function serveFile(request, response) {
  const parsedUrl = new URL(request.url, `http://${request.headers.host}`);
  const pathname = parsedUrl.pathname === "/" ? "/index.html" : parsedUrl.pathname;
  const requestedPath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, requestedPath);

  if (!filePath.startsWith(ROOT)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, { "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream" });
    response.end(data);
  });
}

const server = http.createServer((request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    response.end();
    return;
  }

  if (request.url.startsWith("/api/")) {
    handleApi(request, response);
    return;
  }

  response.writeHead(200, {
  "Content-Type": "text/plain"
});
response.end("API is running...");
});

server.listen(PORT, () => {
  ensureStore();
  console.log(`College listing server running at http://localhost:${PORT}`);
  console.log(`View saved applications at http://localhost:${PORT}/admin.html`);
});
