import React from 'react';
//import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import NavbarComponent from './components/common/Navbar'; // Create this
import Footer from './components/common/Footer';       // Create this
import PrivateRoute from './components/common/PrivateRoute';
import { Route, Routes } from 'react-router-dom'; 
import LoginPage from './pages/LoginPage';
import ProfileSelectionPage from './pages/ProfileSelectionPage';
import DashboardPage from './pages/DashboardPage';
import PrintersPage from './pages/PrintersPage';
import AllProjectsPage from './pages/AllProjectsPage';
import TrackingSheetPage from './pages/TrackingSheetPage'; // Will need projectId
import UserProfilePage from './pages/UserProfilePage';
import AdminManageUsersPage from './pages/AdminManageUsersPage';
import AdminCostPage from './pages/AdminCostPage';
import NotFoundPage from './pages/NotFoundPage';
import InitialAdminSetupPage from './pages/InitialAdminSetupPage'; // For admin first login

function App() {
  return (
    // NO <Router> here
    <>
    <div className="d-flex flex-column min-vh-100">
      <NavbarComponent />
      <main className="py-3">
        <Container fluid>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/initial-admin-setup" element={<InitialAdminSetupPage />} />

            <Route path="/" element={<PrivateRoute />}>
              <Route index element={<ProfileSelectionPage />} />
              <Route path="profile-select" element={<ProfileSelectionPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="printers" element={<PrintersPage />} />
              <Route path="projects" element={<AllProjectsPage />} />
              <Route path="tracking/project/:projectId" element={<TrackingSheetPage />} />
              <Route path="my-profile" element={<UserProfilePage />} />
              
              <Route path="admin/users" element={<AdminManageUsersPage />} />
              <Route path="admin/costs" element={<AdminCostPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Container>
      </main>
      <Footer />
      </div>
    </>
    
  );
}
export default App;