const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "https://vidyasetu-frontend.onrender.com",
];

const parseOrigins = (value) =>
  value
    ? value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

const allowAllOrigins = process.env.CORS_ALLOW_ALL === "true";

const allowedOrigins = [
  ...defaultAllowedOrigins,
  ...parseOrigins(process.env.CLIENT_URL),
  ...parseOrigins(process.env.CLIENT_URLS),
  ...parseOrigins(process.env.FRONTEND_URL),
  ...parseOrigins(process.env.FRONTEND_URLS),
];

const originSet = new Set(allowedOrigins);
console.log("✅ CORS allowed origins:", Array.from(originSet));
if (allowAllOrigins) {
  console.log("⚠️ CORS_ALLOW_ALL=true: permissive CORS is enabled");
}

const isLanDevOrigin = (origin) => {
  if (process.env.NODE_ENV === "production") return false;

  try {
    const { protocol, hostname, port } = new URL(origin);
    const isHttp = protocol === "http:" || protocol === "https:";
    const isVitePort = port === "5173" || port === "4173";
    const isPrivateHost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);

    return isHttp && isVitePort && isPrivateHost;
  } catch {
    return false;
  }
};

const corsOrigin = (origin, callback) => {
  console.log("🔍 CORS request origin:", origin);

  if (allowAllOrigins) {
    callback(null, true);
    return;
  }

  if (!origin || originSet.has(origin) || isLanDevOrigin(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`Origin ${origin} is not allowed by CORS`));
};

const corsOptions = {
  origin: corsOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Authorization",
    "Accept",
    "Cache-Control",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ],
  exposedHeaders: ["Authorization"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

module.exports = { corsOptions, allowedOrigins };
