import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import BecomeSeller from './components/BecomeSeller.jsx';
import Layout from './components/Layout.jsx';
import { Spinner } from './components/ui.jsx';
import { useApp } from './context/AppContext.jsx';
import { useI18n } from './i18n/index.jsx';
import { ForgotPassword, Login, Register, ResetPassword } from './pages/Auth.jsx';
import Categories from './pages/Categories.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Favorites from './pages/Favorites.jsx';
import Home from './pages/Home.jsx';
import Messages from './pages/Messages.jsx';
import { About, Help, NotFound, Safety } from './pages/Static.jsx';
import Notifications from './pages/Notifications.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import ProductForm from './pages/ProductForm.jsx';
import Products from './pages/Products.jsx';
import Profile from './pages/Profile.jsx';
import SellerProfile from './pages/SellerProfile.jsx';
import { StoreDetail, Stores } from './pages/Stores.jsx';
import StoreSettings from './pages/StoreSettings.jsx';
import AdminLayout, { AdminOverview } from './pages/admin/AdminLayout.jsx';
import { AdminCategories, AdminListings, AdminReports, AdminStores, AdminUsers } from './pages/admin/AdminPages.jsx';

function RequireAuth({ children, admin = false }) {
  const { user, ready } = useApp();
  const location = useLocation();
  if (!ready) return <Spinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

/** Only seller accounts can post listings; buyers are offered to switch. */
function SellerOnly({ children }) {
  const { user } = useApp();
  const { t } = useI18n();
  if (user.account_type !== 'buyer') return children;
  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="mb-2 text-2xl font-bold">{t('form.newTitle')}</h1>
      <p className="mb-6 text-slate-600">{t('seller.onlySellers')}</p>
      <BecomeSeller />
    </div>
  );
}

function GuestOnly({ children }) {
  const { user, ready } = useApp();
  const location = useLocation();
  if (!ready) return <Spinner />;
  if (user) return <Navigate to={location.state?.from || (user.role === 'admin' ? '/admin' : '/dashboard')} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="search" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="users/:id" element={<SellerProfile />} />
        <Route path="stores" element={<Stores />} />
        <Route path="stores/:slug" element={<StoreDetail />} />
        <Route path="safety" element={<Safety />} />
        <Route path="about" element={<About />} />
        <Route path="help" element={<Help />} />

        {/* Auth */}
        <Route path="login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="register" element={<GuestOnly><Register /></GuestOnly>} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />

        {/* Signed-in users */}
        <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="dashboard/store" element={<RequireAuth><StoreSettings /></RequireAuth>} />
        <Route path="sell" element={<RequireAuth><SellerOnly><ProductForm /></SellerOnly></RequireAuth>} />
        <Route path="products/:id/edit" element={<RequireAuth><ProductForm /></RequireAuth>} />
        <Route path="favorites" element={<RequireAuth><Favorites /></RequireAuth>} />
        <Route path="messages" element={<RequireAuth><Messages /></RequireAuth>} />
        <Route path="messages/:id" element={<RequireAuth><Messages /></RequireAuth>} />
        <Route path="notifications" element={<RequireAuth><Notifications /></RequireAuth>} />

        {/* Admin */}
        <Route path="admin" element={<RequireAuth admin><AdminLayout /></RequireAuth>}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="listings" element={<AdminListings />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="stores" element={<AdminStores />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
