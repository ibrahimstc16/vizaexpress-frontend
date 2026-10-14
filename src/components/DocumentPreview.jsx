import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { useI18n } from '../i18n';
import { documentsApi } from '../services/api';
import { fileErrorMessage, prepareDocumentFile } from '../lib/documentFile';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Alert from './ui/Alert';
import Spinner from './ui/Spinner';

// Shows one uploaded document in a dialog. Photos are drawn in an <img>; any
// other file is offered as a download, so it is never opened as a page here.
export default function DocumentPreview({ doc, title, onClose }) {
  const { t } = useI18n();
  const [view, setView] = useState({ status: 'loading' });
  const { id, document_type: documentType } = doc;

  useEffect(() => {
    let cancelled = false;
    let url = null;
    documentsApi.file(id)
      .then(({ blob, contentType }) => prepareDocumentFile(blob, contentType, { id, document_type: documentType }))
      .then((file) => {
        if (cancelled) return;
        url = URL.createObjectURL(file.blob);
        setView({ status: 'ready', kind: file.kind, url, filename: file.filename });
      })
      .catch((err) => {
        if (!cancelled) setView({ status: 'error', message: fileErrorMessage(err, t) });
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id, documentType, t]);

  return (
    <Modal open onClose={onClose} title={title} closeLabel={t('common.close')} size="max-w-3xl">
      {view.status === 'loading' && (
        <div className="flex justify-center py-12">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      )}

      {view.status === 'error' && <Alert tone="error">{view.message}</Alert>}

      {view.status === 'ready' && view.kind === 'image' && (
        <img
          src={view.url}
          alt={title}
          className="mx-auto max-h-[65vh] w-auto rounded-xl border border-ink-100 object-contain"
        />
      )}

      {view.status === 'ready' && view.kind === 'download' && (
        <div className="flex items-start gap-3 rounded-xl bg-ink-50 p-5 text-sm leading-relaxed text-ink-600">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-ink-400" aria-hidden="true" />
          <p>{t('application.downloadOnly')}</p>
        </div>
      )}

      {view.status === 'ready' && (
        <div className="mt-5 flex justify-end">
          <Button href={view.url} download={view.filename} variant="secondary" size="sm">
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {t('application.download')}
          </Button>
        </div>
      )}
    </Modal>
  );
}
