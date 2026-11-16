import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '../components/ui.jsx';
import { useI18n } from '../i18n/index.jsx';
import { useDocumentTitle } from '../lib/hooks.js';
import { SITE_CONTACT } from '../siteConfig.js';

const SAFETY = {
  ar: ['قابل البائع في مكان عام ومزدحم، ويفضل نهاراً.', 'افحص المنتج جيداً قبل الدفع، وجرّب الأجهزة الإلكترونية.', 'لا ترسل أي مبلغ مقدماً عبر تطبيقات التحويل قبل استلام المنتج.', 'بالنسبة للسيارات والعقارات، تحقق من الأوراق الرسمية قبل الاتفاق.', 'استخدم نظام الرسائل في المنصة لحفظ سجل المحادثة.', 'أبلغ عن أي إعلان مشبوه باستخدام زر «الإبلاغ عن الإعلان».'],
  fr: ['Rencontrez le vendeur dans un lieu public et fréquenté, de préférence en journée.', 'Inspectez l’article avant de payer et testez les appareils électroniques.', 'N’envoyez jamais d’argent à l’avance par transfert avant de recevoir l’article.', 'Pour les véhicules et l’immobilier, vérifiez les documents officiels.', 'Utilisez la messagerie de la plateforme pour garder une trace des échanges.', 'Signalez toute annonce suspecte avec le bouton « Signaler l’annonce ».'],
  en: ['Meet the seller in a busy public place, ideally during the day.', 'Inspect the item before paying and test electronics.', 'Never send money in advance by transfer before receiving the item.', 'For vehicles and real estate, check the official papers.', 'Use the platform’s messaging so the conversation is on record.', 'Report suspicious listings with the “Report listing” button.'],
};

export function Safety() {
  const { t, lang } = useI18n();
  useDocumentTitle(t('footer.safety'));
  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold"><Icon name="shield" className="h-7 w-7 text-brand-700" />{t('footer.safety')}</h1>
      <p className="mb-6 text-slate-600">{t('product.paymentNote')}</p>
      <ol className="space-y-3">
        {SAFETY[lang].map((tip, i) => (
          <li key={i} className="card flex gap-3 p-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-400 text-sm font-bold">{i + 1}</span>
            <span className="text-slate-700">{tip}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function NotFound() {
  const { t } = useI18n();
  useDocumentTitle(t('notFound.title'));
  return (
    <div className="container-page flex flex-col items-center py-20 text-center">
      <p className="text-6xl font-bold text-brand-700">404</p>
      <h1 className="mt-4 text-2xl font-bold">{t('notFound.title')}</h1>
      <p className="mt-2 text-slate-600">{t('notFound.text')}</p>
      <Link to="/" className="btn-primary mt-6">{t('notFound.home')}</Link>
    </div>
  );
}

export function About() {
  const { t } = useI18n();
  const { hash } = useLocation();
  useDocumentTitle(t('about.title'));
  useEffect(() => {
    if (hash === '#contact') setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [hash]);
  const wa = SITE_CONTACT.whatsapp.replace(/[^\d]/g, '');
  return (
    <div className="container-page max-w-4xl space-y-6 py-10">
      <div className="rounded-3xl bg-gradient-to-bl from-brand-700 to-brand-900 p-8 text-white">
        <h1 className="text-3xl font-bold text-white">{t('about.title')}</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-white/85">{t('about.intro')}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="card p-6">
          <h2 className="mb-2 text-lg font-bold">{t('about.missionTitle')}</h2>
          <p className="leading-relaxed text-slate-600">{t('about.mission')}</p>
        </section>
        <section className="card p-6">
          <h2 className="mb-3 text-lg font-bold">{t('about.valuesTitle')}</h2>
          <ul className="space-y-2.5">
            {['v1', 'v2', 'v3', 'v4'].map((k) => (
              <li key={k} className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white"><Icon name="check" className="h-3.5 w-3.5" /></span>{t(`about.${k}`)}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section id="contact" className="card scroll-mt-24 p-6">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-bold"><Icon name="mail" className="h-5 w-5 text-brand-700" />{t('about.contactTitle')}</h2>
        {SITE_CONTACT.email || wa ? (
          <>
            <p className="mb-4 text-slate-600">{t('about.contactText')}</p>
            <div className="flex flex-wrap gap-3">
              {SITE_CONTACT.email && <a href={`mailto:${SITE_CONTACT.email}`} className="btn-outline" dir="ltr"><Icon name="mail" className="h-4 w-4" />{SITE_CONTACT.email}</a>}
              {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="btn bg-[#25D366] text-white hover:brightness-95">{t('about.whatsapp')} <span className="ltr-nums">{SITE_CONTACT.whatsapp}</span></a>}
            </div>
          </>
        ) : <p className="text-slate-600">{t('about.contactSoon')}</p>}
      </section>
    </div>
  );
}

export function Help() {
  const { t } = useI18n();
  useDocumentTitle(t('help.title'));
  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="flex items-center gap-2 text-2xl font-bold"><Icon name="help" className="h-7 w-7 text-brand-700" />{t('help.title')}</h1>
      <p className="mb-6 mt-1 text-slate-600">{t('help.subtitle')}</p>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <details key={n} className="card group p-4 open:shadow-md">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-slate-900">
              {t(`help.q${n}`)}<Icon name="chevronDown" className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
            </summary>
            <p className="mt-3 leading-relaxed text-slate-600">{t(`help.a${n}`)}</p>
          </details>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl bg-brand-50 p-5">
        <span className="font-semibold text-brand-900">{t('help.more')}</span>
        <Link to="/about#contact" className="btn-primary rounded-full">{t('nav.contact')}</Link>
        <Link to="/safety" className="btn-outline rounded-full"><Icon name="shield" className="h-4 w-4" />{t('help.safetyLink')}</Link>
      </div>
    </div>
  );
}
