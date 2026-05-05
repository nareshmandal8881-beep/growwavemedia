import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import './portal.css'
import App from './App.jsx'
import AboutPage from './AboutPage.jsx'
import ServiceDetailPage from './ServiceDetailPage.jsx'
import PrivacyPolicyPage from './PrivacyPolicyPage.jsx'
import TermsPage from './TermsPage.jsx'
import CompliancePage from './CompliancePage.jsx'
import LoginPage from './LoginPage.jsx'
import DashboardPage from './DashboardPage.jsx'
import CreatorLoginPage from './portal/CreatorLoginPage.jsx'
import CreatorSignupPage from './portal/CreatorSignupPage.jsx'
import CreatorDashboard from './portal/CreatorDashboard.jsx'
import DealSubmitPage from './portal/DealSubmitPage.jsx'
import InvoiceView from './portal/InvoiceView.jsx'
import CreatorAuthGuard from './portal/CreatorAuthGuard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/wavelogin" element={<LoginPage />} />
          <Route path="/wave-dashboard" element={<DashboardPage />} />
          {/* Creator Portal */}
          <Route path="/portal/login" element={<CreatorLoginPage />} />
          <Route path="/portal/signup" element={<CreatorSignupPage />} />
          <Route path="/portal/dashboard" element={<CreatorAuthGuard><CreatorDashboard /></CreatorAuthGuard>} />
          <Route path="/portal/deal/:id" element={<CreatorAuthGuard><DealSubmitPage /></CreatorAuthGuard>} />
          <Route path="/portal/invoice/:id" element={<InvoiceView />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
