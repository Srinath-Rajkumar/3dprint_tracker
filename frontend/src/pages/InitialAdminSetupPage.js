// frontend/src/pages/InitialAdminSetupPage.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import InitialAdminSetupForm from '../components/auth/InitialAdminSetupForm';

const InitialAdminSetupPage = () => {
  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col xs={12} md={6} lg={5}>
          <InitialAdminSetupForm />
        </Col>
      </Row>
    </Container>
  );
};

export default InitialAdminSetupPage;