// frontend/src/components/dashboard/StatCard.js
import React from 'react';
import { Card } from 'react-bootstrap';

const StatCard = ({ title, value, icon, color = 'primary', footerText }) => {
  return (
    <Card className={`border-left-${color} shadow h-100 py-2 card-hover`}>
      <Card.Body>
        <div className="row no-gutters align-items-center">
          <div className="col mr-2">
            <div className={`text-xs font-weight-bold text-${color} text-uppercase mb-1`}>
              {title}
            </div>
            <div className="h5 mb-0 font-weight-bold text-gray-800">{value}</div>
          </div>
          {icon && (
            <div className="col-auto">
              <i className={`${icon} fa-2x text-gray-300`}></i>
            </div>
          )}
        </div>
        {footerText && <div className="text-muted small mt-2">{footerText}</div>}
      </Card.Body>
       <style jsx global>{`
        .border-left-primary { border-left: .25rem solid #4e73df !important; }
        .border-left-success { border-left: .25rem solid #1cc88a !important; }
        .border-left-info { border-left: .25rem solid #36b9cc !important; }
        .border-left-warning { border-left: .25rem solid #f6c23e !important; }
        .border-left-danger { border-left: .25rem solid #e74a3b !important; }
        .border-left-secondary { border-left: .25rem solid #858796 !important; }
        .border-left-purple { border-left: .25rem solid #6f42c1 !important; } /* Custom color example */
        .border-left-teal { border-left: .25rem solid #20c997 !important; } /* Custom color example */

        .text-gray-300 { color: #dddfeb !important; }
        .text-gray-800 { color: #5a5c69 !important; }
        .text-xs { font-size: .7rem; }
      `}</style>
    </Card>
  );
};

export default StatCard;