// frontend/src/components/projects/ProjectCostDisplay.js
import React from 'react';
import { Form } from 'react-bootstrap';

const ProjectCostDisplay = ({ costByTime, costByFilament, showCostBy, setShowCostBy }) => {
  const handleCostToggle = (e) => {
    setShowCostBy(e.target.value);
  };

  return (
    <div>
      <Form.Group controlId="costToggle" className="d-flex align-items-center mb-1">
        <Form.Label className="me-2 mb-0 small">Cost By:</Form.Label>
        <Form.Select size="sm" value={showCostBy} onChange={handleCostToggle} style={{width: 'auto'}}>
          <option value="time">Time</option>
          <option value="filament">Filament</option>
        </Form.Select>
      </Form.Group>
      <p className="mb-0">
        <strong>
          Est. Cost: $
          {showCostBy === 'time'
            ? (costByTime || 0).toFixed(2)
            : (costByFilament || 0).toFixed(2)}
        </strong>
      </p>
    </div>
  );
};

export default ProjectCostDisplay;