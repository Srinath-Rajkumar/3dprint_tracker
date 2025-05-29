// frontend/src/pages/AllProjectsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Spinner, Alert, Form } from 'react-bootstrap';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectFormModal from '../components/projects/ProjectFormModal'; // For adding/editing projects
import projectService from '../services/projectService';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AllProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null); // For editing
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '', 'ongoing', 'completed'

  const { userInfo } = useAuth();
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await projectService.getAllProjects();
      setProjects(data);
      setFilteredProjects(data); // Initially show all
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    let tempProjects = [...projects];
    if (searchTerm) {
      tempProjects = tempProjects.filter(p =>
        p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.orderId && p.orderId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (statusFilter) {
      tempProjects = tempProjects.filter(p => p.status === statusFilter);
    }
    setFilteredProjects(tempProjects);
  }, [searchTerm, statusFilter, projects]);


  const handleOpenFormModal = (project = null) => {
    setSelectedProject(project);
    setShowFormModal(true);
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setSelectedProject(null);
  };

  const handleFormSuccess = () => {
    fetchProjects(); // Refresh the list
    handleCloseFormModal();
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project and all its associated print jobs? This action cannot be undone.')) {
      try {
        await projectService.deleteProject(projectId);
        fetchProjects(); // Refresh list
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to delete project');
      }
    }
  };

  const handleViewTrackingSheet = (projectId) => {
    navigate(`/tracking/project/${projectId}`);
  };


  if (loading && projects.length === 0) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

  return (
    <Container fluid className="mt-4">
      <Row className="align-items-center mb-3">
        <Col md={6}>
          <h1>All Projects</h1>
        </Col>
        <Col md={6} className="text-md-end">
          <Button variant="primary" onClick={() => handleOpenFormModal()}>
            <i className="fas fa-plus"></i> Add New Project
          </Button>
        </Col>
      </Row>

      <Row className="mb-3 p-3 bg-light rounded">
        <Col md={6} className="mb-2 mb-md-0">
            <Form.Control
                type="text"
                placeholder="Search by Project Name or Order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </Col>
        <Col md={6}>
            <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
            </Form.Select>
        </Col>
      </Row>


      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      
      {filteredProjects.length === 0 && !loading && !error && (
        <Alert variant="info">No projects match your criteria. {projects.length > 0 ? '' : 'Click "Add New Project" to get started.'}</Alert>
      )}

      <Row>
        {filteredProjects.map((project) => (
          <Col key={project._id} sm={12} md={6} lg={4} className="mb-4">
            <ProjectCard
              project={project}
              onEdit={userInfo?.role === 'admin' ? () => handleOpenFormModal(project) : null} // Only admin can edit from here
              onDelete={userInfo?.role === 'admin' ? () => handleDeleteProject(project._id) : null}
              onViewTracking={() => handleViewTrackingSheet(project._id)}
            />
          </Col>
        ))}
      </Row>

      {showFormModal && (
        <ProjectFormModal
          show={showFormModal}
          handleClose={handleCloseFormModal}
          onSuccess={handleFormSuccess}
          existingProject={selectedProject}
        />
      )}
    </Container>
  );
};

export default AllProjectsPage;