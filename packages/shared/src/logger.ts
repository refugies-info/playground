import pino from "pino";

// biome-ignore lint/suspicious/noExplicitAny: Check for window presence safely
const isBrowser = typeof (globalThis as any).window !== "undefined";
const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    isDev && !isBrowser
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname",
            translateTime: "SYS:standard",
          },
        }
      : undefined,
});
