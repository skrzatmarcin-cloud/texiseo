import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ContentIdeas from './pages/ContentIdeas';
import Clusters from './pages/Clusters';
import ClusterDetail from './pages/ClusterDetail';
import PagesModule from './pages/PagesModule';
import PageDetail from './pages/PageDetail';
import BriefBuilder from './pages/BriefBuilder';
import BriefDetail from './pages/BriefDetail';
import InternalLinks from './pages/InternalLinks';
import PublishingQueue from './pages/PublishingQueue';
import SettingsPage from './pages/SettingsPage';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

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

  // Render the main app
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/content-ideas" element={<ContentIdeas />} />
        <Route path="/clusters" element={<Clusters />} />
        <Route path="/clusters/:id" element={<ClusterDetail />} />
        <Route path="/pages" element={<PagesModule />} />
        <Route path="/pages/:id" element={<PageDetail />} />
        <Route path="/brief-builder" element={<BriefBuilder />} />
        <Route path="/brief-builder/:id" element={<BriefDetail />} />
        <Route path="/internal-links" element={<InternalLinks />} />
        <Route path="/publishing-queue" element={<PublishingQueue />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App