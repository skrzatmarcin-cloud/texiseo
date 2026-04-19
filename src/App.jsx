import { Toaster } from "@/components/ui/toaster"
import LoginGate from './components/LoginGate';
import { QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect, lazy, Suspense } from 'react';
import { base44 } from '@/api/base44Client';
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/lib/LanguageContext';
import { HubProvider } from '@/lib/HubContext';
import PublicSupportChat from './components/PublicSupportChat';
import Layout from './components/Layout';
import CookieBanner from './components/CookieBanner';

// Lazy-loaded pages for better performance
const WelcomeScreen = lazy(() => import('./pages/WelcomeScreen'));
const ContentIdeas = lazy(() => import('./pages/ContentIdeas'));
const Clusters = lazy(() => import('./pages/Clusters'));
const ClusterDetail = lazy(() => import('./pages/ClusterDetail'));
const PagesModule = lazy(() => import('./pages/PagesModule'));
const PageDetail = lazy(() => import('./pages/PageDetail'));
const BriefBuilder = lazy(() => import('./pages/BriefBuilder'));
const BriefDetail = lazy(() => import('./pages/BriefDetail'));
const InternalLinks = lazy(() => import('./pages/InternalLinks'));
const FAQSchema = lazy(() => import('./pages/FAQSchema'));
const RefreshCenter = lazy(() => import('./pages/RefreshCenter'));
const SEOQAChecker = lazy(() => import('./pages/SEOQAChecker'));
const PublishingQueue = lazy(() => import('./pages/PublishingQueue'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const Automations = lazy(() => import('./pages/Automations'));
const WordPress = lazy(() => import('./pages/WordPress'));
const Integrations = lazy(() => import('./pages/Integrations'));
const BacklinkSystem = lazy(() => import('./pages/BacklinkSystem'));
const ContentEngine = lazy(() => import('./pages/ContentEngine'));
const SocialMedia = lazy(() => import('./pages/SocialMedia'));
const Analytics = lazy(() => import('./pages/Analytics'));
const ExecutionCenter = lazy(() => import('./pages/ExecutionCenter'));
const CompetitorIntel = lazy(() => import('./pages/CompetitorIntel'));
const SEOAutopilot = lazy(() => import('./pages/SEOAutopilot'));
const SecurityMonitor = lazy(() => import('./pages/SecurityMonitor'));
const BusinessDirectory = lazy(() => import('./pages/BusinessDirectory'));
const DemoLogin = lazy(() => import('./pages/DemoLogin'));
const TeacherHub = lazy(() => import('./pages/TeacherHub'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const AdminTeacherManagement = lazy(() => import('./pages/AdminTeacherManagement'));
const ClientSEODashboard = lazy(() => import('./pages/ClientSEODashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const BusinessHub = lazy(() => import('./pages/BusinessHub'));
const SelfPromotionHub = lazy(() => import('./pages/SelfPromotionHub'));
const TexiSEOAdmin = lazy(() => import('./pages/TexiSEOAdmin'));
const AppReportGenerator = lazy(() => import('./pages/AppReportGenerator'));
const LinguaToonAdmin = lazy(() => import('./pages/LinguaToonAdmin'));
const EnterpriseWorkspaceDetail = lazy(() => import('./pages/EnterpriseWorkspaceDetail'));
const TeacherMarketplace = lazy(() => import('./pages/TeacherMarketplace'));
const PayoutsDashboard = lazy(() => import('./pages/PayoutsDashboard'));
const WebsiteHub = lazy(() => import('./pages/WebsiteHub'));
const SystemIntelligenceDashboard = lazy(() => import('./pages/SystemIntelligenceDashboard'));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const isDemoMode = sessionStorage.getItem("lg_demo_mode") === "1";
  const demoType = sessionStorage.getItem("lg_demo_type");
  const isAdmin = sessionStorage.getItem("lg_is_admin") === "1";

  useEffect(() => {
    base44.auth.me().then(user => {
      setUserRole(user?.role || 'user');
    }).catch(() => setUserRole('user'));
  }, []);

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Admin gets full access to all routes
  if (isAdmin) {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Suspense fallback={<PageLoader />}><WelcomeScreen /></Suspense>} />
          <Route path="/content-ideas" element={<Suspense fallback={<PageLoader />}><ContentIdeas /></Suspense>} />
          <Route path="/clusters" element={<Suspense fallback={<PageLoader />}><Clusters /></Suspense>} />
          <Route path="/clusters/:id" element={<Suspense fallback={<PageLoader />}><ClusterDetail /></Suspense>} />
          <Route path="/pages" element={<Suspense fallback={<PageLoader />}><PagesModule /></Suspense>} />
          <Route path="/pages/:id" element={<Suspense fallback={<PageLoader />}><PageDetail /></Suspense>} />
          <Route path="/brief-builder" element={<Suspense fallback={<PageLoader />}><BriefBuilder /></Suspense>} />
          <Route path="/brief-builder/:id" element={<Suspense fallback={<PageLoader />}><BriefDetail /></Suspense>} />
          <Route path="/internal-links" element={<Suspense fallback={<PageLoader />}><InternalLinks /></Suspense>} />
          <Route path="/faq-schema" element={<Suspense fallback={<PageLoader />}><FAQSchema /></Suspense>} />
          <Route path="/refresh-center" element={<Suspense fallback={<PageLoader />}><RefreshCenter /></Suspense>} />
          <Route path="/seo-qa" element={<Suspense fallback={<PageLoader />}><SEOQAChecker /></Suspense>} />
          <Route path="/publishing-queue" element={<Suspense fallback={<PageLoader />}><PublishingQueue /></Suspense>} />
          <Route path="/wordpress" element={<Suspense fallback={<PageLoader />}><WordPress /></Suspense>} />
          <Route path="/automations" element={<Suspense fallback={<PageLoader />}><Automations /></Suspense>} />
          <Route path="/integrations" element={<Suspense fallback={<PageLoader />}><Integrations /></Suspense>} />
          <Route path="/backlinks" element={<Suspense fallback={<PageLoader />}><BacklinkSystem /></Suspense>} />
          <Route path="/content-engine" element={<Suspense fallback={<PageLoader />}><ContentEngine /></Suspense>} />
          <Route path="/social-media" element={<Suspense fallback={<PageLoader />}><SocialMedia /></Suspense>} />
          <Route path="/analytics" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
          <Route path="/execution-center" element={<Suspense fallback={<PageLoader />}><ExecutionCenter /></Suspense>} />
          <Route path="/competitors" element={<Suspense fallback={<PageLoader />}><CompetitorIntel /></Suspense>} />
          <Route path="/seo-autopilot" element={<Suspense fallback={<PageLoader />}><SEOAutopilot /></Suspense>} />
          <Route path="/security" element={<Suspense fallback={<PageLoader />}><SecurityMonitor /></Suspense>} />
          <Route path="/directory" element={<Suspense fallback={<PageLoader />}><BusinessDirectory /></Suspense>} />
          <Route path="/teachers" element={<Suspense fallback={<PageLoader />}><TeacherHub /></Suspense>} />
          <Route path="/teacher-dashboard" element={<Suspense fallback={<PageLoader />}><TeacherDashboard /></Suspense>} />
          <Route path="/admin-teachers" element={<Suspense fallback={<PageLoader />}><AdminTeacherManagement /></Suspense>} />
          <Route path="/client-seo/:websiteId" element={<Suspense fallback={<PageLoader />}><ClientSEODashboard /></Suspense>} />
          <Route path="/business" element={<Suspense fallback={<PageLoader />}><BusinessHub /></Suspense>} />
          <Route path="/self-promotion" element={<Suspense fallback={<PageLoader />}><SelfPromotionHub /></Suspense>} />
          <Route path="/texiseo-admin" element={<Suspense fallback={<PageLoader />}><TexiSEOAdmin /></Suspense>} />
          <Route path="/app-report" element={<Suspense fallback={<PageLoader />}><AppReportGenerator /></Suspense>} />
          <Route path="/linguatoons-admin" element={<Suspense fallback={<PageLoader />}><LinguaToonAdmin /></Suspense>} />
          <Route path="/enterprise/:workspaceId" element={<Suspense fallback={<PageLoader />}><EnterpriseWorkspaceDetail /></Suspense>} />
          <Route path="/marketplace" element={<Suspense fallback={<PageLoader />}><TeacherMarketplace /></Suspense>} />
          <Route path="/payouts" element={<Suspense fallback={<PageLoader />}><PayoutsDashboard /></Suspense>} />
          <Route path="/website" element={<Suspense fallback={<PageLoader />}><WebsiteHub /></Suspense>} />
          <Route path="/system-intelligence" element={<Suspense fallback={<PageLoader />}><SystemIntelligenceDashboard /></Suspense>} />
          <Route path="/settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    );
  }

  // If demo mode, route to appropriate demo hub
  if (isDemoMode) {
    if (demoType === "teacher") {
      return <Routes><Route element={<Layout />}><Route path="/*" element={<Suspense fallback={<PageLoader />}><TeacherHub /></Suspense>} /></Route></Routes>;
    } else if (demoType === "student") {
      return <Routes><Route element={<Layout />}><Route path="/*" element={<Suspense fallback={<PageLoader />}><StudentDashboard /></Suspense>} /></Route></Routes>;
    } else if (demoType === "enterprise") {
      return <Routes><Route element={<Layout />}><Route path="/*" element={<Suspense fallback={<PageLoader />}><BusinessHub /></Suspense>} /></Route></Routes>;
    }
  }

  // If user is enterprise, redirect to business hub
  if (userRole === "enterprise") {
    return <Routes><Route element={<Layout />}><Route path="/*" element={<Suspense fallback={<PageLoader />}><BusinessHub /></Suspense>} /></Route></Routes>;
  }

  // If user is teacher, redirect to teacher hub
  if (userRole === "teacher") {
    return <Routes><Route element={<Layout />}><Route path="/*" element={<Suspense fallback={<PageLoader />}><TeacherHub /></Suspense>} /></Route></Routes>;
  }

  // If user is student, redirect to student dashboard
  if (userRole === "student") {
    return <Routes><Route element={<Layout />}><Route path="/*" element={<Suspense fallback={<PageLoader />}><StudentDashboard /></Suspense>} /></Route></Routes>;
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Suspense fallback={<PageLoader />}><WelcomeScreen /></Suspense>} />
        <Route path="/content-ideas" element={<Suspense fallback={<PageLoader />}><ContentIdeas /></Suspense>} />
        <Route path="/clusters" element={<Suspense fallback={<PageLoader />}><Clusters /></Suspense>} />
        <Route path="/clusters/:id" element={<Suspense fallback={<PageLoader />}><ClusterDetail /></Suspense>} />
        <Route path="/pages" element={<Suspense fallback={<PageLoader />}><PagesModule /></Suspense>} />
        <Route path="/pages/:id" element={<Suspense fallback={<PageLoader />}><PageDetail /></Suspense>} />
        <Route path="/brief-builder" element={<Suspense fallback={<PageLoader />}><BriefBuilder /></Suspense>} />
        <Route path="/brief-builder/:id" element={<Suspense fallback={<PageLoader />}><BriefDetail /></Suspense>} />
        <Route path="/internal-links" element={<Suspense fallback={<PageLoader />}><InternalLinks /></Suspense>} />
        <Route path="/faq-schema" element={<Suspense fallback={<PageLoader />}><FAQSchema /></Suspense>} />
        <Route path="/refresh-center" element={<Suspense fallback={<PageLoader />}><RefreshCenter /></Suspense>} />
        <Route path="/seo-qa" element={<Suspense fallback={<PageLoader />}><SEOQAChecker /></Suspense>} />
        <Route path="/publishing-queue" element={<Suspense fallback={<PageLoader />}><PublishingQueue /></Suspense>} />
        <Route path="/wordpress" element={<Suspense fallback={<PageLoader />}><WordPress /></Suspense>} />
        <Route path="/automations" element={<Suspense fallback={<PageLoader />}><Automations /></Suspense>} />
        <Route path="/integrations" element={<Suspense fallback={<PageLoader />}><Integrations /></Suspense>} />
        <Route path="/backlinks" element={<Suspense fallback={<PageLoader />}><BacklinkSystem /></Suspense>} />
        <Route path="/content-engine" element={<Suspense fallback={<PageLoader />}><ContentEngine /></Suspense>} />
        <Route path="/social-media" element={<Suspense fallback={<PageLoader />}><SocialMedia /></Suspense>} />
        <Route path="/analytics" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
        <Route path="/execution-center" element={<Suspense fallback={<PageLoader />}><ExecutionCenter /></Suspense>} />
        <Route path="/competitors" element={<Suspense fallback={<PageLoader />}><CompetitorIntel /></Suspense>} />
        <Route path="/seo-autopilot" element={<Suspense fallback={<PageLoader />}><SEOAutopilot /></Suspense>} />
        <Route path="/security" element={<Suspense fallback={<PageLoader />}><SecurityMonitor /></Suspense>} />
        <Route path="/directory" element={<Suspense fallback={<PageLoader />}><BusinessDirectory /></Suspense>} />
        <Route path="/teachers" element={<Suspense fallback={<PageLoader />}><TeacherHub /></Suspense>} />
        <Route path="/teacher-dashboard" element={<Suspense fallback={<PageLoader />}><TeacherDashboard /></Suspense>} />
        <Route path="/admin-teachers" element={<Suspense fallback={<PageLoader />}><AdminTeacherManagement /></Suspense>} />
        <Route path="/client-seo/:websiteId" element={<Suspense fallback={<PageLoader />}><ClientSEODashboard /></Suspense>} />
        <Route path="/business" element={<Suspense fallback={<PageLoader />}><BusinessHub /></Suspense>} />
        <Route path="/self-promotion" element={<Suspense fallback={<PageLoader />}><SelfPromotionHub /></Suspense>} />
        <Route path="/marketplace" element={<Suspense fallback={<PageLoader />}><TeacherMarketplace /></Suspense>} />
        <Route path="/website" element={<Suspense fallback={<PageLoader />}><WebsiteHub /></Suspense>} />
        <Route path="/system-intelligence" element={<Suspense fallback={<PageLoader />}><SystemIntelligenceDashboard /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <HubProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <Routes>
                <Route path="/demo" element={<Suspense fallback={<PageLoader />}><DemoLogin /></Suspense>} />
                <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><PrivacyPolicy /></Suspense>} />
                <Route path="/*" element={
                  <LoginGate>
                    <AuthenticatedApp />
                  </LoginGate>
                } />
              </Routes>
            </Router>
            <Toaster />
            <PublicSupportChat />
            <CookieBanner />
            </QueryClientProvider>
        </HubProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App