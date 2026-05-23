import type { AppData } from './types';

export const MAX_IMPORT_FILE_BYTES = 12 * 1024 * 1024;
export const MAX_BACKUP_FILE_BYTES = 32 * 1024 * 1024;
export const MAX_CARDS_PER_IMPORT = 5000;
export const MAX_CARDS_PER_BACKUP = 10000;
export const MAX_REVIEW_EVENTS_PER_BACKUP = 200000;

const MAX_URL_LENGTH = 2048;
const explicitProtocolPattern = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
const localAssetPattern = /^[A-Za-z0-9._~!$&'()*+,;=:@/%-]+$/;
const allowedLocalAudioRoots = ['audio/', 'assets/audio/', 'media/audio/', 'sounds/'];

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return `${Math.ceil(bytes / 1024)} KB`;
}

function cleanUrlText(value: string): string {
  return value.trim();
}

export function isSafeHttpUrl(value: string): boolean {
  const text = cleanUrlText(value);
  if (!text || text.length > MAX_URL_LENGTH) {
    return false;
  }

  try {
    const parsed = new URL(text);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

export function isSafeRelativeAudioPath(value: string): boolean {
  const text = cleanUrlText(value);
  if (!text || text.length > MAX_URL_LENGTH || text.startsWith('//') || text.includes('\\') || /[\u0000-\u001f\u007f]/.test(text)) {
    return false;
  }

  if (explicitProtocolPattern.test(text)) {
    return false;
  }

  const normalized = text.replace(/^\/+/, '');
  if (!normalized || normalized.split('/').includes('..')) {
    return false;
  }

  return allowedLocalAudioRoots.some((root) => normalized.startsWith(root)) && localAssetPattern.test(normalized);
}

export function normalizeSafeAudioReference(value: string): string | null {
  const text = cleanUrlText(value);
  if (isSafeHttpUrl(text)) {
    return text;
  }

  if (isSafeRelativeAudioPath(text)) {
    return text.startsWith('/') ? text : `/${text}`;
  }

  return null;
}

export function isSafeAudioReference(value: string): boolean {
  return normalizeSafeAudioReference(value) !== null;
}

export function getImportFileValidationError(file: File): string | null {
  if (file.size > MAX_IMPORT_FILE_BYTES) {
    return `导入文件过大：当前 ${formatBytes(file.size)}，上限 ${formatBytes(MAX_IMPORT_FILE_BYTES)}。`;
  }

  return null;
}

export function getBackupFileValidationError(file: File): string | null {
  if (file.size > MAX_BACKUP_FILE_BYTES) {
    return `备份文件过大：当前 ${formatBytes(file.size)}，上限 ${formatBytes(MAX_BACKUP_FILE_BYTES)}。`;
  }

  return null;
}

export function getBackupDataValidationErrors(data: AppData): string[] {
  const errors: string[] = [];

  if (data.cards.length > MAX_CARDS_PER_BACKUP) {
    errors.push(`备份词卡数量 ${data.cards.length} 超过上限 ${MAX_CARDS_PER_BACKUP}。`);
  }

  if (data.review_events.length > MAX_REVIEW_EVENTS_PER_BACKUP) {
    errors.push(`复习事件数量 ${data.review_events.length} 超过上限 ${MAX_REVIEW_EVENTS_PER_BACKUP}。`);
  }

  return errors;
}
