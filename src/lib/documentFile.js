import { errorMessage } from '../services/api';

// Helpers for uploaded documents. Photos are previewed in an <img>; every other
// file is only offered as a download and is never opened inside the site.

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const UPLOAD_ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf';

const EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};
const PREVIEW_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function readBytes(blob) {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

// Names the format of a file from its first bytes, or returns null.
export async function detectFileType(blob) {
  const head = new Uint8Array(await readBytes(blob.slice(0, 12)));
  const startsWith = (bytes, offset = 0) => bytes.every((b, i) => head[offset + i] === b);
  if (startsWith([0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) return 'image/webp';
  if (startsWith([0x25, 0x50, 0x44, 0x46, 0x2d])) return 'application/pdf';
  return null;
}

function baseType(contentType) {
  return String(contentType || '').split(';')[0].trim().toLowerCase();
}

// A download name built only from the document's type and id, never from the
// name the file was uploaded with.
export function documentFileName(doc, contentType) {
  const part = (value) => String(value ?? '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'document';
  return `${part(doc?.document_type)}-${part(doc?.id)}.${EXTENSIONS[contentType] || 'bin'}`;
}

// Decides how a fetched document may be shown. A photo is previewed only when
// the server's type and the file's own bytes agree; anything else, PDFs
// included, becomes a plain download.
export async function prepareDocumentFile(data, contentType, doc) {
  const declared = baseType(contentType);
  const actual = await detectFileType(data);
  const matches = actual !== null && actual === declared;
  const filename = documentFileName(doc, matches ? declared : null);
  if (matches && PREVIEW_TYPES.has(declared)) {
    return { kind: 'image', blob: new Blob([data], { type: declared }), filename };
  }
  return { kind: 'download', blob: new Blob([data], { type: 'application/octet-stream' }), filename };
}

// Checks a picked file before upload so common mistakes get a quick answer.
// The server checks every file again.
export async function checkUploadFile(file) {
  if (file.size === 0) return 'application.uploadErrors.empty';
  if (file.size > MAX_UPLOAD_BYTES) return 'application.fileTooLarge';
  if (!(await detectFileType(file))) return 'application.wrongType';
  return null;
}

const UPLOAD_ERRORS = {
  UNSUPPORTED_FILE_TYPE: 'application.wrongType',
  FILE_UNREADABLE: 'application.uploadErrors.unreadable',
  PDF_ACTIVE_CONTENT: 'application.uploadErrors.pdfInteractive',
  PDF_ENCRYPTED: 'application.uploadErrors.pdfProtected',
  PDF_TOO_MANY_PAGES: 'application.uploadErrors.pdfTooManyPages',
  FILE_TOO_LARGE: 'application.fileTooLarge',
  FILE_EMPTY: 'application.uploadErrors.empty',
  FEATURE_DISABLED: 'application.uploadErrors.unavailable',
};

export function uploadErrorMessage(error, t) {
  const key = UPLOAD_ERRORS[error?.response?.data?.code];
  if (key) return t(key);
  if (error?.response?.status === 413) return t('application.fileTooLarge');
  return error?.response ? errorMessage(error, t) : t('application.uploadError');
}

export function fileErrorMessage(error, t) {
  const status = error?.response?.status;
  if (status === 404 || status === 410) return t('application.fileMissing');
  if (status === 503) return t('application.viewUnavailable');
  return errorMessage(error, t);
}
