// frontend/src/pages/TrackingSheetPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Spinner, Alert, Breadcrumb } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import projectService from '../services/projectService';
import trackingService from '../services/trackingService';
import TrackingSheetFDM from '../components/tracking/TrackingSheetFDM'; // To be created
import { useApp } from '../contexts/AppContext';
import { PRINT_PROFILES } from '../utils/constants';

const TrackingSheetPage = () => {
  const { projectId } = useParams();
  const { selectedProfile } = useApp();

  const [project, setProject] = useState(null);
  const [printJobs, setPrintJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProjectData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError('');
    try {
      const projectDetails = await projectService.getProjectById(projectId);
      setProject(projectDetails);
      const jobs = await trackingService.getPrintJobsForProject(projectId);
      setPrintJobs(jobs);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  // Callback to refresh jobs, e.g., after adding/editing a job
  const refreshPrintJobs = async () => {
    try {
      const jobs = await trackingService.getPrintJobsForProject(projectId);
      setPrintJobs(jobs);
    } catch (err) {
      console.error("Failed to refresh print jobs:", err);
      // Optionally set an error message for the user
    }
  };


  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!project) return <Container className="mt-5"><Alert variant="warning">Project not found.</Alert></Container>;

  return (
    <Container fluid className="mt-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/projects" }}>All Projects</Breadcrumb.Item>
        <Breadcrumb.Item active>{project.projectName} - Tracking</Breadcrumb.Item>
      </Breadcrumb>
      <h1 className="mb-3">{project.projectName} - Tracking Sheet</h1>
      <p>Order ID: {project.orderId || 'N/A'} | Status: <span className={`fw-bold text-${project.status === 'completed' ? 'success' : 'primary'}`}>{project.status}</span></p>

      {selectedProfile === PRINT_PROFILES.FDM && (
        <TrackingSheetFDM
          projectId={projectId}
          projectStatus={project.status}
          initialPrintJobs={printJobs}
          onJobsUpdate={refreshPrintJobs} // Pass callback to update job list
        />
      )}
      {selectedProfile === PRINT_PROFILES.RESIN && (
        <Alert variant="info">Resin Tracking Sheet - Coming Soon!</Alert>
      )}
      {selectedProfile === PRINT_PROFILES.LASER && (
        <Alert variant="info">Laser Tracking Sheet - Coming Soon!</Alert>
      )}
      {!selectedProfile && (
          <Alert variant="warning">No printing profile selected. Please select a profile.</Alert>
      )}
    </Container>
  );
};

export default TrackingSheetPage;