// frontend/src/components/printers/PrinterCard.js
import React from 'react';
import { Card, Button, Badge, Col, Row } from 'react-bootstrap';
import { getApiUrl, formatDurationFromSeconds } from '../../utils/helpers'; // To construct image URL
import { PRINTER_STATUS } from '../../utils/constants';

const PrinterCard = ({ printer, onEdit, onDelete, onViewDetails }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case PRINTER_STATUS.AVAILABLE:
        return <Badge bg="success">Available</Badge>;
      case PRINTER_STATUS.IN_PRODUCTION:
        return <Badge bg="info">In Production</Badge>;
      case PRINTER_STATUS.MAINTENANCE:
        return <Badge bg="warning">Maintenance</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Use calculated stats if available, otherwise use stored stats
  const totalPrintTime = printer.calculatedTotalPrintTimeSeconds !== undefined ? printer.calculatedTotalPrintTimeSeconds : printer.totalPrintTimeSeconds;
  const totalFilament = printer.calculatedTotalFilamentUsedGrams !== undefined ? printer.calculatedTotalFilamentUsedGrams : printer.totalFilamentUsedGrams;
  const completedJobs = printer.calculatedCompletedJobsCount !== undefined ? printer.calculatedCompletedJobsCount : printer.completedJobsCount;
  const failedJobs = printer.calculatedFailedJobsCount !== undefined ? printer.calculatedFailedJobsCount : printer.failedJobsCount;
  const successRate = (completedJobs + failedJobs) > 0 ? ((completedJobs / (completedJobs + failedJobs)) * 100).toFixed(1) : 0;


  return (
    <Card className="h-100 shadow-sm card-hover">
      {printer.imagePath && (
        <Card.Img 
            variant="top" 
            src={getApiUrl(printer.imagePath)} // Use helper to construct full URL
            alt={printer.name} 
            style={{ height: '200px', objectFit: 'contain', paddingTop: '10px' }}
        />
      )}
      {!printer.imagePath && (
         <Card.Img 
            variant="top" 
            src={`https://via.placeholder.com/300x200.png?text=${printer.name.replace(/\s/g, "+")}`}
            alt={printer.name} 
            style={{ height: '200px', objectFit: 'cover' }}
        />
      )}
      <Card.Body className="d-flex flex-column">
        <Card.Title className="d-flex justify-content-between align-items-center">
          {printer.name}
          {getStatusBadge(printer.status)}
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{printer.company} - {printer.model}</Card.Subtitle>
        
        <div className="mt-auto"> {/* Pushes content below to the bottom of card body */}
            <p className="small mb-1">
                Print Time: {formatDurationFromSeconds(totalPrintTime || 0)} <br/>
                Filament Used: {totalFilament ? (totalFilament / 1000).toFixed(2) : 0} kg <br/>
                Jobs: {completedJobs || 0} Done / {failedJobs || 0} Failed ({successRate}%)
            </p>
            <div className="d-grid gap-2 d-sm-flex justify-content-sm-between">
                 <Button variant="outline-info" size="sm" onClick={onViewDetails} className="flex-fill me-sm-1 mb-1 mb-sm-0">
                    <i className="fas fa-eye"></i> Details
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={onEdit} className="flex-fill me-sm-1 mb-1 mb-sm-0">
                    <i className="fas fa-edit"></i> Edit
                </Button>
                {onDelete && (
                    <Button variant="outline-danger" size="sm" onClick={onDelete} className="flex-fill">
                        <i className="fas fa-trash"></i> Delete
                    </Button>
                )}
            </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PrinterCard;