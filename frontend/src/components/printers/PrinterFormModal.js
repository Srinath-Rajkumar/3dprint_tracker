// frontend/src/components/printers/PrinterFormModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import useForm from '../../hooks/useForm';
import printerService from '../../services/printerService';
import InputField from '../common/InputField';
import { PRINTER_STATUS } from '../../utils/constants';

const PrinterFormModal = ({ show, handleClose, onSuccess, existingPrinter }) => {
  const initialValues = {
    name: '',
    company: '',
    model: '',
    buildSizeX: '',
    buildSizeY: '',
    buildSizeZ: '',
    status: PRINTER_STATUS.AVAILABLE,
    image: null,
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
  } = useForm(initialValues, validatePrinterForm);

  const [formError, setFormError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (existingPrinter) {
      setValues({
        name: existingPrinter.name || '',
        company: existingPrinter.company || '',
        model: existingPrinter.model || '',
        buildSizeX: existingPrinter.buildSize?.x || '',
        buildSizeY: existingPrinter.buildSize?.y || '',
        buildSizeZ: existingPrinter.buildSize?.z || '',
        status: existingPrinter.status || PRINTER_STATUS.AVAILABLE,
        image: null, // Don't pre-fill file input, show preview if image exists
      });
      if (existingPrinter.imagePath) {
        // Assuming imagePath is relative, construct full URL if needed for preview,
        // or just indicate an image exists. For simplicity, let's just show if one was there.
        // If your API serves images directly:
        // setImagePreview(`http://localhost:5001${existingPrinter.imagePath}`);
      }
    } else {
      resetForm();
    }
    setFormError(''); // Clear form error when modal opens or printer changes
    if (!show) setImagePreview(null); // Clear preview when modal closes
  }, [existingPrinter, show, resetForm, setValues]);

  const handleImageChange = (event) => {
    handleChange(event); // Let useForm handle setting the file in values.image
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const onSubmit = async () => {
    setFormError('');
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('company', values.company);
    formData.append('model', values.model);
    if (values.buildSizeX) formData.append('buildSizeX', values.buildSizeX);
    if (values.buildSizeY) formData.append('buildSizeY', values.buildSizeY);
    if (values.buildSizeZ) formData.append('buildSizeZ', values.buildSizeZ);
    formData.append('status', values.status);
    if (values.image) { // only append if a new image is selected
      formData.append('image', values.image);
    }

    try {
      if (existingPrinter) {
        await printerService.updatePrinter(existingPrinter._id, formData);
      } else {
        await printerService.createPrinter(formData);
      }
      onSuccess();
      handleLocalClose();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'An error occurred');
      setIsSubmitting(false);
    }
  };
  
  const handleLocalClose = () => {
      resetForm();
      setImagePreview(null);
      handleClose();
  }


  function validatePrinterForm(vals) {
    const errs = {};
    if (!vals.name.trim()) errs.name = 'Printer name is required.';
    // Add more validations as needed
    return errs;
  }

  return (
    <Modal show={show} onHide={handleLocalClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{existingPrinter ? 'Edit Printer' : 'Add New Printer'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={(e) => handleSubmit(e, onSubmit)}>
        <Modal.Body>
          {formError && <Alert variant="danger">{formError}</Alert>}
          <InputField
            label="Printer Name"
            name="name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
            isRequired
            placeholder="e.g., Prusa MK3S+"
          />
          <Row>
            <Col md={6}>
              <InputField
                label="Company"
                name="company"
                value={values.company}
                onChange={handleChange}
                placeholder="e.g., Prusa Research"
              />
            </Col>
            <Col md={6}>
              <InputField
                label="Model"
                name="model"
                value={values.model}
                onChange={handleChange}
                placeholder="e.g., Original MK3S+"
              />
            </Col>
          </Row>
          <Form.Label>Build Size (mm)</Form.Label>
          <Row>
            <Col>
              <InputField type="number" name="buildSizeX" value={values.buildSizeX} onChange={handleChange} placeholder="X (width)" />
            </Col>
            <Col>
              <InputField type="number" name="buildSizeY" value={values.buildSizeY} onChange={handleChange} placeholder="Y (depth)" />
            </Col>
            <Col>
              <InputField type="number" name="buildSizeZ" value={values.buildSizeZ} onChange={handleChange} placeholder="Z (height)" />
            </Col>
          </Row>
          <InputField
            label="Status"
            name="status"
            as="select"
            value={values.status}
            onChange={handleChange}
          >
            <option value={PRINTER_STATUS.AVAILABLE}>Available</option>
            <option value={PRINTER_STATUS.IN_PRODUCTION}>In Production</option>
            <option value={PRINTER_STATUS.MAINTENANCE}>Maintenance</option>
          </InputField>
          
          <Form.Group controlId="image" className="mb-3">
            <Form.Label>Printer Image (Optional)</Form.Label>
            <Form.Control type="file" name="image" onChange={handleImageChange} accept="image/png, image/jpeg, image/jpg" />
             {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxHeight: '150px', marginTop: '10px' }} />}
             {!imagePreview && existingPrinter && existingPrinter.imagePath && (
                <p className="mt-2 small text-muted">Current image: <a href={`http://localhost:5001${existingPrinter.imagePath}`} target="_blank" rel="noopener noreferrer">View</a>. Upload new to replace.</p>
             )}
          </Form.Group>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleLocalClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : (existingPrinter ? 'Save Changes' : 'Add Printer')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PrinterFormModal;