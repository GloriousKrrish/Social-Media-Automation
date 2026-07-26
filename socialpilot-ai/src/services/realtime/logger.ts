/**
 * SocialPilot AI — Enterprise Realtime Structured Logger & Observability
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export class RealtimeLogger {
  private static isDev = process.env.NODE_ENV !== "production";

  private static maskSecrets(message: string | object): string {
    const str = typeof message === "object" ? JSON.stringify(message) : String(message);
    return str
      .replace(/Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*/gi, "Bearer [MASKED_TOKEN]")
      .replace(/key-[A-Za-z0-9]{10,}/gi, "key-[MASKED_KEY]")
      .replace(/"(access_token|refresh_token|secret|password)":\s*"[^"]+"/gi, '"$1":"[MASKED]"');
  }

  private static format(level: LogLevel, scope: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    return `[Realtime][${timestamp}][${level.toUpperCase()}][${scope}] ${message}${
      data !== undefined ? ` | ${this.maskSecrets(data)}` : ""
    }`;
  }

  public static debug(scope: string, message: string, data?: any): void {
    if (this.isDev) {
      console.debug(this.format("debug", scope, message, data));
    }
  }

  public static info(scope: string, message: string, data?: any): void {
    if (this.isDev) {
      console.info(this.format("info", scope, message, data));
    }
  }

  public static warn(scope: string, message: string, data?: any): void {
    console.warn(this.format("warn", scope, message, data));
  }

  public static error(scope: string, message: string, error?: any): void {
    console.error(this.format("error", scope, message, error));
  }
}
