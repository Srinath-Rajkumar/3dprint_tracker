// frontend/src/components/tracking/EditJobDetailsModal.js
import React, { useEffect,useState } from 'react';
import { Modal, Form, Button, Alert, Spinner, Row, Col,Badge } from 'react-bootstrap';
import useForm from '../../hooks/useForm';
import trackingService from '../../services/trackingService';
import InputField from '../common/InputField';
import { formatDurationFromSeconds, parseDurationToSeconds } from '../../utils/helpers';
// PRINT_JOB_STATUS not needed here unless displaying current status for context

const EditJobDetailsModal = ({ show, handleClose, job, onSuccess, availablePrinters }) => {
  const getInitialValues = (currentJob) => {
    if (!currentJob) return {}; // Should not happen
    return {
      conceptualPartNameDisplay: currentJob.part?.conceptualPartName || 'N/A',
      machinePlateNo: currentJob.machinePlateNo || '',
      machineId: currentJob.machine?._id || '',
      printTimeScheduled: currentJob.printTimeScheduledSeconds ? formatDurationFromSeconds(currentJob.printTimeScheduledSeconds) : '',
      weightGrams: currentJob.weightGrams || '',
      jobStartDate: currentJob.jobStartDate ? new Date(currentJob.jobStartDate).toISOString().split('T')[0] : '',
      jobStartTime: currentJob.jobStartTime || '',
      // No status fields here
    };
  };

  const {
    values, errors, isSubmitting, handleChange, handleSubmit, resetForm, setIsSubmitting
  } = useForm(getInitialValues(job), validateDetailsForm);

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (show && job) {
      resetForm(getInitialValues(job));
    }
    if(!show) setFormError('');
  }, [job, show, resetForm]);

  function validateDetailsForm(vals) {
    const errs = {};
    if (!vals.machinePlateNo?.trim()) errs.machinePlateNo = 'Piece ID is required.';
    if (!vals.machineId) errs.machineId = 'Machine is required.';
    if (!vals.printTimeScheduled?.trim()) {
        errs.printTimeScheduled = 'Scheduled print time is required.';
    } else if (isNaN(parseDurationToSeconds(vals.printTimeScheduled)) || parseDurationToSeconds(vals.printTimeScheduled) <=0) {
        errs.printTimeScheduled = 'Invalid print time format.';
    }
    if (!vals.weightGrams || isNaN(vals.weightGrams) || Number(vals.weightGrams) <= 0) {
      errs.weightGrams = 'Valid weight is required.';
    }
    if (!vals.jobStartDate) errs.jobStartDate = 'Start date is required.';
    return errs;
  }

  const onSubmit = async () => {
    setFormError('');
    setIsSubmitting(true);
    const jobUpdateData = {
      machinePlateNo: values.machinePlateNo,
      machineId: values.machineId,
      printTimeScheduled: values.printTimeScheduled,
      weightGrams: Number(values.weightGrams),
      jobStartDate: values.jobStartDate,
      jobStartTime: values.jobStartTime,
      // status is NOT sent from this modal
    };
    try {
      await trackingService.updatePrintJob(job._id, jobUpdateData); // Backend needs to handle partial updates
      onSuccess();
      handleLocalClose();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to update job details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocalClose = () => {
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleLocalClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Edit Piece Details: {values.conceptualPartNameDisplay} - ID: {job?.machinePlateNo}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={(e) => handleSubmit(e, onSubmit)}>
        <Modal.Body>
          {formError && <Alert variant="danger">{formError}</Alert>}
          <p><strong>Conceptual Part:</strong> {values.conceptualPartNameDisplay} (Read-only)</p>
          <p><strong>Current Status:</strong> <Badge bg="secondary">{job?.status || 'N/A'}</Badge> (Change status using the 'Change Status' button in the table)</p>
          <hr/>
          <InputField label="Piece ID / Machine Plate No." name="machinePlateNo" value={values.machinePlateNo} onChange={handleChange} error={errors.machinePlateNo} isRequired />
          <InputField label="Machine/Printer" name="machineId" as="select" value={values.machineId} onChange={handleChange} error={errors.machineId} isRequired>
            <option value="">-- Select Printer --</option>
            {availablePrinters.map(p => (
              <option key={p._id} value={p._id} disabled={p.status === 'maintenance' || (p._id !== job?.machine?._id && p.status === 'in_production')}>
                {p.name} ({p.model || 'N/A'} - {p.status})
              </option>
            ))}
          </InputField>
          <Row>
            <Col md={6}><InputField label="Scheduled Print Time" name="printTimeScheduled" value={values.printTimeScheduled} onChange={handleChange} error={errors.printTimeScheduled} isRequired /></Col>
            <Col md={6}><InputField label="Weight (grams)" type="number" name="weightGrams" value={values.weightGrams} onChange={handleChange} error={errors.weightGrams} isRequired min="1" /></Col>
          </Row>
          <Row>
            <Col md={6}><InputField label="Job Start Date" type="date" name="jobStartDate" value={values.jobStartDate} onChange={handleChange} error={errors.jobStartDate} isRequired /></Col>
            <Col md={6}><InputField label="Job Start Time" name="jobStartTime" value={values.jobStartTime} onChange={handleChange} error={errors.jobStartTime} /></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleLocalClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : 'Save Details'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
export default EditJobDetailsModal;