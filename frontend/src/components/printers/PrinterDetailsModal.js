// frontend/src/components/printers/PrinterDetailsModal.js
import React from 'react';
import { Modal, Button, Row, Col, Badge, Image, ListGroup } from 'react-bootstrap';
import { getApiUrl, formatDurationFromSeconds, formatDate } from '../../utils/helpers';
import { PRINTER_STATUS } from '../../utils/constants';
import useAuth from '../../hooks/useAuth';

const PrinterDetailsModal = ({ show, handleClose, printer, onEdit, onDelete }) => {
  const { userInfo } = useAuth();
  if (!printer) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case PRINTER_STATUS.AVAILABLE: return <Badge bg="success" pill>Available</Badge>;
      case PRINTER_STATUS.IN_PRODUCTION: return <Badge bg="info" pill>In Production</Badge>;
      case PRINTER_STATUS.MAINTENANCE: return <Badge bg="warning" pill>Maintenance</Badge>;
      default: return <Badge bg="secondary" pill>{status}</Badge>;
    }
  };
  
  // Use calculated stats if available, otherwise use stored stats from printer object
  const totalPrintTime = printer.calculatedTotalPrintTimeSeconds !== undefined ? printer.calculatedTotalPrintTimeSeconds : printer.totalPrintTimeSeconds;
  const totalFilament = printer.calculatedTotalFilamentUsedGrams !== undefined ? printer.calculatedTotalFilamentUsedGrams : printer.totalFilamentUsedGrams;
  const completedJobs = printer.calculatedCompletedJobsCount !== undefined ? printer.calculatedCompletedJobsCount : printer.completedJobsCount;
  const failedJobs = printer.calculatedFailedJobsCount !== undefined ? printer.calculatedFailedJobsCount : printer.failedJobsCount;
  const successRate = printer.successRate !== undefined ? printer.successRate.toFixed(1) : ((completedJobs + failedJobs) > 0 ? ((completedJobs / (completedJobs + failedJobs)) * 100).toFixed(1) : 0);
  const failureRate = printer.failureRate !== undefined ? printer.failureRate.toFixed(1) : ((completedJobs + failedJobs) > 0 ? ((failedJobs / (completedJobs + failedJobs)) * 100).toFixed(1) : 0);


  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{printer.name} - Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={4} className="text-center mb-3 mb-md-0">
            {printer.imagePath ? (
              <Image src={getApiUrl(printer.imagePath)} alt={printer.name} fluid rounded style={{ maxHeight: '250px', objectFit: 'contain' }} />
            ) : (
              <Image src={`https://via.placeholder.com/250?text=${printer.name.replace(/\s/g, "+")}`} alt="No Image" fluid rounded />
            )}
          </Col>
          <Col md={8}>
            <h4>{printer.name} {getStatusBadge(printer.status)}</h4>
            <p className="text-muted">{printer.company} - {printer.model}</p>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>Build Size:</strong> {printer.buildSize?.x || 'N/A'}mm (X) x {printer.buildSize?.y || 'N/A'}mm (Y) x {printer.buildSize?.z || 'N/A'}mm (Z)
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Total Print Time:</strong> {formatDurationFromSeconds(totalPrintTime || 0)}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Total Filament Used:</strong> {totalFilament ? (totalFilament / 1000).toFixed(2) : 0} kg
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Completed Jobs:</strong> {completedJobs || 0}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Failed Jobs:</strong> {failedJobs || 0}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Success Rate:</strong> {successRate}%
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Failure Rate:</strong> {failureRate}%
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Added On:</strong> {formatDate(printer.createdAt)}
              </ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
        {onEdit && <Button variant="outline-primary" onClick={onEdit}><i className="fas fa-edit"></i> Edit</Button>}
        {onDelete && userInfo?.role === 'admin' && <Button variant="outline-danger" onClick={onDelete}><i className="fas fa-trash"></i> Delete</Button>}
      </Modal.Footer>
    </Modal>
  );
};

export default PrinterDetailsModal;