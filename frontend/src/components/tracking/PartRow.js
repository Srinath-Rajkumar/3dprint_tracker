import React from 'react';
import { Button, Badge,Stack  } from 'react-bootstrap'; // Removed Dropdown for now
import { formatDurationFromSeconds, formatDate } from '../../utils/helpers';
import { PRINT_JOB_STATUS } from '../../utils/constants';

const PartRow = ({ job, index, onEditDetails, onChangeStatus, onDelete, isProjectCompleted }) => { // Removed onUpdate, edit modal handles updates
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
  // Determine X and Y for "Piece: X of Y"
  const currentPieceIdentifier = job.machinePlateNo || '?'; // This is your 'X'
  const totalPiecesForConceptualPart = job.part?.totalPieces; // This is your 'Y'

 let pieceDetail = `Piece ID: ${currentPieceIdentifier}`;
  if (totalPiecesForConceptualPart && totalPiecesForConceptualPart > 0) {
    pieceDetail += ` of ${totalPiecesForConceptualPart} (Total for ${job.part?.conceptualPartName || 'this part'})`;
  } else if (job.part?.conceptualPartName) {
    // If total pieces not set, at least show it's for a conceptual part
    pieceDetail += ` (for ${job.part.conceptualPartName})`;
  }
  return (
    <tr className={job.isReprint ? 'table-warning' : ''}>
      <td>{index}{job.isReprint && <Badge bg="warning" text="dark" className="ms-1" pill>R</Badge>}</td>
      <td> {/* Piece ID / Details Column */}
        {job.machinePlateNo || 'N/A'}
        {job.part?.totalPieces && job.part.totalPieces > 0 && (
          <small className="text-muted d-block">
            (of {job.part.totalPieces} total for "{job.part.conceptualPartName}")
          </small>
        )}
      </td>
      <td>{job.slicerSpecificPlateNo || job.machinePlateNo || 'N/A'}</td>
      <td>{job.machine?.name || 'N/A'} <br/> <small className="text-muted">{job.machine?.model || ''}</small></td>
      <td>{formatDurationFromSeconds(job.printTimeScheduledSeconds)}</td>
      <td>{job.weightGrams}g</td>
      <td>{formatDate(job.jobStartDate)}</td>
      <td>{job.jobStartTime || 'N/A'}</td>
      <td>{getStatusBadge(job.status)}</td>
      <td>
        {(job.status === PRINT_JOB_STATUS.COMPLETED || job.status === PRINT_JOB_STATUS.FAILED) && job.actualPrintTimeSeconds != null
          ? formatDurationFromSeconds(job.actualPrintTimeSeconds)
          : 'N/A'}
      </td>
      <td>
        {!isProjectCompleted ? (
          <Stack direction="horizontal" gap={1}> {/* Reduced gap */}
            <Button variant="outline-primary" size="sm" title="Edit Details" onClick={() => onEditDetails(job)}>
              <i className="fas fa-pencil-alt"></i> {/* Changed icon */}
            </Button>
            <Button variant="outline-info" size="sm" title="Change Status" onClick={() => onChangeStatus(job)}>
              <i className="fas fa-sync-alt"></i>
            </Button>
            <Button variant="outline-danger" size="sm" title="Delete" onClick={() => onDelete(job._id)}>
              <i className="fas fa-trash"></i>
            </Button>
          </Stack>
        ) : (
          <span className="text-muted fst-italic">Project Closed</span>
        )}
      </td>
    </tr>
  );
};

export default PartRow;