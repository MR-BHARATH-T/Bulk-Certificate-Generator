import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import JobDetails from './pages/JobDetails';
import JobsList from './pages/JobsList';
import CertificateLookup from './pages/CertificateLookup';
import Layout from './components/Layout';
import { ModalProvider } from './context/ModalContext';

function App() {
  return (
    <ModalProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<JobsList />} />
            <Route path="/jobs/:jobId" element={<JobDetails />} />
            <Route path="/certificates" element={<CertificateLookup />} />
          </Routes>
        </Layout>
      </Router>
    </ModalProvider>
  );
}

export default App;
