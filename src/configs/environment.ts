import { ConfigObject } from "@nestjs/config";

const NODE_ENV = process.env.NODE_ENV || "development";

const env: ConfigObject = {};

export async function environment() {
  if (Object.keys(env).length !== 0) {
    return env;
  }

  if (NODE_ENV === "development") {
    await import("dotenv/config");
  }

  env["NODE_ENV"] = NODE_ENV;
  env["database"] = database();
  env["host"] = host();
  env["ratelimiter"] = ratelimiter();
  env["recaptcha"] = recaptcha();

  return env;
}

function database() {
  return {
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    HOST: process.env.DB_HOST,
    NAME: process.env.DB_NAME,
  };
}

function host() {
  return {
    URL: process.env.URL || "0.0.0.0",
    PORT: parseInt(process.env.PORT) || 3000,
  };
}

function ratelimiter() {
  return {
    // 500 pedidos por IP, por 300s (5min)
    TTL: parseInt(process.env.TTL) || 300,
    LIMIT: parseInt(process.env.LIMIT) || 500,
  };
}

function recaptcha() {
  return {
    SECRET: process.env.RECAPTCHA_SECRET,
    MIN_SCORE: parseFloat(process.env.RECAPTCHA_MIN_SCORE) || 0.5,
  };
}
