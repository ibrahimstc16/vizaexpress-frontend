import { Check } from 'lucide-react';
import { PLANS } from '../../config/site';
import { useI18n } from '../../i18n';
import { useAuth } from '../../lib/auth';
import Button from '../ui/Button';
import { cx } from '../ui/cx';

export default function PricingCards() {
  const { t, formatNumber } = useI18n();
  const { user } = useAuth();

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {PLANS.map((plan) => {
        const features = t(`plans.${plan.id}.features`);
        const name = t(`plans.${plan.id}.name`);
        const href = user ? `/dashboard?plan=${plan.id}` : `/register?plan=${plan.id}`;
        return (
          <div
            key={plan.id}
            className={cx(
              'relative flex flex-col rounded-2xl border bg-white p-7 shadow-card',
              plan.popular ? 'border-brand-600 ring-1 ring-brand-600 lg:-my-3 lg:py-10' : 'border-ink-100'
            )}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-7 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                {t('common.mostPopular')}
              </span>
            )}
            <h3 className="text-lg font-bold">{name}</h3>
            <p className="mt-2 min-h-[48px] text-sm leading-relaxed text-ink-600">{t(`plans.${plan.id}.description`)}</p>
            <p className="mt-6 flex items-baseline gap-1.5">
              <span className="font-display text-4xl font-extrabold tracking-tight text-ink-950">{formatNumber(plan.price)}</span>
              <span className="text-base font-semibold text-ink-500">{t('common.pln')}</span>
            </p>
            <p className="mt-1 text-sm text-ink-500">{t('common.perApplication')}</p>
            <ul className="mt-7 flex-1 space-y-3">
              {Array.isArray(features) &&
                features.map((f) => (
                  <li key={f} className="flex gap-3 text-[15px] text-ink-700">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                    {f}
                  </li>
                ))}
            </ul>
            <Button to={href} variant={plan.popular ? 'primary' : 'secondary'} className="mt-8 w-full">
              {t('plans.choose', { plan: name })}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
