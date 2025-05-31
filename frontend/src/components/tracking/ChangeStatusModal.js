// frontend/src/components/tracking/ChangeStatusModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner, Row, Col, Badge, Card } from 'react-bootstrap';
import useForm from '../../hooks/useForm';
import trackingService from '../../services/trackingService';
import InputField from '../common/InputField';
import { PRINT_JOB_STATUS } from '../../utils/constants';
import { formatDurationFromSeconds, parseDurationToSeconds } from '../../utils/helpers';

const ChangeStatusModal = ({ show, handleClose, job, onSuccess, availablePrinters, projectId }) => {
  const getInitialValues = (currentJob) => {
    if(!currentJob) return {};
    return {
      status: currentJob.status || PRINT_JOB_STATUS.PRINTING,
      actualPrintTime: currentJob.actualPrintTimeSeconds ? formatDurationFromSeconds(currentJob.actualPrintTimeSeconds) :
                       (currentJob.status === PRINT_JOB_STATUS.COMPLETED ? formatDurationFromSeconds(currentJob.printTimeScheduledSeconds) : ''),
      failReason: currentJob.failReason || '',
      // Reprint fields
      newMachineId: '',
      newPrintTimeScheduled: currentJob.printTimeScheduledSeconds ? formatDurationFromSeconds(currentJob.printTimeScheduledSeconds) : '',
      newJobStartDate: new Date().toISOString().split('T')[0],
      newJobStartTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12:true }).toLowerCase(),
      newMachinePlateNo: currentJob.machinePlateNo || '',
    };
  };

  const {
    values, errors, isSubmitting, handleChange, handleSubmit, resetForm, setValues, setErrors, setIsSubmitting
  } = useForm(getInitialValues(job), validateStatusForm);

  const [formError, setFormError] = useState('');
  const [showReprintSection, setShowReprintSection] = useState(false);

  useEffect(() => {
    if (show && job) {
      resetForm(getInitialValues(job));
      setShowReprintSection(false);
    }
    if(!show) setFormError('');
  }, [job, show, resetForm]);

  function validateStatusForm(vals) {
    const errs = {};
    if (!vals.status) errs.status = "Status is required.";
    if (vals.status === PRINT_JOB_STATUS.FAILED && !vals.failReason?.trim() && !showReprintSection) {
      errs.failReason = 'Reason for failure is required if not reprinting immediately.';
    }
    if ((vals.status === PRINT_JOB_STATUS.COMPLETED || vals.status === PRINT_JOB_STATUS.FAILED) && vals.actualPrintTime) {
        if(isNaN(parseDurationToSeconds(vals.actualPrintTime)) || parseDurationToSeconds(vals.actualPrintTime) < 0) {
            errs.actualPrintTime = 'Invalid actual print time format.';
        }
    }
    if(showReprintSection) {
        if(!vals.newMachineId) errs.newMachineId = "New machine is required.";
        if(!vals.newPrintTimeScheduled?.trim()) errs.newPrintTimeScheduled = "Scheduled time is required.";
        else if(isNaN(parseDurationToSeconds(vals.newPrintTimeScheduled)) || parseDurationToSeconds(vals.newPrintTimeScheduled) <=0) {
             errs.newPrintTimeScheduled = 'Invalid print time format for reprint.';
        }
        if(!vals.newJobStartDate) errs.newJobStartDate = "Start date is required.";
        if(!vals.newMachinePlateNo?.trim()) errs.newMachinePlateNo = "New Piece ID for reprint is required.";
    }
    return errs;
  }

  const onSubmit = async () => {
    setFormError('');
    setIsSubmitting(true);
    if (showReprintSection) {
        const reprintData = { /* ... same as before ... */
            newMachineId: values.newMachineId, newPrintTimeScheduled: values.newPrintTimeScheduled,
            newJobStartDate: values.newJobStartDate, newJobStartTime: values.newJobStartTime,
            newMachinePlateNo: values.newMachinePlateNo,
        };
        try {
            await trackingService.reprintFailedJob(job._id, reprintData);
            onSuccess(); handleLocalClose();
        } catch (err) { setFormError(err.response?.data?.message || 'Reprint failed'); }
        finally { setIsSubmitting(false); }
    } else {
        const statusUpdateData = { /* ... same as before ... */
            status: values.status,
            failReason: values.status === PRINT_JOB_STATUS.FAILED ? values.failReason : undefined,
            actualPrintTime: (values.status === PRINT_JOB_STATUS.COMPLETED || values.status === PRINT_JOB_STATUS.FAILED) ? values.actualPrintTime : undefined,
        };
        try {
            await trackingService.updatePrintJob(job._id, statusUpdateData); // Backend needs to handle partial updates
            onSuccess(); handleLocalClose();
        } catch (err) { setFormError(err.response?.data?.message || 'Status update failed'); }
        finally { setIsSubmitting(false); }
    }
  };

  const handleLocalClose = () => {
    setShowReprintSection(false);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleLocalClose} size="md" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Change Status: {job?.part?.conceptualPartName} - ID: {job?.machinePlateNo}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={(e) => handleSubmit(e, onSubmit)}>
        <Modal.Body>
          {formError && <Alert variant="danger">{formError}</Alert>}
          {!showReprintSection && (
            <>
              <InputField label="Status" name="status" as="select" value={values.status} onChange={handleChange} error={errors.status}>
                <option value={PRINT_JOB_STATUS.PRINTING}>Printing</option>
                <option value={PRINT_JOB_STATUS.COMPLETED}>Completed</option>
                <option value={PRINT_JOB_STATUS.FAILED}>Failed</option>
              </InputField>
              {(values.status === PRINT_JOB_STATUS.COMPLETED || values.status === PRINT_JOB_STATUS.FAILED) && (
                <InputField label="Actual Print Time (Optional)" name="actualPrintTime" value={values.actualPrintTime} onChange={handleChange} placeholder="If different, e.g., 2hr 15min" error={errors.actualPrintTime} />
              )}
              {values.status === PRINT_JOB_STATUS.FAILED && (
                <InputField label="Reason for Failure" name="failReason" as="textarea" rows={2} value={values.failReason} onChange={handleChange} error={errors.failReason} isRequired={values.status === PRINT_JOB_STATUS.FAILED} />
              )}
            </>
          )}
          {!showReprintSection && values.status === PRINT_JOB_STATUS.FAILED && (
            <Button variant="warning" className="mt-3" onClick={() => setShowReprintSection(true)}>
              <i className="fas fa-redo"></i> Configure Re-print
            </Button>
          )}
          {showReprintSection && (
            <Card className="mt-3 border-warning">
              <Card.Header className="bg-warning text-dark">Re-print Configuration</Card.Header>
              <Card.Body>
                {/* ... Reprint form fields from previous EditPrintJobModal ... */}
                <p>Re-printing piece: <strong>{job?.part?.conceptualPartName} - ID: {job?.machinePlateNo}</strong></p>
                <InputField label="New Piece ID / Plate No." name="newMachinePlateNo" value={values.newMachinePlateNo} onChange={handleChange} error={errors.newMachinePlateNo} isRequired/>
                <InputField label="New Machine" name="newMachineId" as="select" value={values.newMachineId} onChange={handleChange} error={errors.newMachineId} isRequired>
                  <option value="">-- Select --</option>
                  {availablePrinters.map(p=><option key={p._id} value={p._id} disabled={p.status==='maintenance'}>{p.name} ({p.status})</option>)}
                </InputField>
                <InputField label="New Scheduled Time" name="newPrintTimeScheduled" value={values.newPrintTimeScheduled} onChange={handleChange} error={errors.newPrintTimeScheduled} isRequired />
                <Row><Col md={6}><InputField label="New Start Date" type="date" name="newJobStartDate" value={values.newJobStartDate} onChange={handleChange} error={errors.newJobStartDate} isRequired/></Col>
                <Col md={6}><InputField label="New Start Time" name="newJobStartTime" value={values.newJobStartTime} onChange={handleChange}/></Col></Row>
                <Button variant="outline-secondary" className="mt-2" onClick={() => setShowReprintSection(false)}>Cancel Re-print</Button>
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleLocalClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? <Spinner/> : (showReprintSection ? 'Submit Re-print' : 'Update Status')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
export default ChangeStatusModal;