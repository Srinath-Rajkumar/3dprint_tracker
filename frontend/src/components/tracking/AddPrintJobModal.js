// frontend/src/components/tracking/AddPrintJobModal.js

import React, { useEffect, useMemo,useCallback } from 'react'; // Added useMemo
import { Modal, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import useForm from '../../hooks/useForm';
import trackingService from '../../services/trackingService';
import InputField from '../common/InputField';
import { parseDurationToSeconds } from '../../utils/helpers';

// Define defaultInitialValues outside the component so it's stable
const defaultInitialValuesTemplate = {
  conceptualPartName: '',
  machinePlateNo: '',
  machineId: '',
  printTimeScheduled: '',
  weightGrams: '',
  jobStartDate: new Date().toISOString().split('T')[0],
  jobStartTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase(),
  totalPiecesInConcept: '',
};

const AddPrintJobModal = ({
  show,
  handleClose,
  projectId,
  onSuccess,
  availablePrinters,
  conceptualPartInfo,
}) => {
  // Use useMemo for defaultInitialValues if it ever needs to be dynamic based on props,
  // but here it's static, so defining outside is fine.
  // Forcing re-initialization of useForm if conceptualPartInfo changes significantly
  // can be done by changing the key of the Form or the component itself, or by
  // carefully managing initial values. useForm's `initialState` is only used on its first run.

  const getInitialValues = useCallback(() => {
    if (conceptualPartInfo) {
      return {
        ...defaultInitialValuesTemplate,
        conceptualPartName: conceptualPartInfo.conceptualPartName,
        totalPiecesInConcept: conceptualPartInfo.totalPieces || '',
      };
    }
    return { ...defaultInitialValuesTemplate };
  }, [conceptualPartInfo]); // getInitialValues changes if conceptualPartInfo changes

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm, // resetForm from useForm can take new initial values
    setValues,  // This is the 'setFormValues' alias from your useForm hook
  } = useForm(getInitialValues(), validatePrintJobForm); // Initialize useForm with dynamic initial values

  // This effect will run when 'show' changes or when 'getInitialValues' function reference changes
  // (which happens when conceptualPartInfo changes).
  useEffect(() => {
    if (show) {
      // When the modal is shown, reset the form with the appropriate initial values
      resetForm(getInitialValues());
    }
  }, [show, getInitialValues, resetForm]);


  const onSubmitApiCall = async () => {
    const jobData = {
      conceptualPartName: values.conceptualPartName,
      machinePlateNo: values.machinePlateNo,
      machineId: values.machineId,
      printTimeScheduled: values.printTimeScheduled,
      weightGrams: Number(values.weightGrams),
      jobStartDate: values.jobStartDate,
      jobStartTime: values.jobStartTime,
      totalPiecesInConcept: values.totalPiecesInConcept ? Number(values.totalPiecesInConcept) : undefined,
    };

    try {
      await trackingService.addPrintJob(projectId, jobData);
      onSuccess();
      handleLocalClose();
    } catch (err) {
      console.error("Add Print Job API Error:", err);
      alert(err.response?.data?.message || err.message || 'Failed to add print piece. Server error.');
    }
  };

  const handleLocalClose = () => {
    // resetForm will use the initial values derived from getInitialValues at the time of the last reset
    // or the very first initial values if not called with an argument.
    // To ensure it always resets to the *current* context (new part vs piece of existing):
    resetForm(getInitialValues());
    handleClose();
  };

  // Validation function (make sure it's defined or imported)
  function validatePrintJobForm(vals) {
    const errs = {};
    if (!vals.conceptualPartName?.trim()) errs.conceptualPartName = 'Conceptual Part Name is required.';
    if (!vals.machinePlateNo?.trim()) errs.machinePlateNo = 'Piece ID / Machine Plate No. is required.';
    if (!vals.machineId) errs.machineId = 'Machine selection is required.';
    if (!vals.printTimeScheduled?.trim()) {
        errs.printTimeScheduled = 'Scheduled print time is required.';
    } else {
        const seconds = parseDurationToSeconds(vals.printTimeScheduled);
        if (isNaN(seconds) || seconds <=0) {
            errs.printTimeScheduled = 'Invalid print time format (e.g., "2hr 30min", "1day"). Must be > 0.';
        }
    }
    if (!vals.weightGrams || isNaN(vals.weightGrams) || Number(vals.weightGrams) <= 0) {
      errs.weightGrams = 'Valid positive weight in grams is required.';
    }
    if (!vals.jobStartDate) errs.jobStartDate = 'Job start date is required.';
    // Removed jobStartTime validation as it's optional in your form
    if (vals.totalPiecesInConcept && (isNaN(vals.totalPiecesInConcept) || Number(vals.totalPiecesInConcept) < 1)) {
        errs.totalPiecesInConcept = 'If provided, total pieces must be a positive number.';
    }
    return errs;
  }


  const isConceptualNameReadOnly = !!conceptualPartInfo;
  const modalTitle = conceptualPartInfo
    ? `Add New Piece to "${conceptualPartInfo.conceptualPartName}"`
    : 'Add New Conceptual Part & First Piece';

  return (
    <Modal show={show} onHide={handleLocalClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{modalTitle}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={(e) => handleSubmit(e, onSubmitApiCall)}>
        <Modal.Body>
          {/* InputFields... ensure 'name' prop matches keys in 'values' */}
          <InputField
            label="Conceptual Part Name"
            name="conceptualPartName"
            value={values.conceptualPartName || ''} // Ensure value is not undefined for controlled input
            onChange={handleChange}
            error={errors.conceptualPartName}
            isRequired
            readOnly={isConceptualNameReadOnly}
            placeholder={isConceptualNameReadOnly ? '' : "e.g., Hand, Left Wing"}
          />
          {/* ... other InputFields, make sure their 'value' prop is like values.fieldName || '' */}
           <Row>
            <Col md={6}>
              <InputField
                label="Piece ID / Machine Plate No."
                name="machinePlateNo"
                value={values.machinePlateNo || ''}
                onChange={handleChange}
                error={errors.machinePlateNo}
                isRequired
                placeholder="e.g., 1, Top, A-01"
              />
            </Col>
            <Col md={6}>
              <InputField
                label={`Total Pieces for "${values.conceptualPartName || 'this Part'}" (Optional)`}
                name="totalPiecesInConcept"
                type="number"
                min="1"
                value={values.totalPiecesInConcept || ''}
                onChange={handleChange}
                error={errors.totalPiecesInConcept}
                placeholder="e.g., 5"
              />
            </Col>
          </Row>
          <InputField
            label="Select Machine (Printer)"
            name="machineId"
            as="select"
            value={values.machineId || ''}
            onChange={handleChange}
            error={errors.machineId}
            isRequired
          >
            <option value="">-- Select Printer --</option>
            {availablePrinters.map(p => (
              <option key={p._id} value={p._id} disabled={p.status === 'maintenance'}>
                {p.name} ({p.model || 'N/A'} - {p.status})
              </option>
            ))}
          </InputField>
          <Row>
            <Col md={6}>
              <InputField
                label="Scheduled Print Time (for this piece)"
                name="printTimeScheduled"
                value={values.printTimeScheduled || ''}
                onChange={handleChange}
                error={errors.printTimeScheduled}
                placeholder="e.g., 2hrs 30min, 45min, 1day"
                isRequired
              />
            </Col>
            <Col md={6}>
              <InputField
                label="Weight (grams, for this piece)"
                type="number"
                name="weightGrams"
                value={values.weightGrams || ''}
                onChange={handleChange}
                error={errors.weightGrams}
                isRequired
                min="1"
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <InputField
                label="Job Start Date"
                type="date"
                name="jobStartDate"
                value={values.jobStartDate || ''}
                onChange={handleChange}
                error={errors.jobStartDate}
                isRequired
              />
            </Col>
            <Col md={6}>
              <InputField
                label="Job Start Time"
                name="jobStartTime"
                value={values.jobStartTime || ''}
                onChange={handleChange}
                error={errors.jobStartTime}
                placeholder="e.g., 08:00 PM"
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleLocalClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : 'Add Print Piece'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddPrintJobModal;