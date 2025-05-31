// frontend/src/pages/DashboardPage.js
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert, Card } from 'react-bootstrap'; // ProgressBar removed for now, can be added back if desired
import DashboardStatCard from '../components/dashbord/DashbordStatCard'; // Assuming the new one is DashboardStatCard
import { formatDurationFromSeconds } from '../utils/helpers';
import dashboardService from '../services/dashboardService';

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
    projectFailureRate: 0,
    ongoingProjects: 0,
    completedProjects: 0,
  });

  // Dummy trend data for demonstration - replace with actual trend logic if needed
  const [printerTrend, setPrinterTrend] = useState({ text: '+2 this month', direction: 'up' });
  const [successTrend, setSuccessTrend] = useState({ text: '-1.5% vs last week', direction: 'down' });


  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await dashboardService.getSummary();
        setStats({
            totalPrinters: data.totalPrinters || 0,
            availablePrinters: data.availablePrinters || 0,
            maintenancePrinters: data.maintenancePrinters || 0,
            inProductionPrinters: data.inProductionPrinters || 0,
            totalFilamentUsedGrams: data.totalFilamentUsedGrams || 0,
            totalPrintTimeSeconds: data.totalPrintTimeSeconds || 0,
            totalCompletedParts: data.totalCompletedParts || 0,
            projectSuccessRate: data.projectSuccessRate || 0,
            projectFailureRate: data.projectFailureRate || 0,
            ongoingProjects: data.ongoingProjects || 0,
            completedProjects: data.completedProjects || 0,
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <Container className="text-center mt-5 vh-100 d-flex justify-content-center align-items-center"><Spinner animation="border" variant="primary" style={{width: '3.5rem', height: '3.5rem'}} /></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger" className="shadow-lg p-4">{error}</Alert></Container>;

  // --- Define Alert Conditions ---
  const HIGH_MAINTENANCE_THRESHOLD = 2; // Alert if more than 2 printers in maintenance
  const HIGH_FAILURE_RATE_THRESHOLD = 20; // Alert if failure rate is 20% or more

  const showMaintenanceAlert = stats.maintenancePrinters > HIGH_MAINTENANCE_THRESHOLD;
  const showFailureRateAlert = stats.projectFailureRate >= HIGH_FAILURE_RATE_THRESHOLD;

  const alerts = [];
  if (showMaintenanceAlert) {
    alerts.push({
      id: 'maintenance',
      variant: 'warning',
      icon: 'fas fa-tools',
      message: `${stats.maintenancePrinters} printers are currently under maintenance. Consider checking their status.`
    });
  }
  if (showFailureRateAlert) {
    alerts.push({
      id: 'failureRate',
      variant: 'danger',
      icon: 'fas fa-exclamation-triangle',
      message: `Overall project failure rate is high at ${stats.projectFailureRate.toFixed(1)}%. Review recent failed prints.`
    });
  }

  // Example calculation - could be more sophisticated
  const printerAvailability = stats.totalPrinters > 0 ? (stats.availablePrinters / stats.totalPrinters) * 100 : 0;

  return (
    <Container fluid className="p-lg-4 p-md-3 p-2 dashboard-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-6 fw-bold text-dark-emphasis">Dashboard Overview</h1>
        {/* Optional: Add a date range selector or refresh button here */}
      </div>
      
      <Row className="g-4">
        {/* Printer Stats */}
        <Col md={6} xl={3}>
          <DashboardStatCard title="Total Printers" value={stats.totalPrinters} icon="fas fa-print" colorName="primary" trend={printerTrend.text} trendDirection={printerTrend.direction}/>
        </Col>
        <Col md={6} xl={3}>
          <DashboardStatCard title="Available Now" value={stats.availablePrinters} icon="fas fa-power-off" colorName="success" unit={`(${(printerAvailability).toFixed(0)}% of total)`} />
        </Col>
        <Col md={6} xl={3}>
          <DashboardStatCard title="In Production" value={stats.inProductionPrinters} icon="fas fa-industry" colorName="info" />
        </Col>
        <Col md={6} xl={3}>
          <DashboardStatCard title="Maintenance" value={stats.maintenancePrinters} icon="fas fa-tools" colorName="warning" />
        </Col>

        {/* Project Stats */}
        <Col md={6} xl={3}>
          <DashboardStatCard title="Ongoing Projects" value={stats.ongoingProjects} icon="fas fa-tasks-alt" colorName="orange" />
        </Col>
        <Col md={6} xl={3}>
          <DashboardStatCard title="Completed Projects" value={stats.completedProjects} icon="fas fa-clipboard-check" colorName="darkgreen" />
        </Col>
        <Col md={6} xl={3}>
          <DashboardStatCard title="Success Rate" value={stats.projectSuccessRate.toFixed(1)} unit="%" icon="fas fa-chart-pie" colorName="teal" trend={successTrend.text} trendDirection={successTrend.direction}/>
        </Col>
        <Col md={6} xl={3}>
          <DashboardStatCard title="Failure Rate" value={stats.projectFailureRate.toFixed(1)} unit="%" icon="fas fa-exclamation-circle" colorName="danger" />
        </Col>

        {/* Material & Time Stats */}
        <Col md={6} xl={3}> {/* Changed to xl=3 to fit 4 in a row potentially */}
          <DashboardStatCard title="Filament Used" value={(stats.totalFilamentUsedGrams / 1000).toFixed(2)} unit="kg" icon="fas fa-tape" colorName="secondary" />
        </Col>
        <Col md={6} xl={3}>
          <DashboardStatCard title="Total Print Time" value={formatDurationFromSeconds(stats.totalPrintTimeSeconds, 'short')} icon="far fa-hourglass-half" colorName="purple" />
        </Col>
         <Col md={6} xl={3}>
          <DashboardStatCard title="Completed Parts" value={stats.totalCompletedParts} unit="parts" icon="fas fa-shapes" colorName="indigo" />
        </Col>
        <Col md={6} xl={3}>
          <DashboardStatCard title="Avg. Time/Part" value={stats.totalCompletedParts > 0 ? formatDurationFromSeconds(stats.totalPrintTimeSeconds / stats.totalCompletedParts, 'short') : 'N/A'} icon="fas fa-stopwatch-20" colorName="pink" />
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <Card className="shadow-sm">
            <Card.Header as="h5" className="text-dark-emphasis bg-light-subtle d-flex align-items-center">
              <i className="far fa-bell me-2"></i> System Alerts & Notifications
            </Card.Header>
            <Card.Body className="p-4">
              {alerts.length > 0 ? (
                alerts.map(alert => (
                  <Alert variant={alert.variant} key={alert.id} className="d-flex align-items-center mb-3">
                    <i className={`${alert.icon} fa-lg me-3`}></i>
                    <div>{alert.message}</div>
                  </Alert>
                ))
              ) : (
                <div className="text-center text-muted p-3">
                  <i className="fas fa-shield-alt fa-3x mb-3 text-success"></i>
                  <p className="mb-0">No critical alerts at the moment. System operating normally.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx global>{`
        .dashboard-page {
          background-color: #eef2f7; // A softer, more professional background
         
        }
        .text-dark-emphasis {
          color: #343a40 !important; // A darker, more standard text color
        }
        .dashboard-stat-card {
          border: none; // Remove default card border
          border-radius: 0.5rem; // Softer corners
          transition: transform .2s ease-out, box-shadow .2s ease-out;
        }
        .dashboard-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 .4rem 1.2rem rgba(0,0,0,.08)!important;
        }
        .stat-card-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%; // Make it a circle
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-card-icon i {
          font-size: 1.6rem; // Adjust icon size within the circle
          line-height: 1; // Ensure icon is centered vertically
        }
        .fw-medium { font-weight: 500 !important; } // Bootstrap 5.2+
        .fw-bolder { font-weight: bolder !important; }
        .bg-light-subtle { background-color: #f8f9fa !important; }
        // Define more colors if needed, using the { main: '#hex', bg: '#lighthex' } pattern for consistency
      `}</style>
    </Container>
  );
};

export default DashboardPage;