import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { DeviceJSON } from "../../models/e2ee.js";
import { parseDeviceJSON } from "./device-json.js";

export function readDeviceJSONFile(path: string): DeviceJSON | null {
  if (!existsSync(path)) return null;
  return parseDeviceJSON(readFileSync(path, "utf8"));
}

export function writeDeviceJSONFile(path: string, data: string): void {
  writeFileSync(path, data, { mode: 0o600 });
}
