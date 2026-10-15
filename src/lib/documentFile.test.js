import { describe, expect, it } from 'vitest';
import {
  MAX_UPLOAD_BYTES,
  checkUploadFile,
  detectFileType,
  documentFileName,
  fileErrorMessage,
  prepareDocumentFile,
  uploadErrorMessage,
} from './documentFile';
import { HTML, JPEG, PDF, PNG, WEBP } from '../test/files';

const t = (key) => key;
const blob = (data, type = '') => new Blob([data], { type });
const doc = { id: '3f2b8c1e-9d4a-4c6b-8e2f-1a2b3c4d5e6f', document_type: 'passport' };

describe('detectFileType', () => {
  it('recognises the accepted formats from their bytes', async () => {
    expect(await detectFileType(blob(JPEG))).toBe('image/jpeg');
    expect(await detectFileType(blob(PNG))).toBe('image/png');
    expect(await detectFileType(blob(WEBP))).toBe('image/webp');
    expect(await detectFileType(blob(PDF))).toBe('application/pdf');
  });

  it('ignores the declared type', async () => {
    expect(await detectFileType(blob(HTML, 'image/png'))).toBeNull();
    expect(await detectFileType(blob(new Uint8Array(0), 'image/png'))).toBeNull();
  });
});

describe('prepareDocumentFile', () => {
  it('previews a photo whose bytes match the server type', async () => {
    const file = await prepareDocumentFile(blob(PNG), 'image/png', { ...doc, document_type: 'photo' });
    expect(file.kind).toBe('image');
    expect(file.blob.type).toBe('image/png');
    expect(file.filename).toBe(`photo-${doc.id}.png`);
  });

  it('accepts type parameters and letter case', async () => {
    expect((await prepareDocumentFile(blob(JPEG), 'Image/JPEG; charset=binary', doc)).kind).toBe('image');
  });

  it('offers PDFs as a download only', async () => {
    const file = await prepareDocumentFile(blob(PDF), 'application/pdf', doc);
    expect(file.kind).toBe('download');
    expect(file.blob.type).toBe('application/octet-stream');
    expect(file.filename).toBe(`passport-${doc.id}.pdf`);
  });

  it('never previews a file whose bytes and type disagree', async () => {
    for (const [data, type] of [[HTML, 'image/png'], [PNG, 'text/html'], [JPEG, 'image/png'], [HTML, 'text/html'], [PNG, '']]) {
      const file = await prepareDocumentFile(blob(data), type, doc);
      expect(file.kind).toBe('download');
      expect(file.blob.type).toBe('application/octet-stream');
      expect(file.filename).toBe(`passport-${doc.id}.bin`);
    }
  });
});

describe('documentFileName', () => {
  it('uses only safe characters', () => {
    expect(documentFileName({ document_type: '../x"', id: '<img src=x>' }, 'image/png')).toBe('x-imgsrcx.png');
    expect(documentFileName({}, null)).toBe('document-document.bin');
  });
});

describe('checkUploadFile', () => {
  it('passes accepted files', async () => {
    expect(await checkUploadFile(new File([PNG], 'scan.png', { type: 'image/png' }))).toBeNull();
    expect(await checkUploadFile(new File([PDF], 'scan.pdf', { type: '' }))).toBeNull();
  });

  it('stops empty, oversized and disguised files', async () => {
    expect(await checkUploadFile(new File([], 'empty.png'))).toBe('application.uploadErrors.empty');
    expect(await checkUploadFile(new File([new Uint8Array(MAX_UPLOAD_BYTES + 1)], 'big.png'))).toBe('application.fileTooLarge');
    expect(await checkUploadFile(new File([HTML], 'scan.png', { type: 'image/png' }))).toBe('application.wrongType');
  });
});

describe('error messages', () => {
  const failed = (status, data = {}) => ({ response: { status, data } });

  it('translates upload error codes from the server', () => {
    expect(uploadErrorMessage(failed(415, { code: 'PDF_ACTIVE_CONTENT' }), t)).toBe('application.uploadErrors.pdfInteractive');
    expect(uploadErrorMessage(failed(415, { code: 'PDF_ENCRYPTED' }), t)).toBe('application.uploadErrors.pdfProtected');
    expect(uploadErrorMessage(failed(415, { code: 'PDF_TOO_MANY_PAGES' }), t)).toBe('application.uploadErrors.pdfTooManyPages');
    expect(uploadErrorMessage(failed(415, { code: 'FILE_UNREADABLE' }), t)).toBe('application.uploadErrors.unreadable');
    expect(uploadErrorMessage(failed(415, { code: 'UNSUPPORTED_FILE_TYPE' }), t)).toBe('application.wrongType');
    expect(uploadErrorMessage(failed(503, { code: 'FEATURE_DISABLED' }), t)).toBe('application.uploadErrors.unavailable');
    expect(uploadErrorMessage(failed(413), t)).toBe('application.fileTooLarge');
    expect(uploadErrorMessage(failed(400, { error: 'Server says no' }), t)).toBe('Server says no');
    expect(uploadErrorMessage({}, t)).toBe('application.uploadError');
  });

  it('translates file errors', () => {
    expect(fileErrorMessage(failed(410), t)).toBe('application.fileMissing');
    expect(fileErrorMessage(failed(404), t)).toBe('application.fileMissing');
    expect(fileErrorMessage(failed(503), t)).toBe('application.viewUnavailable');
    expect(fileErrorMessage({}, t)).toBe('common.networkError');
  });
});
