// frontend/src/components/tracking/TrackingSheetFDM.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert, Badge, Accordion, Modal as ConfirmationModal } from 'react-bootstrap'
import PartRow from './PartRow';
import AddPrintJobModal from './AddPrintJobModal';
// import EditPrintJobModal from './EditPrintJobModal';
import EditJobDetailsModal from './EditJobDetailsModal'; // Import new modal
import ChangeStatusModal from './ChangeStatusModal';   // Import new modal
import printerService from '../../services/printerService';
import trackingService from '../../services/trackingService';
import { PRINT_JOB_STATUS, PROJECT_STATUS } from '../../utils/constants';

const TrackingSheetFDM = ({ projectId, projectStatus, initialPrintJobs, onJobsUpdate }) => {
  const [groupedJobs, setGroupedJobs] = useState({});
  const [printers, setPrinters] = useState([]);
  const [loadingActions, setLoadingActions] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  //const [showEditModal, setShowEditModal] = useState(false);
  const [selectedJobForEdit, setSelectedJobForEdit] = useState(null);
  const [addingToConceptualPart, setAddingToConceptualPart] = useState(null);
  const [activeAccordionKey, setActiveAccordionKey] = useState(null);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jobIdToDelete, setJobIdToDelete] = useState(null);

  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [selectedJobForAction, setSelectedJobForAction] = useState(null);

  useEffect(() => {
    const jobsToGroup = initialPrintJobs || [];
    const groups = jobsToGroup.reduce((acc, job) => {
      const conceptualName = job.part?.conceptualPartName || 'Uncategorized Pieces';
      if (!acc[conceptualName]) {
        acc[conceptualName] = { partDetails: job.part, jobs: [] };
      }
      acc[conceptualName].jobs.push(job);
      return acc;
    }, {});
    setGroupedJobs(groups);
  }, [initialPrintJobs]);

  useEffect(() => {
    const fetchPrintersForDropdown = async () => {
      try {
        const printerData = await printerService.getAllPrinters();
        setPrinters(printerData.filter(p => p.status !== 'maintenance'));
      } catch (err) {
        console.error("Failed to fetch printers for dropdown:", err);
        setError("Failed to load available printers.");
      }
    };
    fetchPrintersForDropdown();
  }, []);

   const handleGenericModalSuccess = () => { // Renamed for clarity
    setShowAddModal(false);
    setShowEditDetailsModal(false); // Close new modal
    setShowChangeStatusModal(false); // Close new modal
    setSelectedJobForAction(null);
    setAddingToConceptualPart(null);
    setLoadingActions(false);
    onJobsUpdate();
  };

  const openEditDetailsModal = (job) => {
    setSelectedJobForAction(job);
    setShowEditDetailsModal(true);
  };

  const openAddModal = (conceptualPartForNewPiece = null) => {
    setSelectedJobForAction(null); setAddingToConceptualPart(conceptualPartForNewPiece); setShowAddModal(true);
  }
  const openChangeStatusModal = (job) => {
    setSelectedJobForAction(job);
    setShowChangeStatusModal(true);
  };
  const handleDeleteClick = (id) => {
    setJobIdToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteJob = async () => {
    if (!jobIdToDelete) return;
    setLoadingActions(true);
    setError('');
    try {
      await trackingService.deletePrintJob(jobIdToDelete); // Assuming this service method exists
      setShowDeleteConfirm(false);
      setJobIdToDelete(null);
      onJobsUpdate(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete print job.');
      setShowDeleteConfirm(false); // Still close confirm on error
    } finally {
      setLoadingActions(false);
    }
  };

  const isProjectCompleted = projectStatus === PROJECT_STATUS.COMPLETED || projectStatus === PROJECT_STATUS.CANCELLED;

  
  return (
    <div>
      {/* ... Add New Conceptual Part Button ... */}
      <div className="d-flex justify-content-end mb-3">
        {!isProjectCompleted && (
          <Button variant="success" onClick={() => openAddModal(null)}>
            <i className="fas fa-plus"></i> Add New Conceptual Part & First Piece
          </Button>
        )}
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {/* ... Loading States for jobs ... */}
      {Object.keys(groupedJobs).length === 0 && !initialPrintJobs && (<div className="text-center p-3"><Spinner animation="border" /> Loading jobs...</div>)}
      {Object.keys(groupedJobs).length === 0 && initialPrintJobs?.length === 0 && (<Alert variant="info">No print jobs added for this project yet.</Alert>)}


      {Object.keys(groupedJobs).length > 0 && (
        <Accordion activeKey={activeAccordionKey} onSelect={(selectedKey) => setActiveAccordionKey(selectedKey)} className="tracking-accordion">
          {Object.entries(groupedJobs).map(([conceptualName, groupData]) => {
            const eventKey = conceptualName;
            return (
              <Accordion.Item eventKey={eventKey} key={eventKey} className="mb-2">
                <div className="accordion-custom-header d-flex align-items-center p-2 bg-light border-bottom">
                  <Accordion.Header as="div" className="flex-grow-1 me-2">
                    {conceptualName}
                    {groupData.partDetails?.totalPieces ? ` (Total Defined: ${groupData.partDetails.totalPieces})` : ' (Total Pieces not set)'}
                    <Badge pill bg="secondary" className="ms-2">
                      {groupData.jobs.length} Piece{groupData.jobs.length !== 1 ? 's' : ''} Listed
                    </Badge>
                  </Accordion.Header>

                  {!isProjectCompleted && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="flex-shrink-0"
                      onClick={() => openAddModal(groupData.partDetails)}
                      aria-label={`Add Piece to ${conceptualName}`}
                    >
                      <i className="fas fa-plus-circle"></i> Add Piece
                    </Button>
                  )}
                </div>

                <Accordion.Body className="p-0">
                  <div className="table-responsive">
                    <Table striped bordered hover responsive="md" size="sm" className="mb-0">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Piece ID / Details</th>
                          <th>Slicer Plate No.</th>
                          <th>Machine Name</th>
                          <th>Print Time (Est.)</th>
                          <th>Weight (g)</th>
                          <th>Job Start Date</th>
                          <th>Job Start Time</th>
                          <th>Status</th>
                          <th>Actual Print Time</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupData.jobs.map((job, jobIndex) => (
                          <PartRow
                            key={job._id}
                            job={job}
                            index={jobIndex + 1}
                            onEditDetails={() => openEditDetailsModal(job)} // Pass new handler
                            onChangeStatus={() => openChangeStatusModal(job)} // Pass new handler
                            onDelete={handleDeleteClick}
                            isProjectCompleted={isProjectCompleted}
                          />
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
      )}

     {/* Modals */}
     {loadingActions && <div className="text-center my-2"><Spinner animation="border" size="sm" /> Processing...</div>}
      {showAddModal && ( <AddPrintJobModal show={showAddModal} handleClose={() => setShowAddModal(false)} projectId={projectId} onSuccess={handleGenericModalSuccess} availablePrinters={printers} conceptualPartInfo={addingToConceptualPart} /> )}
      
      {/* New Modals */}
      {showEditDetailsModal && selectedJobForAction && (
        <EditJobDetailsModal
          show={showEditDetailsModal}
          handleClose={() => { setShowEditDetailsModal(false); setSelectedJobForAction(null); }}
          job={selectedJobForAction}
          onSuccess={handleGenericModalSuccess}
          availablePrinters={printers}
        />
      )}
      {showChangeStatusModal && selectedJobForAction && (
        <ChangeStatusModal
          show={showChangeStatusModal}
          handleClose={() => { setShowChangeStatusModal(false); setSelectedJobForAction(null); }}
          job={selectedJobForAction}
          onSuccess={handleGenericModalSuccess}
          availablePrinters={printers} // For re-print section
          projectId={projectId}      // For re-print API call
        />
      )}

      {/* Delete Confirmation Modal (same as before) */}
      <ConfirmationModal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        {/* ... modal content ... */}
        <ConfirmationModal.Header closeButton><ConfirmationModal.Title>Confirm Delete</ConfirmationModal.Title></ConfirmationModal.Header>
        <ConfirmationModal.Body>Are you sure you want to delete this print job/piece? This action cannot be undone.</ConfirmationModal.Body>
        <ConfirmationModal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} disabled={loadingActions}>Cancel</Button>
          <Button variant="danger" onClick={confirmDeleteJob} disabled={loadingActions}>
            {loadingActions ? <Spinner as="span" animation="border" size="sm" /> : 'Delete'}
          </Button>
        </ConfirmationModal.Footer>
      </ConfirmationModal>
    </div>
  );
};
export default TrackingSheetFDM;