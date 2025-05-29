// frontend/src/components/common/InputField.js (Updated to handle prependText)
import React from 'react';
import { Form, InputGroup } from 'react-bootstrap'; // Added InputGroup

const InputField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  isRequired = false,
  as,
  rows,
  disabled = false,
  children, // for select options
  prependText, // New prop
  step, // for number inputs
  min,  // for number inputs
  ...props
}) => {
  const control = (
    <Form.Control
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isInvalid={!!error}
      required={isRequired}
      as={as}
      rows={rows}
      disabled={disabled}
      step={step}
      min={min}
      {...props}
    >
      {children}
    </Form.Control>
  );

  return (
    <Form.Group controlId={name} className="mb-3">
      {label && <Form.Label>{label}{isRequired && <span className="text-danger">*</span>}</Form.Label>}
      {prependText ? (
        <InputGroup>
          <InputGroup.Text>{prependText}</InputGroup.Text>
          {control}
          {error && <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>{error}</Form.Control.Feedback>}
        </InputGroup>
      ) : (
        <>
          {control}
          {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
        </>
      )}
    </Form.Group>
  );
};

export default InputField;