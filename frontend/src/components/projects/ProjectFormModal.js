// frontend/src/components/projects/ProjectFormModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import useForm from '../../hooks/useForm';
import projectService from '../../services/projectService';
import InputField from '../common/InputField';
import { PROJECT_STATUS } from '../../utils/constants';
import useAuth from '../../hooks/useAuth'; // To check if user is admin
import { formatDate } from '../../utils/helpers';
const ProjectFormModal = ({ show, handleClose, onSuccess, existingProject }) => {
  const { userInfo } = useAuth();
  const initialValues = {
    projectName: '',
    orderId: '',
    startDate: new Date().toISOString().split('T')[0], // Default to today
    endDate: '',
    status: PROJECT_STATUS.ONGOING,
  };

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setValues,
    setErrors, // if needed for direct error setting
    setIsSubmitting,
  } = useForm(initialValues, validateProjectForm);

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (existingProject) {
      setValues({
        projectName: existingProject.projectName || '',
        orderId: existingProject.orderId || '',
        startDate: existingProject.startDate ? new Date(existingProject.startDate).toISOString().split('T')[0] : '',
        endDate: existingProject.endDate ? new Date(existingProject.endDate).toISOString().split('T')[0] : '',
        status: existingProject.status || PROJECT_STATUS.ONGOING,
      });
    } else {
      resetForm(); // Reset to initial values for a new project
    }
    setFormError('');
  }, [existingProject, show, resetForm, setValues]);

  const onSubmit = async () => {
    setFormError('');
    // Convert empty endDate to null for the backend if status is not 'completed'
    const payload = {
        ...values,
        endDate: values.status === PROJECT_STATUS.COMPLETED && !values.endDate 
                    ? new Date().toISOString().split('T')[0] // Set to today if completed and no end date
                    : (values.endDate || null), // Send null if empty
    };


    try {
      if (existingProject) {
        await projectService.updateProject(existingProject._id, payload);
      } else {
        await projectService.createProject(payload);
      }
      onSuccess();
      handleLocalClose();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'An error occurred');
      setIsSubmitting(false); // Ensure isSubmitting is reset on error
    }
  };

  const handleLocalClose = () => {
    resetForm();
    handleClose();
  };

  function validateProjectForm(vals) {
    const errs = {};
    if (!vals.projectName.trim()) errs.projectName = 'Project name is required.';
    if (vals.startDate && vals.endDate && new Date(vals.endDate) < new Date(vals.startDate)) {
      errs.endDate = 'End date cannot be before start date.';
    }
    return errs;
  }

  return (
    <Modal show={show} onHide={handleLocalClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{existingProject ? 'Edit Project' : 'Add New Project'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={(e) => handleSubmit(e, onSubmit)}>
        <Modal.Body>
          {formError && <Alert variant="danger">{formError}</Alert>}
          <InputField
            label="Project Name"
            name="projectName"
            value={values.projectName}
            onChange={handleChange}
            error={errors.projectName}
            isRequired
            placeholder="e.g., Airport Miniature Model"
          />
          <InputField
            label="Order ID"
            name="orderId"
            value={values.orderId}
            onChange={handleChange}
            isRequired
            placeholder="e.g., CUST123-PROJECTX"
          />
          <InputField
            label="Start Date"
            type="date"
            name="startDate"
            value={values.startDate}
            onChange={handleChange}
            error={errors.startDate}
            isRequired
          />
          {/* Only Admin can change status and end date directly for existing projects */}
          {(userInfo?.role === 'admin' || !existingProject) && (
            <>
                <InputField
                    label="Status"
                    name="status"
                    as="select"
                    value={values.status}
                    onChange={handleChange}
                    >
                    <option value={PROJECT_STATUS.ONGOING}>Ongoing</option>
                    <option value={PROJECT_STATUS.COMPLETED}>Completed</option>
                    <option value={PROJECT_STATUS.CANCELLED}>Cancelled</option>
                </InputField>
                
                {values.status === PROJECT_STATUS.COMPLETED && (
                    <InputField
                        label="End Date"
                        type="date"
                        name="endDate"
                        value={values.endDate}
                        onChange={handleChange}
                        error={errors.endDate}
                    />
                )}
             </>
          )}
          {/* For regular users editing an existing project, status and end date might be read-only or handled differently */}
          {userInfo?.role !== 'admin' && existingProject && (
    <>
      <p><strong>Status:</strong> {existingProject.status}</p>
      {existingProject.endDate && <p><strong>End Date:</strong> {formatDate(existingProject.endDate)}</p>} {/* <<< Here */}
    </>
)}


        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleLocalClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : (existingProject ? 'Save Changes' : 'Add Project')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProjectFormModal;