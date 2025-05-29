// frontend/src/components/tracking/TrackingSheetFDM.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import PartRow from './PartRow'; // To be created
import AddPrintJobModal from './AddPrintJobModal'; // To be created
import EditPrintJobModal from './EditPrintJobModal'; // To be created
import printerService from '../../services/printerService'; // To fetch printers for dropdowns
import { PRINT_JOB_STATUS, PROJECT_STATUS } from '../../utils/constants';

const TrackingSheetFDM = ({ projectId, projectStatus, initialPrintJobs, onJobsUpdate }) => {
  const [printJobs, setPrintJobs] = useState(initialPrintJobs || []);
  const [printers, setPrinters] = useState([]); // For dropdowns in modals
  const [loading, setLoading] = useState(false); // For actions like add/edit
  const [error, setError] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedJobForEdit, setSelectedJobForEdit] = useState(null);

  useEffect(() => {
    setPrintJobs(initialPrintJobs || []);
  }, [initialPrintJobs]);

  useEffect(() => {
    const fetchPrintersForDropdown = async () => {
      try {
        const printerData = await printerService.getAllPrinters();
        // Filter for available or in_production printers if desired for selection
        setPrinters(printerData.filter(p => p.status !== 'maintenance'));
      } catch (err) {
        console.error("Failed to fetch printers for dropdown:", err);
        // Handle error, maybe set a specific error state
      }
    };
    fetchPrintersForDropdown();
  }, []);

  const handleAddJobSuccess = () => {
    setShowAddModal(false);
    onJobsUpdate(); // Call parent to refresh job list
  };

  const handleEditJobSuccess = () => {
    setShowEditModal(false);
    setSelectedJobForEdit(null);
    onJobsUpdate(); // Call parent to refresh job list
  };

  const openEditModal = (job) => {
    setSelectedJobForEdit(job);
    setShowEditModal(true);
  };

  const isProjectCompleted = projectStatus === PROJECT_STATUS.COMPLETED || projectStatus === PROJECT_STATUS.CANCELLED;


  return (
    <div>
      <div className="d-flex justify-content-end mb-3">
        {!isProjectCompleted && (
          <Button variant="success" onClick={() => setShowAddModal(true)}>
            <i className="fas fa-plus"></i> Add Part/Print Job
          </Button>
        )}
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <div className="table-responsive">
        <Table striped bordered hover responsive="md">
          {/* <thead>
            <tr>
              <th>#</th>
              <th>Part Name</th>
              <th>Machine Plate No.</th>
              <th>Machine Name</th>
              <th>Print Time (Scheduled)</th>
              <th>Weight (g)</th>
              <th>Job Start Date</th>
              <th>Job Start Time</th>
              <th>Status</th>
              <th>Actual Print Time</th>
              <th>Actions</th>
            </tr>
          </thead> */}
          <thead>
            <tr>
              <th>S.No</th>
              <th>Conceptual Part / Piece ID</th> {/* Changed Header */}
              <th>Slicer Plate No.</th>{/* Can be removed if combined above */} 
              <th>Machine Name</th>
              <th>Print Time (Scheduled)</th>
              <th>Weight (g)</th>
              <th>Job Start Date</th>
              <th>Job Start Time</th>
              <th>Status</th>
              <th>Actual Print Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {printJobs.length === 0 && (
              <tr>
                <td colSpan="11" className="text-center">No print jobs added yet.</td>
              </tr>
            )}
            {printJobs.map((job, index) => (
              <PartRow
                key={job._id}
                job={job}
                index={index + 1}
                onEdit={() => openEditModal(job)}
                isProjectCompleted={isProjectCompleted}
                onUpdate={onJobsUpdate} // Pass this down if PartRow handles direct updates
              />
            ))}
          </tbody>
        </Table>
      </div>
      {loading && <div className="text-center"><Spinner animation="border" size="sm" /> Processing...</div>}

      {showAddModal && (
        <AddPrintJobModal
          show={showAddModal}
          handleClose={() => setShowAddModal(false)}
          projectId={projectId}
          onSuccess={handleAddJobSuccess}
          availablePrinters={printers}
        />
      )}

      {showEditModal && selectedJobForEdit && (
        <EditPrintJobModal
          show={showEditModal}
          handleClose={() => {
            setShowEditModal(false);
            setSelectedJobForEdit(null);
          }}
          job={selectedJobForEdit}
          onSuccess={handleEditJobSuccess}
          availablePrinters={printers}
          projectId={projectId} // Needed for reprint
        />
      )}
    </div>
  );
};

export default TrackingSheetFDM;