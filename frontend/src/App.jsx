import { lazy, Suspense } from 'react';
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
import CustomPage from './pages/CustomPage.jsx';
import Notifications from './pages/Notifications.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import ProductForm from './pages/ProductForm.jsx';
import Products from './pages/Products.jsx';
import Profile from './pages/Profile.jsx';
import SellerProfile from './pages/SellerProfile.jsx';
import { StoreDetail, Stores } from './pages/Stores.jsx';

// The admin area is loaded on demand, so visitors never download it.
const lazyNamed = (load, name) => lazy(() => load().then((m) => ({ default: m[name] })));
const adminLayout = () => import('./pages/admin/AdminLayout.jsx');
const adminPages = () => import('./pages/admin/AdminPages.jsx');
const adminSite = () => import('./pages/admin/AdminSite.jsx');
const adminContent = () => import('./pages/admin/AdminContent.jsx');
const [AdminBanner, AdminMenus, AdminCustomPages, AdminNewListing, AdminCities] =
  ['AdminBanner', 'AdminMenus', 'AdminCustomPages', 'AdminNewListing', 'AdminCities'].map((n) => lazyNamed(adminContent, n));
const AdminLayout = lazy(adminLayout);
const AdminLogin = lazyNamed(adminLayout, 'AdminLogin');
const AdminOverview = lazyNamed(adminLayout, 'AdminOverview');
const [AdminCategories, AdminListings, AdminMerchants, AdminReports, AdminStores, AdminUpgrades, AdminUsers] =
  ['AdminCategories', 'AdminListings', 'AdminMerchants', 'AdminReports', 'AdminStores', 'AdminUpgrades', 'AdminUsers'].map((n) => lazyNamed(adminPages, n));
const [AdminAccount, AdminFiles, AdminReviews, AdminSettings, AdminSitemap, AdminTexts, AdminAppearance, AdminAlerts, AdminPayments] =
  ['AdminAccount', 'AdminFiles', 'AdminReviews', 'AdminSettings', 'AdminSitemap', 'AdminTexts', 'AdminAppearance', 'AdminAlerts', 'AdminPayments'].map((n) => lazyNamed(adminSite, n));
import StoreSettings from './pages/StoreSettings.jsx';
import { Checkout, Courier, OrderDetail, Orders, RedirectToCourier } from './pages/Delivery.jsx';
import SavedSearches from './pages/SavedSearches.jsx';
import VerifyPhone from './pages/VerifyPhone.jsx';
import Wanted from './pages/Wanted.jsx';
import SoukAI from './pages/SoukAI.jsx';
import Eid, { Livestock } from './pages/Eid.jsx';
import Auctions from './pages/Auctions.jsx';
import Wallet from './pages/Wallet.jsx';
import Invoice from './pages/Invoice.jsx';
import StaffHome from './pages/Staff.jsx';
const ProTools = lazy(() => import('./pages/Pro.jsx'));
import Social, { PostPage } from './pages/Social.jsx';
import LiveList, { LiveForm, LiveRoom } from './pages/Live.jsx';
const AdminCommunity = lazy(() => import('./pages/admin/AdminCommunity.jsx'));
const AdminPlaces = lazy(() => import('./pages/admin/AdminPlaces.jsx'));
const AdminAI = lazy(() => import('./pages/admin/AdminAI.jsx'));
import SellerStats from './pages/SellerStats.jsx';
const BulkImport = lazy(() => import('./pages/BulkImport.jsx'));
const adminDelivery = () => import('./pages/admin/AdminDelivery.jsx');
const [AdminOrders, AdminCouriers] = ['AdminOrders', 'AdminCouriers'].map((n) => lazyNamed(adminDelivery, n));
const AdminDeliveryPricing = lazyNamed(adminSite, 'AdminDeliveryPricing');
const AdminInspections = lazyNamed(() => import('./pages/admin/AdminInspections.jsx'), 'AdminInspections');
const AdminEscrow = lazyNamed(() => import('./pages/admin/AdminEscrow.jsx'), 'AdminEscrow');
const AdminPay = lazyNamed(() => import('./pages/admin/AdminPay.jsx'), 'AdminPay');

function RequireAuth({ children, admin = false }) {
  const { user, ready } = useApp();
  const location = useLocation();
  if (!ready) return <Spinner />;
  if (!user) return <Navigate to={admin ? '/admin/login' : '/login'} replace state={{ from: location.pathname + location.search }} />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

/** Only seller accounts can post listings; buyers are offered to switch. */
function SellerOnly({ children }) {
  const { user } = useApp();
  const { t } = useI18n();
  // Sellers, and store employees posting for their store.
  if (user.account_type !== 'buyer' || user.staff) return children;
  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="mb-2 text-2xl font-bold">{t('form.newTitle')}</h1>
      <p className="mb-6 text-slate-600">{t('seller.onlySellers')}</p>
      <BecomeSeller />
    </div>
  );
}

function GuestOnly({ children }) {
  const { user, ready, meta } = useApp();
  const location = useLocation();
  if (!ready) return <Spinner />;
  if (user) {
    // A new account whose number is not confirmed yet goes to the code page first.
    const needsPhone = meta.phoneVerification && user.role !== 'admin' && !user.phone_verified_at;
    return <Navigate to={needsPhone ? '/verify-phone' : location.state?.from || (user.role === 'admin' ? '/admin' : '/dashboard')} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="orders/:id/invoice" element={<RequireAuth><Invoice /></RequireAuth>} />
      <Route element={<Layout />}>
        {/* Public */}
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="search" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="users/:id" element={<SellerProfile />} />
        <Route path="stores" element={<Stores />} />
        <Route path="wanted" element={<Wanted />} />
        <Route path="ai" element={<SoukAI />} />
        <Route path="eid" element={<Eid />} />
        <Route path="livestock" element={<Livestock />} />
        <Route path="auctions" element={<Auctions />} />
        <Route path="wallet" element={<RequireAuth><Wallet /></RequireAuth>} />
        <Route path="staff" element={<RequireAuth><StaffHome /></RequireAuth>} />
        <Route path="pro" element={<RequireAuth><SellerOnly><Suspense fallback={<Spinner />}><ProTools /></Suspense></SellerOnly></RequireAuth>} />
        <Route path="social" element={<Social />} />
        <Route path="social/posts/:id" element={<PostPage />} />
        <Route path="live" element={<LiveList />} />
        <Route path="live/new" element={<RequireAuth><LiveForm /></RequireAuth>} />
        <Route path="live/:id" element={<LiveRoom />} />
        <Route path="stores/:slug" element={<StoreDetail />} />
        <Route path="safety" element={<Safety />} />
        <Route path="about" element={<About />} />
        <Route path="help" element={<Help />} />
        <Route path="p/:slug" element={<CustomPage />} />

        {/* Auth */}
        <Route path="login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="register" element={<GuestOnly><Register /></GuestOnly>} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />

        {/* Signed-in users */}
        <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="dashboard/store" element={<RequireAuth><StoreSettings /></RequireAuth>} />
        <Route path="dashboard/stats" element={<RequireAuth><SellerStats /></RequireAuth>} />
        <Route path="dashboard/import" element={<RequireAuth><SellerOnly><Suspense fallback={<Spinner />}><BulkImport /></Suspense></SellerOnly></RequireAuth>} />
        <Route path="sell" element={<RequireAuth><SellerOnly><ProductForm /></SellerOnly></RequireAuth>} />
        <Route path="products/:id/edit" element={<RequireAuth><ProductForm /></RequireAuth>} />
        <Route path="favorites" element={<RequireAuth><Favorites /></RequireAuth>} />
        <Route path="messages" element={<RequireAuth><Messages /></RequireAuth>} />
        <Route path="messages/:id" element={<RequireAuth><Messages /></RequireAuth>} />
        <Route path="notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
        <Route path="checkout/:productId" element={<RequireAuth><Checkout /></RequireAuth>} />
        <Route path="orders" element={<RequireAuth><Orders /></RequireAuth>} />
        <Route path="saved-searches" element={<RequireAuth><SavedSearches /></RequireAuth>} />
        <Route path="verify-phone" element={<RequireAuth><VerifyPhone /></RequireAuth>} />
        <Route path="orders/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />
        <Route path="courier" element={<RequireAuth><Courier /></RequireAuth>} />
        <Route path="delivery/join" element={<RedirectToCourier />} />

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin */}
      <Route path="admin/login" element={<Suspense fallback={<Spinner />}><AdminLogin /></Suspense>} />
      <Route path="admin" element={<RequireAuth admin><Suspense fallback={<Spinner />}><AdminLayout /></Suspense></RequireAuth>}>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="listings" element={<AdminListings />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="requests" element={<AdminUpgrades />} />
        <Route path="merchants" element={<AdminMerchants />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="files" element={<AdminFiles />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="texts" element={<AdminTexts />} />
        <Route path="sitemap" element={<AdminSitemap />} />
        <Route path="banner" element={<AdminBanner />} />
        <Route path="appearance" element={<AdminAppearance />} />
        <Route path="alerts" element={<AdminAlerts />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="cities" element={<AdminCities />} />
        <Route path="menus" element={<AdminMenus />} />
        <Route path="pages" element={<AdminCustomPages />} />
        <Route path="listings/new" element={<AdminNewListing />} />
        <Route path="account" element={<AdminAccount />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="couriers" element={<AdminCouriers />} />
        <Route path="delivery" element={<AdminDeliveryPricing />} />
        <Route path="inspections" element={<AdminInspections />} />
        <Route path="escrow" element={<AdminEscrow />} />
        <Route path="pay" element={<AdminPay />} />
        <Route path="ai" element={<AdminAI />} />
        <Route path="community" element={<AdminCommunity />} />
        <Route path="places" element={<AdminPlaces />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
        <Route path="stores" element={<AdminStores />} />
      </Route>
    </Routes>
  );
}
