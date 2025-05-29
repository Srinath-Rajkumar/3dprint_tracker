// // frontend/src/components/tracking/EditPrintJobModal.js
// import React, { useState, useEffect } from 'react';
// import { Modal, Form, Button, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
// import useForm from '../../hooks/useForm';
// import trackingService from '../../services/trackingService';
// import InputField from '../common/InputField';
// import { PRINT_JOB_STATUS } from '../../utils/constants';
// import { formatDurationFromSeconds, parseDurationToSeconds } from '../../utils/helpers';

// const EditPrintJobModal = ({ show, handleClose, job, onSuccess, availablePrinters, projectId }) => {
//   const initialValues = {
//     status: job?.status || '',
//     actualPrintTime: job?.actualPrintTimeSeconds ? formatDurationFromSeconds(job.actualPrintTimeSeconds) : '',
//     failReason: job?.failReason || '',
//     // For re-print section
//     newMachineId: '',
//     newPrintTimeScheduled: job?.printTimeScheduledSeconds ? formatDurationFromSeconds(job.printTimeScheduledSeconds) : '',
//     newJobStartDate: new Date().toISOString().split('T')[0],
//     newJobStartTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase(),
//     newMachinePlateNo: job?.machinePlateNo || '',
//   };

//   const {
//     values,
//     errors,
//     isSubmitting,
//     handleChange,
//     handleSubmit,
//     resetForm,
//     setValues,
//     setErrors,
//     setIsSubmitting,
//   } = useForm(initialValues, validateEditForm);

//   const [formError, setFormError] = useState('');
//   const [showReprintSection, setShowReprintSection] = useState(false);

//   useEffect(() => {
//     if (job) {
//       setValues({
//         status: job.status || '',
//         actualPrintTime: job.actualPrintTimeSeconds ? formatDurationFromSeconds(job.actualPrintTimeSeconds) : 
//                          (job.status === PRINT_JOB_STATUS.COMPLETED ? formatDurationFromSeconds(job.printTimeScheduledSeconds) : ''), // Default to scheduled if completed and no actual
//         failReason: job.failReason || '',
//         newMachineId: '', // Reset reprint fields
//         newPrintTimeScheduled: formatDurationFromSeconds(job.printTimeScheduledSeconds),
//         newJobStartDate: new Date().toISOString().split('T')[0],
//         newJobStartTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12:true }).toLowerCase(),
//         newMachinePlateNo: job.machinePlateNo || '',
//       });
//       setShowReprintSection(false); // Hide reprint section initially
//     }
//     setFormError('');
//   }, [job, show, setValues]);

//   const onSubmitStatusUpdate = async () => {
//     setFormError('');
//     const updateData = {
//       status: values.status,
//       failReason: values.status === PRINT_JOB_STATUS.FAILED ? values.failReason : undefined,
//       actualPrintTime: (values.status === PRINT_JOB_STATUS.COMPLETED || values.status === PRINT_JOB_STATUS.FAILED) ? values.actualPrintTime : undefined,
//     };

//     try {
//       await trackingService.updatePrintJob(job._id, updateData);
//       onSuccess();
//       handleLocalClose();
//     } catch (err) {
//       setFormError(err.response?.data?.message || err.message || 'Failed to update job status');
//       setIsSubmitting(false);
//     }
//   };

//   const onSubmitReprint = async () => {
//     setFormError('');
//     const reprintData = {
//       newMachineId: values.newMachineId,
//       newPrintTimeScheduled: values.newPrintTimeScheduled,
//       newJobStartDate: values.newJobStartDate,
//       newJobStartTime: values.newJobStartTime,
//       newMachinePlateNo: values.newMachinePlateNo,
//     };
//     try {
//         await trackingService.reprintFailedJob(job._id, reprintData);
//         onSuccess();
//         handleLocalClose();
//     } catch (err) {
//         setFormError(err.response?.data?.message || err.message || 'Failed to submit reprint job');
//         setIsSubmitting(false);
//     }
//   };

//   const handleLocalClose = () => {
//     resetForm();
//     setShowReprintSection(false);
//     handleClose();
//   };

//   function validateEditForm(vals) {
//     const errs = {};
//     if (vals.status === PRINT_JOB_STATUS.FAILED && !vals.failReason.trim() && !showReprintSection) {
//       errs.failReason = 'Reason for failure is required if not reprinting immediately.';
//     }
//     if ((vals.status === PRINT_JOB_STATUS.COMPLETED || vals.status === PRINT_JOB_STATUS.FAILED) && vals.actualPrintTime) {
//         if(isNaN(parseDurationToSeconds(vals.actualPrintTime)) || parseDurationToSeconds(vals.actualPrintTime) < 0) {
//             errs.actualPrintTime = 'Invalid actual print time format.';
//         }
//     }
//     // Reprint validation
//     if(showReprintSection) {
//         if(!vals.newMachineId) errs.newMachineId = "New machine is required for reprint.";
//         if(!vals.newPrintTimeScheduled.trim()) errs.newPrintTimeScheduled = "Scheduled time for reprint is required.";
//         else if(isNaN(parseDurationToSeconds(vals.newPrintTimeScheduled)) || parseDurationToSeconds(vals.newPrintTimeScheduled) <=0) {
//              errs.newPrintTimeScheduled = 'Invalid print time format for reprint.';
//         }
//         if(!vals.newJobStartDate) errs.newJobStartDate = "Start date for reprint is required.";
//     }
//     return errs;
//   }

//   const currentActionSubmit = showReprintSection ? onSubmitReprint : onSubmitStatusUpdate;

//   return (
//     <Modal show={show} onHide={handleLocalClose} size="lg" backdrop="static">
//       <Modal.Header closeButton>
//         <Modal.Title>Edit Print Job: {job?.partName} {job?.isReprint && <Badge bg="warning" text="dark" pill>Reprint</Badge>}</Modal.Title>
//       </Modal.Header>
//       <Form onSubmit={(e) => handleSubmit(e, currentActionSubmit)}>
//         <Modal.Body>
//           {formError && <Alert variant="danger">{formError}</Alert>}
          
//           {!showReprintSection && (
//             <>
//               <p><strong>Original Machine:</strong> {job?.machine?.name}</p>
//               <p><strong>Scheduled Time:</strong> {formatDurationFromSeconds(job?.printTimeScheduledSeconds)}</p>
              
//               <InputField
//                 label="Status"
//                 name="status"
//                 as="select"
//                 value={values.status}
//                 onChange={handleChange}
//               >
//                 <option value={PRINT_JOB_STATUS.PRINTING}>Printing</option>
//                 <option value={PRINT_JOB_STATUS.COMPLETED}>Completed</option>
//                 <option value={PRINT_JOB_STATUS.FAILED}>Failed</option>
//               </InputField>

//               {(values.status === PRINT_JOB_STATUS.COMPLETED || values.status === PRINT_JOB_STATUS.FAILED) && (
//                 <InputField
//                   label="Actual Print Time (Optional)"
//                   name="actualPrintTime"
//                   value={values.actualPrintTime}
//                   onChange={handleChange}
//                   placeholder="e.g., 2hrs 15min. If blank, scheduled time is used for 'Completed'."
//                   error={errors.actualPrintTime}
//                 />
//               )}

//               {values.status === PRINT_JOB_STATUS.FAILED && (
//                 <InputField
//                   label="Reason for Failure"
//                   name="failReason"
//                   as="textarea"
//                   rows={3}
//                   value={values.failReason}
//                   onChange={handleChange}
//                   error={errors.failReason}
//                 />
//               )}
//             </>
//           )}

//           {job?.status === PRINT_JOB_STATUS.FAILED && !showReprintSection && (
//             <Button variant="warning" className="mt-3 mb-2" onClick={() => setShowReprintSection(true)}>
//               Re-print This Part
//             </Button>
//           )}

//           {showReprintSection && (
//             <>
//               <hr/>
//               <h5 className="mb-3">Re-print Configuration for "{job?.partName}"</h5>
//                <InputField
//                 label="Select New Machine"
//                 name="newMachineId"
//                 as="select"
//                 value={values.newMachineId}
//                 onChange={handleChange}
//                 error={errors.newMachineId}
//                 isRequired
//               >
//                 <option value="">-- Select Printer --</option>
//                 {availablePrinters.map(p => (
//                   <option key={p._id} value={p._id} disabled={p.status === 'maintenance'}>
//                     {p.name} ({p.status})
//                   </option>
//                 ))}
//               </InputField>
//               <InputField
//                 label="New Machine Plate No. (Optional)"
//                 name="newMachinePlateNo"
//                 value={values.newMachinePlateNo}
//                 onChange={handleChange}
//               />
//                <InputField
//                 label="Scheduled Print Time for Re-print"
//                 name="newPrintTimeScheduled"
//                 value={values.newPrintTimeScheduled}
//                 onChange={handleChange}
//                 error={errors.newPrintTimeScheduled}
//                 isRequired
//               />
//               <Row>
//                 <Col md={6}>
//                     <InputField
//                         label="Re-print Start Date"
//                         type="date"
//                         name="newJobStartDate"
//                         value={values.newJobStartDate}
//                         onChange={handleChange}
//                         error={errors.newJobStartDate}
//                         isRequired
//                     />
//                 </Col>
//                 <Col md={6}>
//                     <InputField
//                         label="Re-print Start Time (Optional)"
//                         name="newJobStartTime"
//                         value={values.newJobStartTime}
//                         onChange={handleChange}
//                     />
//                 </Col>
//               </Row>
//               <Button variant="outline-secondary" className="mt-2" onClick={() => setShowReprintSection(false)}>
//                 Cancel Re-print
//               </Button>
//             </>
//           )}

//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleLocalClose} disabled={isSubmitting}>
//             Cancel
//           </Button>
//           <Button type="submit" variant="primary" disabled={isSubmitting}>
//             {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : (showReprintSection ? 'Submit Re-print Job' : 'Save Changes')}
//           </Button>
//         </Modal.Footer>
//       </Form>
//     </Modal>
//   );
// };

// export default EditPrintJobModal;
// frontend/src/components/tracking/EditPrintJobModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import useForm from '../../hooks/useForm';
import trackingService from '../../services/trackingService';
import InputField from '../common/InputField';
import { PRINT_JOB_STATUS } from '../../utils/constants';
import { formatDurationFromSeconds, parseDurationToSeconds } from '../../utils/helpers';

const EditPrintJobModal = ({ show, handleClose, job, onSuccess, availablePrinters, projectId }) => {
  const initialValues = {
    status: job?.status || '',
    actualPrintTime: job?.actualPrintTimeSeconds ? formatDurationFromSeconds(job.actualPrintTimeSeconds) : '',
    failReason: job?.failReason || '',
    // For re-print section
    newMachineId: '',
    newPrintTimeScheduled: job?.printTimeScheduledSeconds ? formatDurationFromSeconds(job.printTimeScheduledSeconds) : '',
    newJobStartDate: new Date().toISOString().split('T')[0],
    newJobStartTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase(),
    newMachinePlateNo: job?.machinePlateNo || '',
  };

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setValues,
    setErrors,
    setIsSubmitting,
  } = useForm(initialValues, validateEditForm);

  const [formError, setFormError] = useState('');
  const [showReprintSection, setShowReprintSection] = useState(false);

  useEffect(() => {
    if (job) {
      setValues({
        status: job.status || '',
        actualPrintTime: job.actualPrintTimeSeconds ? formatDurationFromSeconds(job.actualPrintTimeSeconds) : 
                         (job.status === PRINT_JOB_STATUS.COMPLETED ? formatDurationFromSeconds(job.printTimeScheduledSeconds) : ''),
        failReason: job.failReason || '',
        // For re-print section (these refer to the NEW print job)
        newMachineId: '',
        newPrintTimeScheduled: formatDurationFromSeconds(job.printTimeScheduledSeconds), // Default to original piece's time
        newJobStartDate: new Date().toISOString().split('T')[0],
        newJobStartTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12:true }).toLowerCase(),
        newMachinePlateNoOverride: job.machinePlateNo, // Default to original piece's identifier
      });
      setShowReprintSection(false);
    }
    setFormError('');
  }, [job, show, setValues]);

  const onSubmitStatusUpdate = async () => {
    setFormError('');
    const updateData = {
      status: values.status,
      failReason: values.status === PRINT_JOB_STATUS.FAILED ? values.failReason : undefined,
      actualPrintTime: (values.status === PRINT_JOB_STATUS.COMPLETED || values.status === PRINT_JOB_STATUS.FAILED) ? values.actualPrintTime : undefined,
    };

    try {
      await trackingService.updatePrintJob(job._id, updateData);
      onSuccess();
      handleLocalClose();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to update job status');
      setIsSubmitting(false);
    }
  };

  const onSubmitReprint = async () => {
    setFormError('');
    const reprintData = {
      newMachineId: values.newMachineId,
      newPrintTimeScheduled: values.newPrintTimeScheduled,
      newJobStartDate: values.newJobStartDate,
      newJobStartTime: values.newJobStartTime,
      newMachinePlateNo: values.newMachinePlateNo,
    };
    try {
        await trackingService.reprintFailedJob(job._id, reprintData);
        onSuccess();
        handleLocalClose();
    } catch (err) {
        setFormError(err.response?.data?.message || err.message || 'Failed to submit reprint job');
        setIsSubmitting(false);
    }
  };

  const handleLocalClose = () => {
    resetForm();
    setShowReprintSection(false);
    handleClose();
  };

  function validateEditForm(vals) {
    const errs = {};
    if (vals.status === PRINT_JOB_STATUS.FAILED && !vals.failReason.trim() && !showReprintSection) {
      errs.failReason = 'Reason for failure is required if not reprinting immediately.';
    }
    if ((vals.status === PRINT_JOB_STATUS.COMPLETED || vals.status === PRINT_JOB_STATUS.FAILED) && vals.actualPrintTime) {
        if(isNaN(parseDurationToSeconds(vals.actualPrintTime)) || parseDurationToSeconds(vals.actualPrintTime) < 0) {
            errs.actualPrintTime = 'Invalid actual print time format.';
        }
    }
    // Reprint validation
    if(showReprintSection) {
        if(!vals.newMachineId) errs.newMachineId = "New machine is required for reprint.";
        if(!vals.newPrintTimeScheduled.trim()) errs.newPrintTimeScheduled = "Scheduled time for reprint is required.";
        else if(isNaN(parseDurationToSeconds(vals.newPrintTimeScheduled)) || parseDurationToSeconds(vals.newPrintTimeScheduled) <=0) {
             errs.newPrintTimeScheduled = 'Invalid print time format for reprint.';
        }
        if(!vals.newJobStartDate) errs.newJobStartDate = "Start date for reprint is required.";
    }
    return errs;
  }

  const currentActionSubmit = showReprintSection ? onSubmitReprint : onSubmitStatusUpdate;

  return (
    <Modal show={show} onHide={handleLocalClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
      <Modal.Title>
            Edit Print Piece: {job?.part?.conceptualPartName} - Piece: {job?.machinePlateNo}
            {job?.isReprint && <Badge bg="warning" text="dark" pill>Reprint</Badge>}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={(e) => handleSubmit(e, currentActionSubmit)}>
        <Modal.Body>
          {formError && <Alert variant="danger">{formError}</Alert>}
          
          {!showReprintSection && (
            <>
                <p><strong>Conceptual Part:</strong> {job?.part?.conceptualPartName}</p>
              <p><strong>Piece Identifier (Plate No.):</strong> {job?.machinePlateNo}</p>
              
              <InputField
                label="Status"
                name="status"
                as="select"
                value={values.status}
                onChange={handleChange}
              >
                <option value={PRINT_JOB_STATUS.PRINTING}>Printing</option>
                <option value={PRINT_JOB_STATUS.COMPLETED}>Completed</option>
                <option value={PRINT_JOB_STATUS.FAILED}>Failed</option>
              </InputField>

              {(values.status === PRINT_JOB_STATUS.COMPLETED || values.status === PRINT_JOB_STATUS.FAILED) && (
                <InputField
                  label="Actual Print Time (Optional)"
                  name="actualPrintTime"
                  value={values.actualPrintTime}
                  onChange={handleChange}
                  placeholder="e.g., 2hrs 15min. If blank, scheduled time is used for 'Completed'."
                  error={errors.actualPrintTime}
                />
              )}

              {values.status === PRINT_JOB_STATUS.FAILED && (
                <InputField
                  label="Reason for Failure"
                  name="failReason"
                  as="textarea"
                  rows={3}
                  value={values.failReason}
                  onChange={handleChange}
                  error={errors.failReason}
                />
              )}
            </>
          )}

          {job?.status === PRINT_JOB_STATUS.FAILED && !showReprintSection && (
            <Button variant="warning" className="mt-3 mb-2" onClick={() => setShowReprintSection(true)}>
              Re-print This Part
            </Button>
          )}

          {showReprintSection && (
            <>
              <hr/>
              <h5 className="mb-3">Re-print Configuration for "{job?.partName}"</h5>
               <InputField
                label="Select New Machine"
                name="newMachineId"
                as="select"
                value={values.newMachineId}
                onChange={handleChange}
                error={errors.newMachineId}
                isRequired
              >
          
                <option value="">-- Select Printer --</option>
                {availablePrinters.map(p => (
                  <option key={p._id} value={p._id} disabled={p.status === 'maintenance'}>
                    {p.name} ({p.status})
                  </option>
                ))}
              </InputField>
              <InputField
                label="New Machine Plate No. (Optional)"
                name="newMachinePlateNo"
                value={values.newMachinePlateNo}
                onChange={handleChange}
              />
               <InputField
                label="Scheduled Print Time for Re-print"
                name="newPrintTimeScheduled"
                value={values.newPrintTimeScheduled}
                onChange={handleChange}
                error={errors.newPrintTimeScheduled}
                isRequired
              />
              <Row>
                <Col md={6}>
                    <InputField
                        label="Re-print Start Date"
                        type="date"
                        name="newJobStartDate"
                        value={values.newJobStartDate}
                        onChange={handleChange}
                        error={errors.newJobStartDate}
                        isRequired
                    />
                </Col>
                <Col md={6}>
                    <InputField
                        label="Re-print Start Time (Optional)"
                        name="newJobStartTime"
                        value={values.newJobStartTime}
                        onChange={handleChange}
                    />
                </Col>
              </Row>
              <Button variant="outline-secondary" className="mt-2" onClick={() => setShowReprintSection(false)}>
                Cancel Re-print
              </Button>
            </>
          )}

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleLocalClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : (showReprintSection ? 'Submit Re-print Job' : 'Save Changes')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditPrintJobModal;