// frontend/src/components/auth/InitialAdminSetupForm.js
import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const InitialAdminSetupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { userInfo, updateUser } = useAuth(); // Use updateUser from AuthContext
  const navigate = useNavigate();

  React.useEffect(() => {
    if (userInfo && userInfo.email !== 'admin@example.com') { // If default email was changed
        setEmail(userInfo.email);
    }
    if (userInfo && userInfo.name !== 'Admin') {
        setName(userInfo.name);
    }
  }, [userInfo]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!name || !email || !password || !phone) {
        setError('All fields are required, including phone.');
        return;
    }
    setLoading(true);
    try {
      const updatedAdminData = await authService.initialAdminSetup(
        { name, email, phone, password },
        userInfo.token
      );
      // Update user info in context and local storage
      updateUser({
          ...updatedAdminData,
          requiresInitialSetup: false, // Explicitly set this
      });
      navigate('/profile-select'); // Or to dashboard if profile selection is skipped for admin
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2 className="mb-4">Complete Admin Profile Setup</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group controlId="name" className="mb-3">
        <Form.Label>Full Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group controlId="email" className="mb-3">
        <Form.Label>Email Address</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group controlId="phone" className="mb-3">
        <Form.Label>Phone Number</Form.Label>
        <Form.Control
          type="tel"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group controlId="password">
        <Form.Label>New Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group controlId="confirmPassword">
        <Form.Label>Confirm New Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </Form.Group>

      <Button type="submit" variant="primary" className="mt-3 w-100" disabled={loading}>
        {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Complete Setup'}
      </Button>
    </Form>
  );
};

export default InitialAdminSetupForm;