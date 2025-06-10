// frontend/src/utils/constants.js

export const PRINT_PROFILES = {
    FDM: 'FDM',
    RESIN: 'Resin',
    LASER: 'Laser',
  };
  
  export const PRINTER_STATUS = {
    AVAILABLE: 'available',
    IN_PRODUCTION: 'in_production',
    MAINTENANCE: 'maintenance',
  };
  
  export const PROJECT_STATUS = {
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  };
  
  export const PRINT_JOB_STATUS = {
    PRINTING: 'printing',
    COMPLETED: 'completed',
    FAILED: 'failed',
  };
  export const PRINTER_CONNECTION_TYPES = { // <<< NEW
    NONE: 'none',
    HTTP: 'http',
    MQTT: 'mqtt',
};
  // Add other constants as needed