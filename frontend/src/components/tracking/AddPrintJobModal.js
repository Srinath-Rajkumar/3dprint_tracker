// // frontend/src/components/tracking/AddPrintJobModal.js
// import React, { useState } from 'react';
// import { Modal, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
// import useForm from '../../hooks/useForm';
// import trackingService from '../../services/trackingService';
// import InputField from '../common/InputField';
// import { parseDurationToSeconds } from '../../utils/helpers'; // Helper for time string

// const AddPrintJobModal = ({ show, handleClose, projectId, onSuccess, availablePrinters }) => {
//   const initialValues = {
//     partName: '',
//     machinePlateNo: '',
//     machineId: '',
//     printTimeScheduled: '', // e.g., "2days 3hrs 30min"
//     weightGrams: '',
//     jobStartDate: new Date().toISOString().split('T')[0],
//     jobStartTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase(),
//   };

//   const {
//     values,
//     errors,
//     isSubmitting,
//     handleChange,
//     handleSubmit,
//     resetForm,
//     setErrors,
//     setIsSubmitting,
//   } = useForm(initialValues, validatePrintJobForm);

//   const [formError, setFormError] = useState('');

//   const onSubmit = async () => {
//     setFormError('');
//     const jobData = {
//       ...values,
//       weightGrams: Number(values.weightGrams),
//       // printTimeScheduledSeconds is handled in backend based on printTimeScheduled string
//     };

//     try {
//       await trackingService.addPrintJob(projectId, jobData);
//       onSuccess();
//       handleLocalClose();
//     } catch (err) {
//       setFormError(err.response?.data?.message || err.message || 'Failed to add print job');
//       setIsSubmitting(false);
//     }
//   };

//   const handleLocalClose = () => {
//     resetForm();
//     setFormError('');
//     handleClose();
//   };

//   function validatePrintJobForm(vals) {
//     const errs = {};
//     if (!vals.partName.trim()) errs.partName = 'Part name is required.';
//     if (!vals.machineId) errs.machineId = 'Machine selection is required.';
//     if (!vals.printTimeScheduled.trim()) {
//         errs.printTimeScheduled = 'Scheduled print time is required.';
//     } else if (isNaN(parseDurationToSeconds(vals.printTimeScheduled)) || parseDurationToSeconds(vals.printTimeScheduled) <=0) {
//         errs.printTimeScheduled = 'Invalid print time format (e.g., "2hr 30min", "1day").';
//     }
//     if (!vals.weightGrams || isNaN(vals.weightGrams) || Number(vals.weightGrams) <= 0) {
//       errs.weightGrams = 'Valid weight in grams is required.';
//     }
//     if (!vals.jobStartDate) errs.jobStartDate = 'Job start date is required.';
//     return errs;
//   }

//   return (
//     <Modal show={show} onHide={handleLocalClose} size="lg" backdrop="static">
//       <Modal.Header closeButton>
//         <Modal.Title>Add New Part / Print Job</Modal.Title>
//       </Modal.Header>
//       <Form onSubmit={(e) => handleSubmit(e, onSubmit)}>
//         <Modal.Body>
//           {formError && <Alert variant="danger">{formError}</Alert>}
//           <InputField
//             label="Part Name"
//             name="partName"
//             value={values.partName}
//             onChange={handleChange}
//             error={errors.partName}
//             isRequired
//           />
//           <Row>
//             <Col md={6}>
//               <InputField
//                 label="Machine Plate No. (Optional)"
//                 name="machinePlateNo"
//                 value={values.machinePlateNo}
//                 onChange={handleChange}
//               />
//             </Col>
//             <Col md={6}>
//               <InputField
//                 label="Select Machine (Printer)"
//                 name="machineId"
//                 as="select"
//                 value={values.machineId}
//                 onChange={handleChange}
//                 error={errors.machineId}
//                 isRequired
//               >
//                 <option value="">-- Select Printer --</option>
//                 {availablePrinters.map(p => (
//                   <option key={p._id} value={p._id} disabled={p.status === 'maintenance'}>
//                     {p.name} ({p.status})
//                   </option>
//                 ))}
//               </InputField>
//             </Col>
//           </Row>
//           <Row>
//             <Col md={6}>
//               <InputField
//                 label="Scheduled Print Time"
//                 name="printTimeScheduled"
//                 value={values.printTimeScheduled}
//                 onChange={handleChange}
//                 error={errors.printTimeScheduled}
//                 placeholder="e.g., 1day 2hrs 30min or 4hr or 45min"
//                 isRequired
//               />
//             </Col>
//             <Col md={6}>
//               <InputField
//                 label="Weight (grams)"
//                 type="number"
//                 name="weightGrams"
//                 value={values.weightGrams}
//                 onChange={handleChange}
//                 error={errors.weightGrams}
//                 isRequired
//               />
//             </Col>
//           </Row>
//           <Row>
//             <Col md={6}>
//               <InputField
//                 label="Job Start Date"
//                 type="date"
//                 name="jobStartDate"
//                 value={values.jobStartDate}
//                 onChange={handleChange}
//                 error={errors.jobStartDate}
//                 isRequired
//               />
//             </Col>
//             <Col md={6}>
//               <InputField
//                 label="Job Start Time (Optional)"
//                 name="jobStartTime"
//                 value={values.jobStartTime}
//                 onChange={handleChange}
//                 placeholder="e.g., 08:00pm"
//               />
//             </Col>
//           </Row>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleLocalClose} disabled={isSubmitting}>
//             Cancel
//           </Button>
//           <Button type="submit" variant="primary" disabled={isSubmitting}>
//             {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : 'Add Print Job'}
//           </Button>
//         </Modal.Footer>
//       </Form>
//     </Modal>
//   );
// };

// export default AddPrintJobModal;
// frontend/src/components/tracking/AddPrintJobModal.js
import React from 'react'; // Removed useState as formError handled by useForm now
import { Modal, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import useForm from '../../hooks/useForm';
import trackingService from '../../services/trackingService';
import InputField from '../common/InputField';
import { parseDurationToSeconds } from '../../utils/helpers';

const AddPrintJobModal = ({ show, handleClose, projectId, onSuccess, availablePrinters }) => {
  const initialValues = {
    conceptualPartName: '', // Changed from partName
    machinePlateNo: '',
    machineId: '',
    printTimeScheduled: '',
    weightGrams: '',
    jobStartDate: new Date().toISOString().split('T')[0],
    jobStartTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase(),
    totalPiecesInConcept: '', // Optional field
  };

  const {
    values,
    errors, // useForm now handles form-level errors via validate function
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    // setErrors, // Not directly setting formError state anymore
    setIsSubmitting,
  } = useForm(initialValues, validatePrintJobForm);

  // const [formError, setFormError] = useState(''); // Can be removed if errors object from useForm is sufficient

  const onSubmit = async () => {
    // setFormError(''); // useForm's errors will be used
    const jobData = {
      conceptualPartName: values.conceptualPartName,
      machinePlateNo: values.machinePlateNo,
      machineId: values.machineId,
      printTimeScheduled: values.printTimeScheduled, // Backend will parse this
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
      // If API returns an error, it might be useful to set it to a general form error
      // Or expect validate function to catch most things, and API errors are for server issues
      // For now, let's assume errors object from useForm handles field validation errors
      // and API call errors are handled by the generic error display in TrackingSheetFDM
      console.error("Add Print Job API Error:", err);
      alert(err.response?.data?.message || err.message || 'Failed to add print job. Check console.'); // Simple alert for API errors
      setIsSubmitting(false); // Ensure button is re-enabled
    }
  };

  const handleLocalClose = () => {
    resetForm();
    // setFormError('');
    handleClose();
  };

  function validatePrintJobForm(vals) {
    const errs = {};
    if (!vals.conceptualPartName.trim()) errs.conceptualPartName = 'Conceptual Part Name (e.g., Hand) is required.';
    if (!vals.machinePlateNo.trim()) errs.machinePlateNo = 'Machine Plate No./Piece ID is required.';
    if (!vals.machineId) errs.machineId = 'Machine selection is required.';
    if (!vals.printTimeScheduled.trim()) {
        errs.printTimeScheduled = 'Scheduled print time is required.';
    } else if (isNaN(parseDurationToSeconds(vals.printTimeScheduled)) || parseDurationToSeconds(vals.printTimeScheduled) <=0) {
        errs.printTimeScheduled = 'Invalid print time format (e.g., "2hr 30min", "1day").';
    }
    if (!vals.weightGrams || isNaN(vals.weightGrams) || Number(vals.weightGrams) <= 0) {
      errs.weightGrams = 'Valid weight in grams is required.';
    }
    if (!vals.jobStartDate) errs.jobStartDate = 'Job start date is required.';
    if (vals.totalPiecesInConcept && (isNaN(vals.totalPiecesInConcept) || Number(vals.totalPiecesInConcept) < 1)) {
        errs.totalPiecesInConcept = 'If provided, total pieces must be a positive number.';
    }
    return errs;
  }

  return (
    <Modal show={show} onHide={handleLocalClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Add New Print Piece</Modal.Title>
      </Modal.Header>
      <Form onSubmit={(e) => handleSubmit(e, onSubmit)}> {/* handleSubmit from useForm now handles setErrors */}
        <Modal.Body>
          {/* If you want a general form error display separate from field errors: */}
          {/* {errors._form && <Alert variant="danger">{errors._form}</Alert>} */}
          <InputField
            label="Conceptual Part Name (e.g., Hand, Left Wing)"
            name="conceptualPartName" // Changed name
            value={values.conceptualPartName}
            onChange={handleChange}
            error={errors.conceptualPartName}
            isRequired
          />
          <Row>
            <Col md={6}>
              <InputField
                label="Machine Plate No. / Piece ID (e.g., 1, 2, Top, Bottom)"
                name="machinePlateNo"
                value={values.machinePlateNo}
                onChange={handleChange}
                error={errors.machinePlateNo}
                isRequired
              />
            </Col>
            <Col md={6}>
              <InputField
                label="Total Pieces for this Conceptual Part (Optional)"
                name="totalPiecesInConcept"
                type="number"
                min="1"
                value={values.totalPiecesInConcept}
                onChange={handleChange}
                error={errors.totalPiecesInConcept}
                placeholder="e.g., 5 if 'Hand' has 5 pieces"
              />
            </Col>
          </Row>
          <InputField
            label="Select Machine (Printer)"
            name="machineId"
            as="select"
            value={values.machineId}
            onChange={handleChange}
            error={errors.machineId}
            isRequired
          >
            <option value="">-- Select Printer --</option>
            {availablePrinters.map(p => (
              <option key={p._id} value={p._id} disabled={p.status === 'maintenance'}>
                {p.name} ({p.model} - {p.status})
              </option>
            ))}
          </InputField>
          <Row>
            <Col md={6}>
              <InputField
                label="Scheduled Print Time (for this piece)"
                name="printTimeScheduled"
                value={values.printTimeScheduled}
                onChange={handleChange}
                error={errors.printTimeScheduled}
                placeholder="e.g., 2hrs 30min or 45min"
                isRequired
              />
            </Col>
            <Col md={6}>
              <InputField
                label="Weight (grams, for this piece)"
                type="number"
                name="weightGrams"
                value={values.weightGrams}
                onChange={handleChange}
                error={errors.weightGrams}
                isRequired
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <InputField
                label="Job Start Date"
                type="date"
                name="jobStartDate"
                value={values.jobStartDate}
                onChange={handleChange}
                error={errors.jobStartDate}
                isRequired
              />
            </Col>
            <Col md={6}>
              <InputField
                label="Job Start Time (Optional)"
                name="jobStartTime"
                value={values.jobStartTime}
                onChange={handleChange}
                placeholder="e.g., 08:00pm"
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