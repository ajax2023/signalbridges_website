import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from './pages/Home';
import ProductPage from './pages/Product';
import ReliabilityPage from './pages/Reliability';
import SecurityPage from './pages/Security';
import DownloadsPage from './pages/Downloads';
import ContactPage from './pages/Contact';
import HelpRedirect from './pages/HelpRedirect';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/reliability" element={<ReliabilityPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/downloads" element={<DownloadsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/help" element={<HelpRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
