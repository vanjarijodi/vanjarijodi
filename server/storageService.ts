import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('[Storage] Failed to create data directory:', err);
  }
}

/**
 * Safely loads JSON data from a file in data/ directory.
 * If file does not exist or has invalid JSON, returns the provided default value.
 */
export function loadJsonData<T>(fileName: string, defaultValue: T): T {
  try {
    const filePath = path.join(DATA_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    if (!content.trim()) return defaultValue;
    return JSON.parse(content) as T;
  } catch (err) {
    console.warn(`[Storage] Failed to read ${fileName}, using fallback:`, err);
    return defaultValue;
  }
}

/**
 * Safely writes JSON data to a file in data/ directory.
 * Writes to a temporary file first then renames for atomic write safety.
 */
export function saveJsonData<T>(fileName: string, data: T): boolean {
  try {
    const filePath = path.join(DATA_DIR, fileName);
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    const serialized = JSON.stringify(data, null, 2);
    fs.writeFileSync(tempPath, serialized, 'utf-8');
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (err) {
    console.error(`[Storage] Failed to save ${fileName}:`, err);
    return false;
  }
}
