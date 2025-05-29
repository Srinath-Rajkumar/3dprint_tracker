// frontend/src/components/admin/UserManagementTable.js
import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { formatDate, capitalizeFirstLetter } from '../../utils/helpers';
import useAuth from '../../hooks/useAuth'; // To prevent deleting self or primary admin

const UserManagementTable = ({ users, onEditUser, onDeleteUser }) => {
  const { userInfo } = useAuth(); // Get current logged-in admin's info

  return (
    <div className="table-responsive">
      <Table striped bordered hover responsive="md">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Joined On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user._id}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone || 'N/A'}</td>
              <td>
                <Badge bg={user.role === 'admin' ? 'warning' : 'info'}>
                  {capitalizeFirstLetter(user.role)}
                </Badge>
              </td>
              <td>{formatDate(user.createdAt)}</td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2 mb-1 mb-md-0"
                  onClick={() => onEditUser(user)}
                >
                  <i className="fas fa-edit"></i> Edit
                </Button>
                {/* Prevent deleting self or the primary default admin */}
                {userInfo && userInfo._id !== user._id && user.email !== 'admin@example.com' && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDeleteUser(user._id, user.name)}
                  >
                    <i className="fas fa-trash"></i> Delete
                  </Button>
                )}
                 {(userInfo && userInfo._id === user._id) && (
                     <Badge bg="secondary" pill>Cannot delete self</Badge>
                 )}
                 {user.email === 'admin@example.com' && userInfo._id !== user._id && (
                     <Badge bg="secondary" pill>Primary Admin</Badge>
                 )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UserManagementTable;