import { Toaster } from "@/components/ui/toaster"
import LoginGate from './components/LoginGate';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/lib/LanguageContext';
import { HubProvider } from '@/lib/HubContext';
import PublicSupportChat from './components/PublicSupportChat';
import Layout from './components/Layout';
import WelcomeScreen from './pages/WelcomeScreen';
import ContentIdeas from './pages/ContentIdeas';
import Clusters from './pages/Clusters';
import ClusterDetail from './pages/ClusterDetail';
import PagesModule from './pages/PagesModule';
import PageDetail from './pages/PageDetail';
import BriefBuilder from './pages/BriefBuilder';
import BriefDetail from './pages/BriefDetail';
import InternalLinks from './pages/InternalLinks';
import FAQSchema from './pages/FAQSchema';
import RefreshCenter from './pages/RefreshCenter';
import SEOQAChecker from './pages/SEOQAChecker';
import PublishingQueue from './pages/PublishingQueue';
import SettingsPage from './pages/SettingsPage';
import Automations from './pages/Automations';
import WordPress from './pages/WordPress';
import Integrations from './pages/Integrations';
import BacklinkSystem from './pages/BacklinkSystem';
import ContentEngine from './pages/ContentEngine';
import SocialMedia from './pages/SocialMedia';
import Analytics from './pages/Analytics';
import ExecutionCenter from './pages/ExecutionCenter';
import CompetitorIntel from './pages/CompetitorIntel';
import SEOAutopilot from './pages/SEOAutopilot';
import SecurityMonitor from './pages/SecurityMonitor';
import BusinessDirectory from './pages/BusinessDirectory';
import DemoLogin from './pages/DemoLogin';
import TeacherHub from './pages/TeacherHub';
import BusinessHub from './pages/BusinessHub';
import SelfPromotionHub from './pages/SelfPromotionHub';
import TexiSEOAdmin from './pages/TexiSEOAdmin';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const isDemoMode = sessionStorage.getItem("lg_demo_mode") === "1";
  const demoType = sessionStorage.getItem("lg_demo_type");

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

  // If demo mode, route to appropriate demo hub
  if (isDemoMode) {
    if (demoType === "teacher") {
      return <Routes><Route element={<Layout />}><Route path="/*" element={<TeacherHub />} /></Route></Routes>;
    } else if (demoType === "business") {
      return <Routes><Route element={<Layout />}><Route path="/*" element={<BusinessHub />} /></Route></Routes>;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/content-ideas" element={<ContentIdeas />} />
        <Route path="/clusters" element={<Clusters />} />
        <Route path="/clusters/:id" element={<ClusterDetail />} />
        <Route path="/pages" element={<PagesModule />} />
        <Route path="/pages/:id" element={<PageDetail />} />
        <Route path="/brief-builder" element={<BriefBuilder />} />
        <Route path="/brief-builder/:id" element={<BriefDetail />} />
        <Route path="/internal-links" element={<InternalLinks />} />
        <Route path="/faq-schema" element={<FAQSchema />} />
        <Route path="/refresh-center" element={<RefreshCenter />} />
        <Route path="/seo-qa" element={<SEOQAChecker />} />
        <Route path="/publishing-queue" element={<PublishingQueue />} />
        <Route path="/wordpress" element={<WordPress />} />
        <Route path="/automations" element={<Automations />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/backlinks" element={<BacklinkSystem />} />
        <Route path="/content-engine" element={<ContentEngine />} />
        <Route path="/social-media" element={<SocialMedia />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/execution-center" element={<ExecutionCenter />} />
        <Route path="/competitors" element={<CompetitorIntel />} />
        <Route path="/seo-autopilot" element={<SEOAutopilot />} />
        <Route path="/security" element={<SecurityMonitor />} />
        <Route path="/directory" element={<BusinessDirectory />} />
        <Route path="/teachers" element={<TeacherHub />} />
        <Route path="/business" element={<BusinessHub />} />
        <Route path="/self-promotion" element={<SelfPromotionHub />} />
        <Route path="/texiseo-admin" element={<TexiSEOAdmin />} />
        <Route path="/settings" element={<SettingsPage />} />
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
                <Route path="/demo" element={<DemoLogin />} />
                <Route path="/*" element={
                  <LoginGate>
                    <AuthenticatedApp />
                  </LoginGate>
                } />
              </Routes>
            </Router>
            <Toaster />
            <PublicSupportChat />
          </QueryClientProvider>
        </HubProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App