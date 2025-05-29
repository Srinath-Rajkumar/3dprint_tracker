// frontend/src/utils/helpers.js

// Format date to a readable string, e.g., "Jan 1, 2023"
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return 'Invalid Date';
    }
  };
  
  // Format date and time, e.g., "Jan 1, 2023, 5:30 PM"
  export const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
     try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return 'Invalid Date';
    }
  };
  
  // Format seconds to "X days Y hrs Z mins"
  export const formatDurationFromSeconds = (totalSeconds) => {
    if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) return 'N/A';
    if (totalSeconds === 0) return '0 min';
  
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    totalSeconds %= (24 * 60 * 60);
    const hours = Math.floor(totalSeconds / (60 * 60));
    totalSeconds %= (60 * 60);
    const minutes = Math.floor(totalSeconds / 60);
  
    let result = [];
    if (days > 0) result.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) result.push(`${hours} hr${hours > 1 ? 's' : ''}`);
    if (minutes > 0) result.push(`${minutes} min${minutes > 1 ? 's' : ''}`);
    
    return result.length > 0 ? result.join(' ') : '0 min';
  };
  
  // Parse "X days Y hrs Z mins" string to total seconds
  export const parseDurationToSeconds = (durationString) => {
    if (!durationString || typeof durationString !== 'string') return 0;
    let totalSeconds = 0;
    const duration = durationString.toLowerCase();
  
    const daysMatch = duration.match(/(\d+)\s*d(ay)?s?/);
    const hoursMatch = duration.match(/(\d+)\s*h(r|our)?s?/);
    const minutesMatch = duration.match(/(\d+)\s*m(in|inute)?s?/);
  
    if (daysMatch) totalSeconds += parseInt(daysMatch[1], 10) * 24 * 60 * 60;
    if (hoursMatch) totalSeconds += parseInt(hoursMatch[1], 10) * 60 * 60;
    if (minutesMatch) totalSeconds += parseInt(minutesMatch[1], 10) * 60;
    
    // If only a number is provided, assume it's minutes (or handle as error)
    if (totalSeconds === 0 && /^\d+$/.test(duration.trim())) {
      totalSeconds = parseInt(duration.trim(), 10) * 60;
    }
  
    return totalSeconds;
  };
  
  
  // Format weight from grams to "X kg Y g" or just "Y g"
  export const formatWeight = (grams) => {
    if (grams === null || grams === undefined || isNaN(grams)) return 'N/A';
    if (grams < 1000) {
      return `${grams} g`;
    }
    const kg = Math.floor(grams / 1000);
    const g = grams % 1000;
    if (g === 0) {
      return `${kg} kg`;
    }
    return `${kg} kg ${g} g`;
  };
  
  // Capitalize first letter of a string
  export const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  
  // Get API URL (useful if you don't use setupProxy for all calls or for image paths)
  export const getApiUrl = (path = '') => {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
      return `${baseUrl.replace('/api', '')}${path}`; // Adjust if REACT_APP_API_URL includes /api
  };