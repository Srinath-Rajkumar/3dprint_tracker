// frontend/src/components/common/Button.js
import React from 'react';
import { Button as BootstrapButton, Spinner } from 'react-bootstrap';

const CustomButton = ({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  disabled = false,
  isLoading = false,
  size,
  className = '',
  icon, // e.g., "fas fa-save"
  ...props
}) => {
  return (
    <BootstrapButton
      variant={variant}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      size={size}
      className={`custom-button ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            className="me-1"
          />
          Loading...
        </>
      ) : (
        <>
          {icon && <i className={`${icon} me-2`}></i>}
          {children}
        </>
      )}
    </BootstrapButton>
  );
};

export default CustomButton;