// frontend/src/pages/PrintersPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import PrinterCard from '../components/printers/PrinterCard';
import PrinterFormModal from '../components/printers/PrinterFormModal'; // Renamed from PrinterForm for clarity
import PrinterDetailsModal from '../components/printers/PrinterDetailsModal';
import printerService from '../services/printerService';
import useAuth from '../hooks/useAuth';

const PrintersPage = () => {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState(null); // For editing or viewing details
  const { userInfo } = useAuth();

  const fetchPrinters = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await printerService.getAllPrinters();
      setPrinters(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load printers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrinters();
  }, [fetchPrinters]);

  const handleOpenFormModal = (printer = null) => {
    setSelectedPrinter(printer); // if printer is passed, it's for editing
    setShowFormModal(true);
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setSelectedPrinter(null);
  };

  const handleOpenDetailsModal = async (printerId) => {
    try {
        setLoading(true); // You might want a specific loading state for the modal
        const printerData = await printerService.getPrinterById(printerId);
        setSelectedPrinter(printerData);
        setShowDetailsModal(true);
    } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load printer details');
    } finally {
        setLoading(false);
    }
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedPrinter(null);
  };


  const handleFormSuccess = () => {
    fetchPrinters(); // Refresh the list
    handleCloseFormModal();
  };

  const handleDeletePrinter = async (printerId) => {
    if (window.confirm('Are you sure you want to delete this printer? This action cannot be undone.')) {
      try {
        await printerService.deletePrinter(printerId);
        fetchPrinters(); // Refresh list
        if (selectedPrinter && selectedPrinter._id === printerId) {
            handleCloseDetailsModal(); // Close details modal if deleted printer was open
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to delete printer');
      }
    }
  };

  if (loading && printers.length === 0) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

  return (
    <Container fluid className="mt-4">
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Printers</h1>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => handleOpenFormModal()}>
            <i className="fas fa-plus"></i> Add Printer
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      
      {printers.length === 0 && !loading && !error && (
        <Alert variant="info">No printers found. Click "Add Printer" to get started.</Alert>
      )}

      <Row>
        {printers.map((printer) => (
          <Col key={printer._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
            <PrinterCard
              printer={printer}
              onEdit={() => handleOpenFormModal(printer)}
              onDelete={userInfo?.role === 'admin' ? () => handleDeletePrinter(printer._id) : null}
              onViewDetails={() => handleOpenDetailsModal(printer._id)}
            />
          </Col>
        ))}
      </Row>

      {showFormModal && (
        <PrinterFormModal
          show={showFormModal}
          handleClose={handleCloseFormModal}
          onSuccess={handleFormSuccess}
          existingPrinter={selectedPrinter}
        />
      )}

      {showDetailsModal && selectedPrinter && (
        <PrinterDetailsModal
          show={showDetailsModal}
          handleClose={handleCloseDetailsModal}
          printer={selectedPrinter}
          onEdit={() => {
            handleCloseDetailsModal(); // Close details
            handleOpenFormModal(selectedPrinter); // Open edit form
          }}
          onDelete={userInfo?.role === 'admin' ? () => handleDeletePrinter(selectedPrinter._id) : null}
        />
      )}
    </Container>
  );
};

export default PrintersPage;