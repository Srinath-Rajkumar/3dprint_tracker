// frontend/src/pages/UserProfilePage.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Form, Button, Spinner } from 'react-bootstrap';
import useAuth from '../hooks/useAuth';
import userService from '../services/userService'; // For password change, profile update
import InputField from '../components/common/InputField';

const UserProfilePage = () => {
  const { userInfo, updateUser: updateAuthContextUser } = useAuth(); // Renamed to avoid conflict
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || '');
      setEmail(userInfo.email || '');
      setPhone(userInfo.phone || '');
    }
  }, [userInfo]);

  const handleDetailsUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoadingDetails(true);
    try {
        const updatedData = { name, phone }; // Only allow name and phone update here
        // Email change is usually more complex (verification), handle separately or by admin
        
        const response = await userService.changePassword(updatedData); // Assuming changePassword also updates name/phone
        updateAuthContextUser(response); // Update context with new token and details
        setMessage('Profile details updated successfully!');
    } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
        setLoadingDetails(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (!currentPassword || !newPassword) {
        setError('All password fields are required.');
        return;
    }

    setLoadingPassword(true);
    try {
      // Backend needs to verify currentPassword before setting newPassword
      const response = await userService.changePassword({ currentPassword, password: newPassword });
      updateAuthContextUser(response); // Update context, especially if token is re-issued
      setMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to change password.');
    } finally {
      setLoadingPassword(false);
    }
  };

  if (!userInfo) {
    return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <h1 className="mb-4 text-center">My Profile</h1>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Card className="mb-4">
            <Card.Header as="h5">Account Details</Card.Header>
            <Card.Body>
              <Form onSubmit={handleDetailsUpdate}>
                <InputField label="Full Name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
                <InputField label="Email Address" name="email" value={email} disabled /> {/* Email usually not editable by user directly */}
                <InputField label="Phone Number" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <Button type="submit" variant="primary" disabled={loadingDetails} className="mt-2">
                  {loadingDetails ? <Spinner as="span" size="sm" /> : 'Update Details'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header as="h5">Change Password</Card.Header>
            <Card.Body>
              <Form onSubmit={handlePasswordChange}>
                <InputField
                  label="Current Password"
                  type="password"
                  name="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  isRequired
                />
                <InputField
                  label="New Password"
                  type="password"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  isRequired
                />
                <InputField
                  label="Confirm New Password"
                  type="password"
                  name="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  isRequired
                />
                <Button type="submit" variant="warning" disabled={loadingPassword} className="mt-2">
                  {loadingPassword ? <Spinner as="span" size="sm" /> : 'Change Password'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfilePage;