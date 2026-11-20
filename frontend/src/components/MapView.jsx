import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from './ui.jsx';

const MapLeaflet = lazy(() => import('./MapLeaflet.jsx'));

// Mauritania as a whole, when nothing more precise is known.
export const MAURITANIA = { center: [19.5, -11.5], zoom: 5 };

/** The map, loaded only when a page shows one. Same props as MapLeaflet. */
export default function MapView(props) {
  const navigate = useNavigate();
  return (
    <Suspense fallback={<div className={`flex items-center justify-center rounded-2xl bg-slate-100 ${props.className || 'h-72'}`}><Spinner /></div>}>
      <MapLeaflet onOpen={(href) => navigate(href)} {...props} />
    </Suspense>
  );
}
