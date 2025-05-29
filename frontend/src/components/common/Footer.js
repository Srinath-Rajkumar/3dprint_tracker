// frontend/src/components/common/Footer.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light mt-auto py-3">
      <Container>
        <Row>
          <Col className="text-center">
            Copyright © {new Date().getFullYear()} 3D Print Tracker
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;