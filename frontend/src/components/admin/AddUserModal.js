// frontend/src/components/admin/AddUserModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import useForm from '../../hooks/useForm';
import userService from '../../services/userService';
import InputField from '../common/InputField';

const AddUserModal = ({ show, handleClose, onSuccess, existingUser }) => {
  const initialValues = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  };

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setValues,
    setIsSubmitting,
  } = useForm(initialValues, validateUserForm);

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (existingUser) {
      setValues({
        name: existingUser.name || '',
        email: existingUser.email || '',
        phone: existingUser.phone || '',
        password: '', // Don't pre-fill password for editing
        confirmPassword: '',
        role: existingUser.role || 'user',
      });
    } else {
      resetForm();
    }
    setFormError('');
  }, [existingUser, show, resetForm, setValues]);

  const onSubmit = async () => {
    setFormError('');
    const userData = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      role: values.role,
    };
    // Only include password if it's provided (for new user or password reset)
    if (values.password) {
      userData.password = values.password;
    }

    try {
      let responseMessage = '';
      if (existingUser) {
        await userService.updateUser(existingUser._id, userData);
        responseMessage = `User "${userData.name}" updated successfully!`;
      } else {
        await userService.createUser(userData);
        responseMessage = `User "${userData.name}" created successfully!`;
      }
      onSuccess(responseMessage);
      handleLocalClose();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'An error occurred');
      setIsSubmitting(false);
    }
  };

  const handleLocalClose = () => {
    resetForm();
    handleClose();
  };

  function validateUserForm(vals) {
    const errs = {};
    if (!vals.name.trim()) errs.name = 'Name is required.';
    if (!vals.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(vals.email)) {
      errs.email = 'Email address is invalid.';
    }
    // Password is required for new users, optional for edits unless changing
    if (!existingUser && !vals.password) {
      errs.password = 'Password is required for new users.';
    }
    if (vals.password && vals.password !== vals.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    if (vals.password && vals.password.length < 6) {
        errs.password = 'Password must be at least 6 characters.'
    }
    return errs;
  }

  return (
    <Modal show={show} onHide={handleLocalClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{existingUser ? 'Edit User' : 'Add New User'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={(e) => handleSubmit(e, onSubmit)}>
        <Modal.Body>
          {formError && <Alert variant="danger">{formError}</Alert>}
          <InputField
            label="Full Name"
            name="name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
            isRequired
          />
          <InputField
            label="Email Address"
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            isRequired
            disabled={!!existingUser && existingUser.email === 'admin@example.com'} // Can't change primary admin email
          />
          <InputField
            label="Phone Number (Optional)"
            name="phone"
            value={values.phone}
            onChange={handleChange}
          />
          <InputField
            label="Role"
            name="role"
            as="select"
            value={values.role}
            onChange={handleChange}
            disabled={!!existingUser && existingUser.email === 'admin@example.com'} // Can't change primary admin role
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </InputField>
          <Row>
            <Col md={6}>
              <InputField
                label={existingUser ? "New Password (leave blank to keep current)" : "Password"}
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                error={errors.password}
                isRequired={!existingUser}
              />
            </Col>
            <Col md={6}>
              <InputField
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                isRequired={!existingUser || !!values.password} // Required if new user or if password field has value
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleLocalClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : (existingUser ? 'Save Changes' : 'Add User')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddUserModal;