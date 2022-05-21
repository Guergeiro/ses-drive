import { ConfigObject } from "@nestjs/config";
import { readFile } from "fs/promises";
import { join } from "path";

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
  env["auth"] = auth();
  env["aws"] = aws();
  env["database"] = database();
  env["host"] = await host();
  env["ratelimiter"] = ratelimiter();
  env["recaptcha"] = recaptcha();

  return env;
}

async function version() {
  const packageJson = join(process.cwd(), "package.json");
  const { version } = JSON.parse(await readFile(packageJson, "utf8")) as Record<
    string,
    string
  >;
  const [major, ..._rest] = version.split(".");
  return parseInt(major);
}

function auth() {
  return {
    PEPPER: process.env.PEPPER || NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET || NODE_ENV,
    // Default 5min
    JWT_ACCESS_EXPIRY_TIME: parseInt(process.env.JWT_ACCESS_EXPIRY_TIME) || 300,
    // Default 1week
    JWT_REFRESH_EXPIRY_TIME:
      parseInt(process.env.JWT_REFRESH_EXPIRY_TIME) || 604800,
    JWT_REFRESH_TIMEOUT_LOWER_BOUND:
      parseInt(process.env.JWT_REFRESH_TIMEOUT_LOWER_BOUND) || 1000,
    JWT_REFRESH_TIMEOUT_UPPER_BOUND:
      parseInt(process.env.JWT_REFRESH_TIMEOUT_UPPER_BOUND) || 2000,
  };
}

function aws() {
  return {
    ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY,
    SECRET_KEY: process.env.AWS_SECRET_KEY,
    REGION: process.env.AWS_REGION,
  };
}

function database() {
  return {
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    HOST: process.env.DB_HOST,
    NAME: process.env.DB_NAME,
  };
}

async function host() {
  const v = await version();
  return {
    URL: process.env.URL || "0.0.0.0",
    PORT: parseInt(process.env.PORT) || 3000,
    VERSION: v,
    PREFIX: `api/v${v}`,
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
