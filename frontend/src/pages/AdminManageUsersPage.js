// frontend/src/pages/AdminManageUsersPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import UserManagementTable from '../components/admin/UserManagementTable'; // To be created
import AddUserModal from '../components/admin/AddUserModal'; // To be created (renamed from AddUserForm)
import userService from '../services/userService';

const AdminManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null); // For editing, pass to AddUserModal

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUserSuccess = (message) => {
    setShowAddUserModal(false);
    setUserToEdit(null);
    fetchUsers(); // Refresh list
    setSuccessMessage(message || 'User operation successful!');
    setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3s
  };

  const handleOpenAddUserModal = (user = null) => {
      setUserToEdit(user); // if user is passed, it's for editing
      setShowAddUserModal(true);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      setLoading(true); // Can use a specific deleting state
      setError('');
      setSuccessMessage('');
      try {
        await userService.deleteUser(userId);
        fetchUsers();
        setSuccessMessage(`User "${userName}" deleted successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to delete user.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && users.length === 0) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;


  return (
    <Container fluid className="mt-4">
      <Row className="align-items-center mb-3">
        <Col>
          <h1>User Management</h1>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => handleOpenAddUserModal()}>
            <i className="fas fa-user-plus"></i> Add New User
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>{successMessage}</Alert>}

      {users.length > 0 ? (
        <UserManagementTable
          users={users}
          onEditUser={handleOpenAddUserModal}
          onDeleteUser={handleDeleteUser}
        />
      ) : (
          !loading && <Alert variant="info">No users found. Click "Add New User" to create one.</Alert>
      )}


      {showAddUserModal && (
        <AddUserModal
          show={showAddUserModal}
          handleClose={() => {
              setShowAddUserModal(false);
              setUserToEdit(null);
          }}
          onSuccess={handleAddUserSuccess}
          existingUser={userToEdit}
        />
      )}
    </Container>
  );
};

export default AdminManageUsersPage;