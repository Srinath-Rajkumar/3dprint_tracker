// frontend/src/components/admin/CostSettingsForm.js
import React, { useEffect } from 'react';
import { Form, Button, Spinner, InputGroup } from 'react-bootstrap';
import useForm from '../../hooks/useForm';
import InputField from '../common/InputField';

const CostSettingsForm = ({ initialSettings, onSave, isLoading }) => {
  const defaultValues = {
    pricePerMinute: 0.10,
    pricePerGramFilament: 0.05,
  };

  const {
    values,
    errors,
    isSubmitting, // We'll use the passed `isLoading` prop for the button
    handleChange,
    handleSubmit,
    resetForm,
    setValues,
  } = useForm(initialSettings || defaultValues, validateCostSettings);

  useEffect(() => {
    if (initialSettings) {
      setValues(initialSettings);
    } else {
      resetForm(defaultValues); // Reset to defaults if initialSettings is null/undefined
    }
  }, [initialSettings, setValues, resetForm]);


  const handleFormSubmit = async () => {
    await onSave({
        pricePerMinute: parseFloat(values.pricePerMinute),
        pricePerGramFilament: parseFloat(values.pricePerGramFilament),
    });
  };

  function validateCostSettings(vals) {
    const errs = {};
    if (vals.pricePerMinute === '' || isNaN(parseFloat(vals.pricePerMinute)) || parseFloat(vals.pricePerMinute) < 0) {
      errs.pricePerMinute = 'Valid price per minute is required (e.g., 0.10).';
    }
    if (vals.pricePerGramFilament === '' || isNaN(parseFloat(vals.pricePerGramFilament)) || parseFloat(vals.pricePerGramFilament) < 0) {
      errs.pricePerGramFilament = 'Valid price per gram of filament is required (e.g., 0.05).';
    }
    return errs;
  }

  return (
    <Form onSubmit={(e) => handleSubmit(e, handleFormSubmit)}>
      <InputField
        label="Price per Minute of Print Time"
        name="pricePerMinute"
        type="number"
        value={values.pricePerMinute}
        onChange={handleChange}
        error={errors.pricePerMinute}
        step="0.01"
        min="0"
        prependText="$"
        isRequired
      />
       <InputField
        label="Price per Gram of Filament"
        name="pricePerGramFilament"
        type="number"
        value={values.pricePerGramFilament}
        onChange={handleChange}
        error={errors.pricePerGramFilament}
        step="0.001" // Allow for finer granularity if needed
        min="0"
        prependText="$"
        isRequired
      />

      <Button type="submit" variant="primary" className="mt-3" disabled={isLoading}>
        {isLoading ? <Spinner as="span" animation="border" size="sm" /> : 'Save Settings'}
      </Button>
    </Form>
  );
};

// Update InputField to handle prependText
// frontend/src/components/common/InputField.js (Add prependText prop)
/*
const InputField = ({ ..., prependText, ... }) => {
  return (
    <Form.Group controlId={name} className="mb-3">
      {label && <Form.Label>{label}{isRequired && <span className="text-danger">*</span>}</Form.Label>}
      {prependText ? (
        <InputGroup>
          <InputGroup.Text>{prependText}</InputGroup.Text>
          <Form.Control ... />
          {error && <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>{error}</Form.Control.Feedback>}
        </InputGroup>
      ) : (
        <>
          <Form.Control ... />
          {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
        </>
      )}
    </Form.Group>
  );
};
*/
// For simplicity, I'll assume InputField is already updated or you'll update it.
// If InputField doesn't support InputGroup directly, you might need to wrap it or adjust.
// A simpler way for CostSettingsForm if InputField doesn't support InputGroup:
/*
// In CostSettingsForm.js
    <Form.Group controlId="pricePerMinute" className="mb-3">
        <Form.Label>Price per Minute of Print Time <span className="text-danger">*</span></Form.Label>
        <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control
                type="number"
                name="pricePerMinute"
                value={values.pricePerMinute}
                onChange={handleChange}
                isInvalid={!!errors.pricePerMinute}
                step="0.01"
                min="0"
            />
            <Form.Control.Feedback type="invalid">{errors.pricePerMinute}</Form.Control.Feedback>
        </InputGroup>
    </Form.Group>
    // ... similar for pricePerGramFilament
*/

export default CostSettingsForm;