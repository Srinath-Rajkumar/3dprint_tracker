// frontend/src/pages/DashboardPage.js
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import StatCard from '../components/dashbord/StatCard';
import dashboardService from '../services/dashboardService'; // Import the new service
// import DashboardSummary from '../components/dashboard/DashboardSummary';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalPrinters: 0,
    availablePrinters: 0,
    maintenancePrinters: 0,
    inProductionPrinters: 0,
    totalFilamentUsedGrams: 0,
    totalPrintTimeSeconds: 0,
    totalCompletedParts: 0,
    projectSuccessRate: 0,
    ongoingProjects: 0,
    completedProjects: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await dashboardService.getSummary(); // Fetch real data
        setStats({ // Map fetched data to your state structure
            totalPrinters: data.totalPrinters,
            availablePrinters: data.availablePrinters,
            maintenancePrinters: data.maintenancePrinters,
            inProductionPrinters: data.inProductionPrinters,
            totalFilamentUsedGrams: data.totalFilamentUsedGrams,
            totalPrintTimeSeconds: data.totalPrintTimeSeconds,
            totalCompletedParts: data.totalCompletedParts,
            projectSuccessRate: data.projectSuccessRate,
            ongoingProjects: data.ongoingProjects,
            completedProjects: data.completedProjects,
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container fluid className="mt-4">
      <h1 className="mb-4">Dashboard</h1>
      <Row>
        <Col md={6} lg={3} className="mb-3">
          <StatCard title="Total Printers" value={stats.totalPrinters} icon="fas fa-print" color="primary" />
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <StatCard title="Available Printers" value={stats.availablePrinters} icon="fas fa-check-circle" color="success" />
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <StatCard title="In Production" value={stats.inProductionPrinters} icon="fas fa-cogs" color="info" />
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <StatCard title="In Maintenance" value={stats.maintenancePrinters} icon="fas fa-tools" color="warning" />
        </Col>
      </Row>
      <Row>
         <Col md={6} lg={3} className="mb-3">
          <StatCard title="Filament Used (Completed)" value={`${(stats.totalFilamentUsedGrams / 1000).toFixed(2)} kg`} icon="fas fa-tape" color="secondary" />
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <StatCard title="Print Time (Completed)" value={stats.totalPrintTimeSeconds > 0 ? `${(stats.totalPrintTimeSeconds / 3600).toFixed(1)} hrs` : '0 hrs'} icon="fas fa-clock" color="purple" />
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <StatCard title="Completed Parts" value={stats.totalCompletedParts} icon="fas fa-cubes" color="danger" />
        </Col>
         <Col md={6} lg={3} className="mb-3">
          <StatCard title="Overall Success Rate" value={`${stats.projectSuccessRate.toFixed(1)}%`} icon="fas fa-thumbs-up" color="teal" />
        </Col>
      </Row>
       <Row>
        <Col md={6} lg={3} className="mb-3">
          <StatCard title="Ongoing Projects" value={stats.ongoingProjects} icon="fas fa-project-diagram" color="orange" /> {/* Add custom color if needed */}
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <StatCard title="Completed Projects" value={stats.completedProjects} icon="fas fa-check-double" color="darkgreen" /> {/* Add custom color if needed */}
        </Col>
      </Row>
      {/* <Row>
        <Col>
          <DashboardSummary /> Further charts and summaries
        </Col>
      </Row> */}
        <style jsx global>{`
            .border-left-orange { border-left: .25rem solid orange !important; }
            .border-left-darkgreen { border-left: .25rem solid darkgreen !important; }
        `}</style>
    </Container>
  );
};

export default DashboardPage;