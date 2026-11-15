import { Link } from 'react-router-dom';
import { Icon } from '../components/ui.jsx';
import { useI18n } from '../i18n/index.jsx';
import { useDocumentTitle } from '../lib/hooks.js';

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
