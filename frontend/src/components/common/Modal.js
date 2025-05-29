// frontend/src/components/common/Modal.js
import React from 'react';
import { Modal as BootstrapModal, Button } from 'react-bootstrap';

const CustomModal = ({
  show,
  handleClose,
  title,
  children,
  handleSubmit, // Optional: if modal has a primary submit action
  submitButtonText = 'Save Changes',
  size = 'lg', // 'sm', 'lg', 'xl'
  closeButtonText = 'Close',
  hideFooter = false,
}) => {
  return (
    <BootstrapModal show={show} onHide={handleClose} size={size} centered>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>{children}</BootstrapModal.Body>
      {!hideFooter && (
        <BootstrapModal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            {closeButtonText}
          </Button>
          {handleSubmit && (
            <Button variant="primary" onClick={handleSubmit}>
              {submitButtonText}
            </Button>
          )}
        </BootstrapModal.Footer>
      )}
    </BootstrapModal>
  );
};

export default CustomModal;