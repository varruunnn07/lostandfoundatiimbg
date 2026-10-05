import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import BackgroundShapes from './components/BackgroundShapes';
import HomePage from './pages/HomePage';
import ReportItemPage from './pages/ReportItemPage';
import BrowseItemsPage from './pages/BrowseItemsPage';
import AboutPage from './pages/AboutPage';
import AuthPage from './pages/AuthPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <BackgroundShapes />
        <div className="max-w-[1400px] mx-auto py-8 px-8 lg:px-16 app-container">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/report" 
              element={
                <ProtectedRoute>
                  <ReportItemPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/browse" element={<BrowseItemsPage />} />
            <Route path="/item/:id" element={<ItemDetailsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
