// The admin panel is for the VizaExpress team and stays in Turkish.
export const ADMIN_STATUS = {
  created: 'Ödeme bekliyor',
  paid: 'Ödendi',
  pending: 'Beklemede',
  reviewing: 'İnceleniyor',
  approved: 'Onaylandı',
  rejected: 'Düzeltme gerekli',
};
export const PLAN_NAMES = { express: 'Express', smart: 'Smart', concierge: 'Concierge' };

export function formatDateTime(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '–';
  return d.toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

