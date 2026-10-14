import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { I18nProvider } from '../i18n';
import { documentsApi } from '../services/api';
import DocumentPreview from './DocumentPreview';
import { HTML, PDF, PNG } from '../test/files';

vi.mock('../services/api', async (importOriginal) => ({
  ...(await importOriginal()),
  documentsApi: { file: vi.fn() },
}));

const doc = { id: '3f2b8c1e-9d4a-4c6b-8e2f-1a2b3c4d5e6f', document_type: 'passport' };

function serve(data, contentType) {
  documentsApi.file.mockResolvedValue({ blob: new Blob([data]), contentType });
}

function show(props = {}) {
  return render(
    <I18nProvider>
      <DocumentPreview doc={doc} title="Passport" onClose={() => {}} {...props} />
    </I18nProvider>
  );
}

function embeddedContent() {
  return document.querySelectorAll('iframe, object, embed, frame');
}

describe('DocumentPreview', () => {
  beforeEach(() => {
    localStorage.setItem('vizaexpress-lang', 'en');
    let n = 0;
    URL.createObjectURL = vi.fn(() => `blob:test/${(n += 1)}`);
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    documentsApi.file.mockReset();
  });

  it('shows a photo in an image element (F1)', async () => {
    serve(PNG, 'image/png');
    show({ doc: { ...doc, document_type: 'photo' } });
    const img = await screen.findByRole('img', { name: 'Passport' });
    expect(img.getAttribute('src')).toBe('blob:test/1');
    expect(URL.createObjectURL.mock.calls[0][0].type).toBe('image/png');
    expect(screen.getByRole('link', { name: /download/i }).getAttribute('download')).toBe(`photo-${doc.id}.png`);
    expect(window.open).not.toHaveBeenCalled();
  });

  it('offers a file the server calls HTML only as a download (F2)', async () => {
    serve(HTML, 'text/html');
    show();
    await screen.findByText(/preview is shown for photos only/i);
    expect(screen.queryByRole('img')).toBeNull();
    expect(embeddedContent()).toHaveLength(0);
    expect(URL.createObjectURL.mock.calls[0][0].type).toBe('application/octet-stream');
    expect(screen.getByRole('link', { name: /download/i }).getAttribute('download')).toBe(`passport-${doc.id}.bin`);
    expect(window.open).not.toHaveBeenCalled();
  });

  it('offers a PDF only as a download (F3)', async () => {
    serve(PDF, 'application/pdf');
    show();
    await screen.findByText(/preview is shown for photos only/i);
    expect(screen.queryByRole('img')).toBeNull();
    expect(embeddedContent()).toHaveLength(0);
    expect(screen.getByRole('link', { name: /download/i }).getAttribute('download')).toBe(`passport-${doc.id}.pdf`);
    expect(window.open).not.toHaveBeenCalled();
  });

  it('does not preview HTML sent with an image type', async () => {
    serve(HTML, 'image/png');
    show();
    await screen.findByText(/preview is shown for photos only/i);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByRole('link', { name: /download/i }).getAttribute('download')).toBe(`passport-${doc.id}.bin`);
  });

  it('explains a missing file', async () => {
    documentsApi.file.mockRejectedValue({ response: { status: 410, data: new Blob() } });
    show();
    expect((await screen.findByRole('alert')).textContent).toMatch(/no longer available/i);
    expect(screen.queryByRole('link', { name: /download/i })).toBeNull();
  });

  it('releases the file when closed', async () => {
    serve(PNG, 'image/png');
    const view = show();
    await screen.findByRole('img');
    view.unmount();
    await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test/1'));
  });
});
