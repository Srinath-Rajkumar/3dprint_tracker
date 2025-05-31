// frontend/src/components/admin/CostSettingsForm.js
import React from 'react';
import { Form, Button, Spinner, InputGroup } from 'react-bootstrap'; // Added InputGroup
import useForm from '../../hooks/useForm'; // Assuming you have this hook
import InputField from '../common/InputField'; // Assuming you have this

const CostSettingsForm = ({ initialSettings, onSave, isLoading }) => {
  const {
    values,
    errors,
    isSubmitting, // From useForm, can be used instead of isLoading prop if form handles it
    handleChange,
    handleSubmit,
    // setValues, // If needed to reset or update form programmatically
  } = useForm(
    {
      pricePerMinute: initialSettings?.pricePerMinute || 0,
      pricePerGramFilament: initialSettings?.pricePerGramFilament || 0,
    },
    validateForm // Validation function defined below
  );

  function validateForm(vals) {
    const errs = {};
    if (vals.pricePerMinute === undefined || isNaN(vals.pricePerMinute) || Number(vals.pricePerMinute) < 0) {
      errs.pricePerMinute = 'Price per minute must be a non-negative number.';
    }
    if (vals.pricePerGramFilament === undefined || isNaN(vals.pricePerGramFilament) || Number(vals.pricePerGramFilament) < 0) {
      errs.pricePerGramFilament = 'Price per gram must be a non-negative number.';
    }
    return errs;
  }

  const handleFormSubmit = async () => {
    // Convert values to numbers before sending
    const settingsData = {
      pricePerMinute: Number(values.pricePerMinute),
      pricePerGramFilament: Number(values.pricePerGramFilament),
    };
    await onSave(settingsData);
  };

  return (
    <Form onSubmit={(e) => handleSubmit(e, handleFormSubmit)}>
      <Form.Group className="mb-3" controlId="pricePerMinute">
        <Form.Label>Price per Minute (₹)</Form.Label>
        <InputGroup>
          <InputGroup.Text>₹</InputGroup.Text>
          <Form.Control
            type="number"
            name="pricePerMinute"
            value={values.pricePerMinute}
            onChange={handleChange}
            isInvalid={!!errors.pricePerMinute}
            step="0.01" // Allow cents/paise
            min="0"
            placeholder="e.g., 2.50"
          />
        </InputGroup>
        {errors.pricePerMinute && <Form.Text className="text-danger">{errors.pricePerMinute}</Form.Text>}
      </Form.Group>

      <Form.Group className="mb-3" controlId="pricePerGramFilament">
        <Form.Label>Price per Gram of Filament (₹)</Form.Label>
        <InputGroup>
          <InputGroup.Text>₹</InputGroup.Text>
          <Form.Control
            type="number"
            name="pricePerGramFilament"
            value={values.pricePerGramFilament}
            onChange={handleChange}
            isInvalid={!!errors.pricePerGramFilament}
            step="0.01"
            min="0"
            placeholder="e.g., 5.00"
          />
        </InputGroup>
        {errors.pricePerGramFilament && <Form.Text className="text-danger">{errors.pricePerGramFilament}</Form.Text>}
      </Form.Group>

      <Button type="submit" variant="primary" disabled={isSubmitting || isLoading}>
        {isSubmitting || isLoading ? (
          <>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            <span className="ms-2">Saving...</span>
          </>
        ) : (
          'Save Settings'
        )}
      </Button>
    </Form>
  );
};

export default CostSettingsForm;