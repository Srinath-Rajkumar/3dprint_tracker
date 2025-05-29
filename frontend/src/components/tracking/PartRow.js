// // frontend/src/components/tracking/PartRow.js
// import React from 'react';
// import { Button, Badge, Dropdown } from 'react-bootstrap';
// import { formatDurationFromSeconds, formatDate } from '../../utils/helpers';
// import { PRINT_JOB_STATUS } from '../../utils/constants';

// const PartRow = ({ job, index, onEdit, isProjectCompleted, onUpdate }) => {
//   const getStatusBadge = (status) => {
//     switch (status) {
//       case PRINT_JOB_STATUS.PRINTING:
//         return <Badge bg="info">Printing</Badge>;
//       case PRINT_JOB_STATUS.COMPLETED:
//         return <Badge bg="success">Completed</Badge>;
//       case PRINT_JOB_STATUS.FAILED:
//         return <Badge bg="danger">Failed</Badge>;
//       default:
//         return <Badge bg="secondary">{status}</Badge>;
//     }
//   };

//   return (
//     <tr className={job.isReprint ? 'table-warning' : ''}>
//       <td>{index}{job.isReprint && <Badge bg="warning" text="dark" className="ms-1" pill>R</Badge>}</td>
//       <td>{job.partName}</td>
//       <td>{job.machinePlateNo || 'N/A'}</td>
//       <td>{job.machine?.name || 'N/A'}</td>
//       <td>{formatDurationFromSeconds(job.printTimeScheduledSeconds)}</td>
//       <td>{job.weightGrams}g</td>
//       <td>{formatDate(job.jobStartDate)}</td>
//       <td>{job.jobStartTime || 'N/A'}</td>
//       <td>{getStatusBadge(job.status)}</td>
//       <td>
//         {job.status === PRINT_JOB_STATUS.COMPLETED || job.status === PRINT_JOB_STATUS.FAILED
//           ? formatDurationFromSeconds(job.actualPrintTimeSeconds)
//           : 'N/A'}
//       </td>
//       <td>
//         {!isProjectCompleted && (
//              <Button variant="outline-primary" size="sm" onClick={onEdit}>
//                 <i className="fas fa-edit"></i> Edit/Status
//             </Button>
//         )}
//         {isProjectCompleted && job.status === PRINT_JOB_STATUS.FAILED && (
//             <span className="text-muted fst-italic">Project Closed</span>
//         )}
//          {isProjectCompleted && (job.status === PRINT_JOB_STATUS.PRINTING || job.status === PRINT_JOB_STATUS.COMPLETED) && (
//             <span className="text-muted fst-italic">Project Closed</span>
//         )}
//       </td>
//     </tr>
//   );
// };

// export default PartRow;
// frontend/src/components/tracking/PartRow.js
import React from 'react';
import { Button, Badge } from 'react-bootstrap'; // Removed Dropdown for now
import { formatDurationFromSeconds, formatDate } from '../../utils/helpers';
import { PRINT_JOB_STATUS } from '../../utils/constants';

const PartRow = ({ job, index, onEdit, isProjectCompleted }) => { // Removed onUpdate, edit modal handles updates
  const getStatusBadge = (status) => {
        switch (status) {
          case PRINT_JOB_STATUS.PRINTING:
            return <Badge bg="info">Printing</Badge>;
          case PRINT_JOB_STATUS.COMPLETED:
            return <Badge bg="success">Completed</Badge>;
          case PRINT_JOB_STATUS.FAILED:
            return <Badge bg="danger">Failed</Badge>;
          default:
            return <Badge bg="secondary">{status}</Badge>;
        }
      };

  return (
    <tr className={job.isReprint ? 'table-warning' : ''}>
      <td>{index}{job.isReprint && <Badge bg="warning" text="dark" className="ms-1" pill>R</Badge>}</td>
      <td>
        <strong>{job.part?.conceptualPartName || 'N/A (Part)'}</strong> {/* Display conceptual part name */}
        <br />
        <small className="text-muted">Piece: {job.machinePlateNo}</small>
      </td>
      <td>{job.machinePlateNo || 'N/A'}</td> {/* Now combined with part name */}
      <td>{job.machine?.name || 'N/A'} <br/> <small className="text-muted">{job.machine?.model || ''}</small></td>
      <td>{formatDurationFromSeconds(job.printTimeScheduledSeconds)}</td>
      <td>{job.weightGrams}g</td>
      <td>{formatDate(job.jobStartDate)}</td>
      <td>{job.jobStartTime || 'N/A'}</td>
      <td>{getStatusBadge(job.status)}</td>
      <td>
        {job.status === PRINT_JOB_STATUS.COMPLETED || job.status === PRINT_JOB_STATUS.FAILED
          ? formatDurationFromSeconds(job.actualPrintTimeSeconds)
          : 'N/A'}
      </td>
      <td>
        {!isProjectCompleted && (
             <Button variant="outline-primary" size="sm" onClick={() => onEdit(job)}> {/* Pass job to onEdit */}
                <i className="fas fa-edit"></i> Edit/Status
            </Button>
        )}
        {isProjectCompleted && job.status === PRINT_JOB_STATUS.FAILED && (
            <span className="text-muted fst-italic">Project Closed</span>
        )}
         {isProjectCompleted && (job.status === PRINT_JOB_STATUS.PRINTING || job.status === PRINT_JOB_STATUS.COMPLETED) && (
            <span className="text-muted fst-italic">Project Closed</span>
        )}
      </td>
    </tr>
  );
};

export default PartRow;