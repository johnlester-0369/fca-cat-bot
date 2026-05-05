import type { MessengerEvent, Platform } from "./domain.ts";

export interface ClientOptions {
  appStatePath?: string;
  appState?: any[] | string;
  sessionStorePath?: string;
  platform?: Platform;
  /** Pre-authenticated FCA API instance. When supplied, FBClient passes it directly to
   *  ClientController.connect() and skips its own fca-unofficial login round-trip. */
  api?: any;
}

export interface SessionData {
  userId: string;
  appState: Array<{ key: string; value: string }>;
  platform: Platform;
  updatedAt: number;
}

export interface SessionRepository {
  read(path: string): Promise<SessionData | null>;
  write(path: string, session: SessionData): Promise<void>;
}

export type MessengerEventMap = {
  [E in MessengerEvent as E["type"]]: E["data"];
} & {
  event: MessengerEvent;
};
