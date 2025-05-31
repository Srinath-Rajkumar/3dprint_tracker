// Can be in the same file or a separate component file like components/dashboard/DashboardStatCard.js
import React from 'react';
import { Card,Row,Col } from 'react-bootstrap';

const DashboardStatCard = ({ title, value, icon, colorName, unit, trend, trendDirection }) => {
    // Define a mapping for colors to actual hex values or theme variables
    // This helps in maintaining consistency and allows easy theme changes later.
    const colorMap = {
      primary: '#0d6efd', // Bootstrap Primary
      success: '#198754', // Bootstrap Success
      info: '#0dcaf0',    // Bootstrap Info
      warning: '#ffc107', // Bootstrap Warning
      danger: '#dc3545',   // Bootstrap Danger
      secondary: '#6c757d',
      purple: '#6f42c1',
      teal: '#20c997',
      orange: '#fd7e14',
      darkgreen: '#006400',
      indigo: '#4B0082',
      // Add more as needed
    };
  
    const iconColor = colorMap[colorName] || colorMap.secondary; // Fallback color
  
    return (
      <Card className="h-100 shadow-sm dashboard-stat-card">
        <Card.Body className="d-flex flex-column">
          <Row className="align-items-start"> {/* Align items to start for icon alignment */}
            <Col>
              <div className="text-muted text-uppercase small mb-1">{title}</div>
              <div className="h3 mb-0 fw-bold d-flex align-items-baseline">
                {value}
                {unit && <span className="text-muted small ms-1">{unit}</span>}
              </div>
            </Col>
            <Col xs="auto">
              <div className="stat-card-icon" style={{ color: iconColor, backgroundColor: `${iconColor}1A` }}> {/* Icon with light background */}
                <i className={icon}></i>
              </div>
            </Col>
          </Row>
          {trend && (
            <div className={`mt-auto small pt-2 d-flex align-items-center ${trendDirection === 'up' ? 'text-success' : trendDirection === 'down' ? 'text-danger' : 'text-muted'}`}>
              {trendDirection === 'up' && <i className="fas fa-arrow-up me-1"></i>}
              {trendDirection === 'down' && <i className="fas fa-arrow-down me-1"></i>}
              {trend}
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  export default DashboardStatCard;