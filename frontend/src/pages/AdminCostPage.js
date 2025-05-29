// frontend/src/pages/AdminCostPage.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import CostSettingsForm from '../components/admin/CostSettingsForm'; // To be created
import costService from '../services/costService';

const AdminCostPage = () => {
  const [costSettings, setCostSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await costService.getCostSettings();
        setCostSettings(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load cost settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async (settingsData) => {
    setLoading(true); // Use a specific loading state for saving if preferred
    setError('');
    setSuccessMessage('');
    try {
      const updatedSettings = await costService.updateCostSettings(settingsData);
      setCostSettings(updatedSettings);
      setSuccessMessage('Cost settings updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save cost settings.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !costSettings) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  // Error can be shown even if costSettings exist from a previous load attempt
  // if (!costSettings && error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;


  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <h1 className="mb-4 text-center">Cost Settings Management</h1>
          {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
          {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>{successMessage}</Alert>}
          
          <Card>
            <Card.Header as="h5">Configure Project Cost Calculation</Card.Header>
            <Card.Body>
              {costSettings ? (
                <CostSettingsForm
                  initialSettings={costSettings}
                  onSave={handleSaveSettings}
                  isLoading={loading} // Pass loading state for save button
                />
              ) : (
                  <p>Loading settings or no settings found...</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminCostPage;