// frontend/src/pages/AdminCostPage.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import CostSettingsForm from '../components/admin/CostSettingsForm'; // Ensure path is correct
import costService from '../services/costService';

const AdminCostPage = () => {
  const [costSettings, setCostSettings] = useState(null);
  const [loading, setLoading] = useState(true); // General page loading
  const [saving, setSaving] = useState(false); // Specific for save operation
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError('');
      setSuccessMessage(''); // Clear success message on load
      try {
        const data = await costService.getCostSettings();
        setCostSettings(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load cost settings.');
        setCostSettings(null); // Ensure form doesn't try to render with old data on error
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async (settingsData) => {
    setSaving(true); // Use specific saving state
    setError('');
    setSuccessMessage('');
    try {
      const updatedSettings = await costService.updateCostSettings(settingsData);
      setCostSettings(updatedSettings); // Update local state with saved data
      setSuccessMessage('Cost settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000); // Auto-hide success message
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save cost settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !costSettings && !error) { // Show spinner only on initial load without data or error
      return <Container className="text-center mt-5 vh-100 d-flex justify-content-center align-items-center"><Spinner animation="border" variant="primary" style={{width: '3rem', height: '3rem'}} /></Container>;
  }

  return (
    <Container className="mt-4 admin-page">
      <Row className="justify-content-center">
        <Col md={8} lg={7}> {/* Slightly wider column for better form layout */}
          <Card className="shadow-sm">
            <Card.Header as="h4" className="text-dark-emphasis bg-light-subtle text-center">
                <i className="fas fa-coins me-2"></i>Cost Settings Management
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
              {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>{successMessage}</Alert>}
              
              {costSettings ? (
                <CostSettingsForm
                  initialSettings={costSettings}
                  onSave={handleSaveSettings}
                  isLoading={saving} // Pass the 'saving' state
                />
              ) : (
                !loading && <Alert variant="info">Could not load cost settings or none are configured yet.</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <style jsx global>{`
        .admin-page {
          // Add any specific page styling if needed
        }
      `}</style>
    </Container>
  );
};

export default AdminCostPage;