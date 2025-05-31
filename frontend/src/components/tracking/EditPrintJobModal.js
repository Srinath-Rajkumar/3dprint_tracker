// frontend/src/components/tracking/EditPrintJobModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner, Row, Col, Badge, Card } from 'react-bootstrap';
import useForm from '../../hooks/useForm'; // Assuming this path
import trackingService from '../../services/trackingService';
import InputField from '../common/InputField'; // Assuming this path
import { PRINT_JOB_STATUS } from '../../utils/constants';
import { formatDurationFromSeconds, parseDurationToSeconds } from '../../utils/helpers';

const EditPrintJobModal = ({ show, handleClose, job, onSuccess, availablePrinters, projectId }) => {
  // Initial values will now include all editable fields of the job
  const getInitialValues = (currentJob) => {
    if (!currentJob) {
      return { // Default structure if job is somehow null
        conceptualPartNameDisplay: '', // Not editable here, just for display
        machinePlateNo: '',
        machineId: '',
        printTimeScheduled: '',
        weightGrams: '',
        jobStartDate: new Date().toISOString().split('T')[0],
        jobStartTime: '',
        status: PRINT_JOB_STATUS.PRINTING,
        actualPrintTime: '',
        failReason: '',
        // Reprint fields
        newMachineId: '',
        newPrintTimeScheduled: '',
        newJobStartDate: new Date().toISOString().split('T')[0],
        newJobStartTime: '',
        newMachinePlateNo: '',
      };
    }
    return {
      conceptualPartNameDisplay: currentJob.part?.conceptualPartName || 'N/A',
      machinePlateNo: currentJob.machinePlateNo || '',
      machineId: currentJob.machine?._id || '',
      printTimeScheduled: currentJob.printTimeScheduledSeconds ? formatDurationFromSeconds(currentJob.printTimeScheduledSeconds) : '',
      weightGrams: currentJob.weightGrams || '',
      jobStartDate: currentJob.jobStartDate ? new Date(currentJob.jobStartDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      jobStartTime: currentJob.jobStartTime || '',
      status: currentJob.status || PRINT_JOB_STATUS.PRINTING,
      actualPrintTime: currentJob.actualPrintTimeSeconds ? formatDurationFromSeconds(currentJob.actualPrintTimeSeconds) : '',
      failReason: currentJob.failReason || '',
      // Re-print section defaults (based on the job being edited, for convenience if reprinting)
      newMachineId: '', // User must select
      newPrintTimeScheduled: currentJob.printTimeScheduledSeconds ? formatDurationFromSeconds(currentJob.printTimeScheduledSeconds) : '',
      newJobStartDate: new Date().toISOString().split('T')[0],
      newJobStartTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12:true }).toLowerCase(),
      newMachinePlateNo: currentJob.machinePlateNo || '', // Default to original piece's ID
    };
  };

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setValues, // Directly use setValues from useForm
    setErrors, // Not typically needed directly if validate function works
    setIsSubmitting, // Directly use setIsSubmitting
  } = useForm(getInitialValues(job), validateEditForm);

  const [formError, setFormError] = useState(''); // For general API errors
  const [showReprintSection, setShowReprintSection] = useState(false);

  useEffect(() => {
    if (show && job) {
      // When modal is shown or job changes, reset form with job's current values
      resetForm(getInitialValues(job));
      setShowReprintSection(false); // Always hide reprint section initially
    }
    if (!show) { // Clear form error when modal is hidden
        setFormError('');
    }
  }, [job, show, resetForm]); // Removed getInitialValues from deps as resetForm takes it

  // This validation needs to consider what's being submitted: job details, status, or reprint
  function validateEditForm(vals) {
    const errs = {};
    // Validation for editing existing job details (if not in reprint mode)
    if (!showReprintSection) {
      if (!vals.machinePlateNo?.trim()) errs.machinePlateNo = 'Piece ID / Machine Plate No. is required.';
      if (!vals.machineId) errs.machineId = 'Machine selection is required.';
      if (!vals.printTimeScheduled?.trim()) {
          errs.printTimeScheduled = 'Scheduled print time is required.';
      } else if (isNaN(parseDurationToSeconds(vals.printTimeScheduled)) || parseDurationToSeconds(vals.printTimeScheduled) <=0) {
          errs.printTimeScheduled = 'Invalid print time format (e.g., "2hr 30min").';
      }
      if (!vals.weightGrams || isNaN(vals.weightGrams) || Number(vals.weightGrams) <= 0) {
        errs.weightGrams = 'Valid weight in grams is required.';
      }
      if (!vals.jobStartDate) errs.jobStartDate = 'Job start date is required.';

      // Status specific validation
      if (vals.status === PRINT_JOB_STATUS.FAILED && !vals.failReason?.trim()) {
        errs.failReason = 'Reason for failure is required if status is Failed.';
      }
      if ((vals.status === PRINT_JOB_STATUS.COMPLETED || vals.status === PRINT_JOB_STATUS.FAILED) && vals.actualPrintTime) {
          if(isNaN(parseDurationToSeconds(vals.actualPrintTime)) || parseDurationToSeconds(vals.actualPrintTime) < 0) { // Allow 0 for actual time? Usually not.
              errs.actualPrintTime = 'Invalid actual print time format.';
          }
      }
    }

    // Validation for Re-print section (if visible)
    if (showReprintSection) {
      if (!vals.newMachineId) errs.newMachineId = "New machine is required for reprint.";
      if (!vals.newPrintTimeScheduled?.trim()) errs.newPrintTimeScheduled = "Scheduled time for reprint is required.";
      else if (isNaN(parseDurationToSeconds(vals.newPrintTimeScheduled)) || parseDurationToSeconds(vals.newPrintTimeScheduled) <= 0) {
        errs.newPrintTimeScheduled = 'Invalid print time format for reprint.';
      }
      if (!vals.newJobStartDate) errs.newJobStartDate = "Start date for reprint is required.";
      if (!vals.newMachinePlateNo?.trim()) errs.newMachinePlateNo = "New Piece ID for reprint is required.";
    }
    return errs;
  }

  const onSubmitChanges = async () => { // This will handle both job detail updates and status updates
    setFormError('');
    setIsSubmitting(true); // useForm's setIsSubmitting

    if (showReprintSection) { // If reprinting, call the reprint API
        const reprintData = {
            newMachineId: values.newMachineId,
            newPrintTimeScheduled: values.newPrintTimeScheduled,
            newJobStartDate: values.newJobStartDate,
            newJobStartTime: values.newJobStartTime,
            newMachinePlateNo: values.newMachinePlateNo, // Ensure this matches backend expectation
        };
        try {
            await trackingService.reprintFailedJob(job._id, reprintData);
            onSuccess();
            handleLocalClose();
        } catch (err) {
            setFormError(err.response?.data?.message || err.message || 'Failed to submit reprint job');
        } finally {
            setIsSubmitting(false);
        }
    } else { // If just updating the current job's details/status
        const jobUpdateData = {
            // Include all fields that can be edited for an existing PrintJob
            // The backend controller for updatePrintJob should handle these.
            machinePlateNo: values.machinePlateNo,
            machineId: values.machineId,
            printTimeScheduled: values.printTimeScheduled, // Backend expects string, parses to seconds
            weightGrams: Number(values.weightGrams),
            jobStartDate: values.jobStartDate,
            jobStartTime: values.jobStartTime,
            status: values.status,
            failReason: values.status === PRINT_JOB_STATUS.FAILED ? values.failReason : undefined,
            actualPrintTime: (values.status === PRINT_JOB_STATUS.COMPLETED || values.status === PRINT_JOB_STATUS.FAILED) ? values.actualPrintTime : undefined,
        };
        try {
            await trackingService.updatePrintJob(job._id, jobUpdateData);
            onSuccess();
            handleLocalClose();
        } catch (err) {
            setFormError(err.response?.data?.message || err.message || 'Failed to update print job');
        } finally {
            setIsSubmitting(false);
        }
    }
  };


  const handleLocalClose = () => {
    // resetForm(getInitialValues(job)); // Reset with original job values if re-opening for same job
    setShowReprintSection(false);
    handleClose(); // This will typically unmount or hide, causing useEffect to run on next show
  };


  return (
    <Modal show={show} onHide={handleLocalClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
            Edit Print Piece: {values.conceptualPartNameDisplay} - Piece ID: {job?.machinePlateNo}
            {job?.isReprint && <Badge bg="warning" text="dark" pill className="ms-2">Reprint</Badge>}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={(e) => handleSubmit(e, onSubmitChanges)}>
        <Modal.Body>
          {formError && <Alert variant="danger">{formError}</Alert>}
          
          {!showReprintSection && (
            <>
              <Card className="mb-3">
                <Card.Header>Original Piece Details</Card.Header>
                <Card.Body>
                  <InputField label="Conceptual Part (Read-only)" name="conceptualPartNameDisplay" value={values.conceptualPartNameDisplay} readOnly />
                  <Row>
                    <Col md={6}>
                      <InputField label="Piece ID / Machine Plate No." name="machinePlateNo" value={values.machinePlateNo} onChange={handleChange} error={errors.machinePlateNo} isRequired />
                    </Col>
                    <Col md={6}>
                      <InputField label="Machine/Printer" name="machineId" as="select" value={values.machineId} onChange={handleChange} error={errors.machineId} isRequired>
                        <option value="">-- Select Printer --</option>
                        {availablePrinters.map(p => (
                          <option key={p._id} value={p._id} disabled={p.status === 'maintenance' || (p._id !== job?.machine?._id && p.status === 'in_production')}>
                            {p.name} ({p.model || 'N/A'} - {p.status})
                          </option>
                        ))}
                      </InputField>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <InputField label="Scheduled Print Time" name="printTimeScheduled" value={values.printTimeScheduled} onChange={handleChange} error={errors.printTimeScheduled} placeholder="e.g., 2hr 30min" isRequired />
                    </Col>
                    <Col md={6}>
                      <InputField label="Weight (grams)" type="number" name="weightGrams" value={values.weightGrams} onChange={handleChange} error={errors.weightGrams} isRequired min="1"/>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <InputField label="Job Start Date" type="date" name="jobStartDate" value={values.jobStartDate} onChange={handleChange} error={errors.jobStartDate} isRequired />
                    </Col>
                    <Col md={6}>
                      <InputField label="Job Start Time" name="jobStartTime" value={values.jobStartTime} onChange={handleChange} error={errors.jobStartTime} placeholder="e.g., 08:00 PM" />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card>
                <Card.Header>Status Update</Card.Header>
                <Card.Body>
                  <InputField label="Status" name="status" as="select" value={values.status} onChange={handleChange} error={errors.status}>
                    <option value={PRINT_JOB_STATUS.PRINTING}>Printing</option>
                    <option value={PRINT_JOB_STATUS.COMPLETED}>Completed</option>
                    <option value={PRINT_JOB_STATUS.FAILED}>Failed</option>
                  </InputField>

                  {(values.status === PRINT_JOB_STATUS.COMPLETED || values.status === PRINT_JOB_STATUS.FAILED) && (
                    <InputField label="Actual Print Time (Optional)" name="actualPrintTime" value={values.actualPrintTime} onChange={handleChange} placeholder="If different from scheduled" error={errors.actualPrintTime} />
                  )}

                  {values.status === PRINT_JOB_STATUS.FAILED && (
                    <InputField label="Reason for Failure" name="failReason" as="textarea" rows={2} value={values.failReason} onChange={handleChange} error={errors.failReason} isRequired={values.status === PRINT_JOB_STATUS.FAILED} />
                  )}
                </Card.Body>
              </Card>
            </>
          )}

          {/* Reprint Button & Section */}
          {!showReprintSection && values.status === PRINT_JOB_STATUS.FAILED && (
            <Button variant="warning" className="mt-3" onClick={() => setShowReprintSection(true)}>
              <i className="fas fa-redo"></i> Configure Re-print for this Failed Piece
            </Button>
          )}

          {showReprintSection && (
            <Card className="mt-3 border-warning">
              <Card.Header className="bg-warning text-dark">Re-print Configuration</Card.Header>
              <Card.Body>
                <p>You are configuring a <strong>new print job</strong> to re-print the failed piece: <strong>{values.conceptualPartNameDisplay} - Piece ID: {job?.machinePlateNo}</strong>.</p>
                <InputField label="New Piece ID / Machine Plate No. for Re-print" name="newMachinePlateNo" value={values.newMachinePlateNo} onChange={handleChange} error={errors.newMachinePlateNo} isRequired placeholder="Usually same as original, or new if needed"/>
                <InputField label="Select New Machine for Re-print" name="newMachineId" as="select" value={values.newMachineId} onChange={handleChange} error={errors.newMachineId} isRequired>
                  <option value="">-- Select Printer --</option>
                  {availablePrinters.map(p => (
                    <option key={p._id} value={p._id} disabled={p.status === 'maintenance'}>
                      {p.name} ({p.model || 'N/A'} - {p.status})
                    </option>
                  ))}
                </InputField>
                <InputField label="Scheduled Print Time for Re-print" name="newPrintTimeScheduled" value={values.newPrintTimeScheduled} onChange={handleChange} error={errors.newPrintTimeScheduled} isRequired />
                <Row>
                  <Col md={6}><InputField label="Re-print Start Date" type="date" name="newJobStartDate" value={values.newJobStartDate} onChange={handleChange} error={errors.newJobStartDate} isRequired /></Col>
                  <Col md={6}><InputField label="Re-print Start Time" name="newJobStartTime" value={values.newJobStartTime} onChange={handleChange} error={errors.newJobStartTime} /></Col>
                </Row>
                <Button variant="outline-secondary" className="mt-2" onClick={() => {
                    setShowReprintSection(false);
                    // Clear reprint specific errors if any
                    setErrors(prev => ({...prev, newMachineId: null, newPrintTimeScheduled: null, newJobStartDate: null, newMachinePlateNo: null }));
                    }}>
                  Cancel Re-print Setup
                </Button>
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleLocalClose} disabled={isSubmitting}>
            Cancel All
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : 
             (showReprintSection ? 'Submit Re-print Job' : 'Save Job Changes')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditPrintJobModal;