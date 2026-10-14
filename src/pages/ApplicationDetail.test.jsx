import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { I18nProvider } from '../i18n';
import { applicationsApi, documentsApi } from '../services/api';
import ApplicationDetail from './ApplicationDetail';
import { HTML, PNG } from '../test/files';

vi.mock('../services/api', async (importOriginal) => ({
  ...(await importOriginal()),
  applicationsApi: { get: vi.fn() },
  documentsApi: { file: vi.fn(), upload: vi.fn() },
}));

const application = { id: '9b1d4c1e-0000-4000-8000-000000000001', package_type: 'smart', status: 'paid', created_at: '2026-10-01T10:00:00Z' };
const photo = {
  id: '9b1d4c1e-0000-4000-8000-000000000002',
  document_type: 'photo',
  original_filename: '<img src=x onerror=alert(1)>.png',
  ai_validation_status: 'passed',
  ai_validation_result: { passed: true, score: 90, summary: 'Looks good', issues: [], recommendations: [] },
  created_at: '2026-10-01T10:00:00Z',
};

function renderPage() {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={[`/application/${application.id}`]}>
        <Routes>
          <Route path="/application/:id" element={<ApplicationDetail />} />
        </Routes>
      </MemoryRouter>
    </I18nProvider>
  );
}

function card(name) {
  return screen.getByRole('heading', { name }).closest('.overflow-hidden');
}

function pick(cardElement, file) {
  fireEvent.change(cardElement.querySelector('input[type=file]'), { target: { files: [file] } });
}

describe('ApplicationDetail documents', () => {
  beforeEach(() => {
    localStorage.setItem('vizaexpress-lang', 'en');
    URL.createObjectURL = vi.fn(() => 'blob:test/1');
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(window, 'open').mockImplementation(() => null);
    applicationsApi.get.mockResolvedValue({ data: { application, documents: [photo] } });
    documentsApi.file.mockResolvedValue({ blob: new Blob([PNG]), contentType: 'image/png' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('shows the uploaded file name as text (F4)', async () => {
    renderPage();
    await screen.findByRole('heading', { name: 'Biometric photo' });
    expect(screen.getByText('<img src=x onerror=alert(1)>.png')).toBeTruthy();
    expect(document.querySelector('img[src="x"]')).toBeNull();
  });

  it('opens the document in a dialog instead of a new tab', async () => {
    renderPage();
    await screen.findByRole('heading', { name: 'Biometric photo' });
    fireEvent.click(within(card('Biometric photo')).getByRole('button', { name: /view/i }));
    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByRole('img')).toBeTruthy();
    expect(documentsApi.file).toHaveBeenCalledWith(photo.id);
    expect(window.open).not.toHaveBeenCalled();
  });

  it('stops a disguised file before uploading it', async () => {
    renderPage();
    await screen.findByRole('heading', { name: 'Passport' });
    pick(card('Passport'), new File([HTML], 'passport.png', { type: 'image/png' }));
    expect(await within(card('Passport')).findByText(/only jpg, png, webp and pdf/i)).toBeTruthy();
    expect(documentsApi.upload).not.toHaveBeenCalled();
  });

  it('explains why the server refused a file', async () => {
    documentsApi.upload.mockRejectedValue({ response: { status: 415, data: { code: 'PDF_ACTIVE_CONTENT' } } });
    renderPage();
    await screen.findByRole('heading', { name: 'Passport' });
    pick(card('Passport'), new File([PNG], 'passport.png', { type: 'image/png' }));
    expect(await within(card('Passport')).findByText(/scripts, attachments or interactive elements/i)).toBeTruthy();
    expect(documentsApi.upload).toHaveBeenCalledTimes(1);
  });
});
