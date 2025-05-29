// frontend/src/components/common/Card.js
import React from 'react';
import { Card as BootstrapCard } from 'react-bootstrap';

const CustomCard = ({ title, children, className, cardImgTop, footerContent, ...props }) => {
  return (
    <BootstrapCard className={`mb-3 ${className || ''}`} {...props}>
      {cardImgTop && <BootstrapCard.Img variant="top" src={cardImgTop} />}
      {title && (
        <BootstrapCard.Header as="h5">{title}</BootstrapCard.Header>
      )}
      <BootstrapCard.Body>
        {children}
      </BootstrapCard.Body>
      {footerContent && (
        <BootstrapCard.Footer>
            {footerContent}
        </BootstrapCard.Footer>
      )}
    </BootstrapCard>
  );
};

export default CustomCard;