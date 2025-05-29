// frontend/src/components/projects/ProjectCard.js
import React, { useState } from 'react';
import { Card, Button, Badge, Row, Col, Dropdown } from 'react-bootstrap';
import { formatDate, formatDurationFromSeconds } from '../../utils/helpers';
import { PROJECT_STATUS } from '../../utils/constants';
import ProjectCostDisplay from './ProjectCostDisplay'; // We'll create this next

const ProjectCard = ({ project, onEdit, onDelete, onViewTracking }) => {
  const [showCostBy, setShowCostBy] = useState('time'); // 'time' or 'filament'

  const getStatusBadge = (status) => {
    switch (status) {
      case PROJECT_STATUS.ONGOING:
        return <Badge bg="primary">Ongoing</Badge>;
      case PROJECT_STATUS.COMPLETED:
        return <Badge bg="success">Completed</Badge>;
      case PROJECT_STATUS.CANCELLED:
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="h-100 shadow-sm card-hover">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{project.projectName}</h5>
        {getStatusBadge(project.status)}
      </Card.Header>
      <Card.Body className="d-flex flex-column">
        {project.orderId && <p className="text-muted mb-1">Order ID: {project.orderId}</p>}
        <p className="mb-1">Start Date: {formatDate(project.startDate)}</p>
        {project.status === PROJECT_STATUS.COMPLETED && project.endDate && (
          <p className="mb-1">End Date: {formatDate(project.endDate)}</p>
        )}
        <p className="mb-1">
            Duration: {project.durationDays !== undefined ? `${project.durationDays} day(s)` : 'N/A'}
        </p>
        <p className="mb-1">
            Total Print Time (Completed): {formatDurationFromSeconds(project.totalPrintTimeSeconds || 0)}
        </p>
        
        <div className="my-2">
            <ProjectCostDisplay
                costByTime={project.costByTime}
                costByFilament={project.costByFilament}
                showCostBy={showCostBy}
                setShowCostBy={setShowCostBy}
            />
        </div>
        
        {project.createdBy && (
            <p className="small text-muted mt-1 mb-2">Created by: {project.createdBy.name}</p>
        )}

        <div className="mt-auto">
          <Row className="g-2">
            <Col xs={12}>
                <Button variant="info" className="w-100 mb-1" onClick={onViewTracking}>
                    <i className="fas fa-tasks"></i> View Tracking Sheet
                </Button>
            </Col>
            {onEdit && (
                <Col xs={6}>
                    <Button variant="outline-secondary" className="w-100" onClick={onEdit}>
                        <i className="fas fa-edit"></i> Edit
                    </Button>
                </Col>
            )}
            {onDelete && (
                <Col xs={onEdit ? 6 : 12}>
                    <Button variant="outline-danger" className="w-100" onClick={onDelete}>
                        <i className="fas fa-trash"></i> Delete
                    </Button>
                </Col>
            )}
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProjectCard;