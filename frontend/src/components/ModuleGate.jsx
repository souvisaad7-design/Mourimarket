// Shown instead of a page whose feature the admin switched off.
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/index.jsx';
import { useModule } from '../lib/modules.js';
import { EmptyState } from './ui.jsx';

export default function ModuleGate({ k, children }) {
  const { t } = useI18n();
  if (useModule(k)) return children;
  return (
    <div className="container-page py-10">
      <EmptyState icon="info" title={t('control.featureOff')}><Link to="/" className="btn-primary">{t('nav.home')}</Link></EmptyState>
    </div>
  );
}
