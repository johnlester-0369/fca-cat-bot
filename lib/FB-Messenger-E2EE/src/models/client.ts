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

export interface ConnectE2EEOptions {
  userId: string;
  /** Raw device JSON string or parsed DeviceJSON object.
   *  Omit to start with a fresh in-memory device (requires new ICDC registration). */
  deviceData?: string | Record<string, unknown>;
  /** Called whenever Signal key material or JIDs change so the consumer can
   *  persist the updated device without the library touching the filesystem. */
  onUpdateDevice?: (deviceData: string) => void;
}

export type MessengerEventMap = {
  [E in MessengerEvent as E["type"]]: E["data"];
} & {
  event: MessengerEvent;
};
