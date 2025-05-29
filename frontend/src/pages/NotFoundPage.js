// frontend/src/pages/NotFoundPage.js
import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Container className="text-center mt-5">
      <Row>
        <Col>
          <h1 className="display-1">404</h1>
          <h2>Oops! Page Not Found.</h2>
          <p className="lead">
            Sorry, the page you are looking for does not exist.
          </p>
          <Button as={Link} to="/" variant="primary" className="mt-3">
            Go to Homepage
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage;