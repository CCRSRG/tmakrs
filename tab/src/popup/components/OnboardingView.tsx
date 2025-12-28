/**
 * 首次配置引导视图
 */

import { t } from '@/lib/i18n';

interface OnboardingViewProps {
  openOptions: () => void;
}

export function OnboardingView({ openOptions }: OnboardingViewProps) {
  return (
    <div className="relative h-[80vh] min-h-[580px] w-[380px] overflow-hidden rounded-2xl bg-[var(--tab-popup-onboarding-bg)] text-[var(--tab-popup-primary-text)] shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tab-popup-onboarding-radial-top),transparent_70%)] opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tab-popup-onboarding-radial-bottom),transparent_65%)] opacity-80" />
      <div className="absolute inset-0 bg-[color:var(--tab-popup-onboarding-overlay)] backdrop-blur-2xl" />
      
      <div className="relative flex h-full flex-col">
        <OnboardingHeader />
        <OnboardingMain />
        <OnboardingFooter openOptions={openOptions} />
      </div>
    </div>
  );
}

function OnboardingHeader() {
  return (
    <header className="px-6 pt-8 pb-6">
      <div className="rounded-3xl border border-[color:var(--tab-popup-onboarding-card-border)] bg-[color:var(--tab-popup-onboarding-card-bg)] p-5 shadow-xl shadow-[color:var(--tab-popup-onboarding-shadow)] backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--tab-popup-primary-from)] to-[var(--tab-popup-primary-via)] shadow-lg shadow-[color:var(--tab-popup-primary-shadow-strong)]">
            <svg className="h-6 w-6 text-[var(--tab-popup-primary-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--tab-popup-onboarding-label)]">Onboarding</p>
            <h1 className="text-2xl font-semibold text-[var(--tab-popup-primary-text)]">{t('popup_welcome')}</h1>
            <p className="text-sm text-[color:var(--tab-popup-onboarding-desc)]">{t('popup_welcome_desc')}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function OnboardingMain() {
  return (
    <main className="flex-1 space-y-5 overflow-y-auto px-6 pb-6">
      <RequiredInfoSection />
      <TipsSection />
    </main>
  );
}

function RequiredInfoSection() {
  const steps = [
    {
      num: 1,
      title: t('popup_config_ai_key'),
      desc: t('onboarding_ai_key_desc'),
    },
    {
      num: 2,
      title: t('popup_config_site_url'),
      desc: t('onboarding_site_url_desc'),
    },
    {
      num: 3,
      title: t('popup_config_site_key'),
      desc: t('onboarding_site_key_desc'),
    },
  ];

  return (
    <section className="rounded-3xl border border-[color:var(--tab-popup-onboarding-card-border)] bg-[color:var(--tab-popup-onboarding-subtle-bg)] p-5 shadow-inner shadow-[color:var(--tab-popup-onboarding-shadow)] backdrop-blur-xl">
      <h2 className="text-sm font-semibold text-[var(--tab-popup-primary-text)]">{t('popup_required_info')}</h2>
      <p className="mt-1 text-xs text-[color:var(--tab-popup-onboarding-label)]">{t('popup_required_info_desc')}</p>
      <ol className="mt-4 space-y-3 text-xs text-[color:var(--tab-popup-onboarding-desc)]">
        {steps.map((step) => (
          <li key={step.num} className="flex gap-3 rounded-2xl border border-[color:var(--tab-popup-onboarding-subtle-border)] bg-[color:var(--tab-popup-onboarding-subtle-bg)] p-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-xl bg-[color:var(--tab-popup-onboarding-tip-bg)] text-[11px] font-semibold text-[var(--tab-popup-onboarding-tip-text)]">{step.num}</span>
            <div>
              <p className="font-semibold text-[var(--tab-popup-primary-text)]">{step.title}</p>
              <p className="mt-1 text-[11px] text-[color:var(--tab-popup-onboarding-label)]">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function TipsSection() {
  const tips = [
    t('onboarding_tip_1'),
    t('onboarding_tip_2'),
    t('onboarding_tip_3'),
  ];

  return (
    <section className="rounded-3xl border border-[color:var(--tab-popup-onboarding-card-border)] bg-gradient-to-br from-[color:var(--tab-popup-onboarding-tip-bg)] via-[color:var(--tab-popup-onboarding-tip-bg)] to-[color:var(--tab-popup-onboarding-tip-bg)] p-5 shadow-lg shadow-[color:var(--tab-popup-onboarding-shadow)] backdrop-blur-xl">
      <h2 className="text-sm font-semibold text-[var(--tab-popup-primary-text)]">{t('popup_tips')}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-[11px] text-[color:var(--tab-popup-onboarding-desc)]">
        {tips.map((tip, idx) => (
          <li key={idx}>{tip}</li>
        ))}
      </ul>
    </section>
  );
}

function OnboardingFooter({ openOptions }: { openOptions: () => void }) {
  return (
    <footer className="px-6 pb-6">
      <button
        onClick={openOptions}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--tab-popup-primary-from)] via-[var(--tab-popup-primary-via)] to-[var(--tab-popup-primary-to)] px-6 py-3 text-sm font-semibold text-[var(--tab-popup-primary-text)] shadow-lg shadow-[color:var(--tab-popup-primary-shadow)] transition-all duration-200 hover:shadow-xl hover:shadow-[color:var(--tab-popup-primary-shadow-strong)] active:scale-95"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        {t('popup_go_settings')}
      </button>
    </footer>
  );
}
