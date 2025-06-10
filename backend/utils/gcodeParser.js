// backend/utils/gcodeParser.js
import fs from 'fs';
import readline from 'readline';

// Helper functions (filamentLengthToVolume, filamentVolumeToWeight, parseOrcaTimeFromString, formatSecondsToTimeString, cleanPartName)
// remain the same as your last provided version. Make sure they are included above this export.

const filamentLengthToVolume = (lengthMm, diameterMm = 1.75) => {
    if (lengthMm == null || diameterMm == null || isNaN(lengthMm) || isNaN(diameterMm) || diameterMm <= 0) return null;
    const radiusMm = diameterMm / 2;
    return Math.PI * Math.pow(radiusMm, 2) * lengthMm;
};
const filamentVolumeToWeight = (volumeMm3, densityGramsPerCm3 = 1.24) => {
    if (volumeMm3 == null || densityGramsPerCm3 == null || isNaN(volumeMm3) || isNaN(densityGramsPerCm3) || densityGramsPerCm3 <= 0) return null;
    const volumeCm3 = volumeMm3 / 1000;
    return volumeCm3 * densityGramsPerCm3;
};
const parseOrcaTimeFromString = (timeString) => {
    if (!timeString) return null;
    let totalSeconds = 0;
    const daysMatch = timeString.match(/(\d+)\s*d/i);
    const hoursMatch = timeString.match(/(\d+)\s*h/i);
    const minutesMatch = timeString.match(/(\d+)\s*m/i);
    const secondsMatch = timeString.match(/(\d+)\s*s/i);
    if (daysMatch) totalSeconds += parseInt(daysMatch[1]) * 24 * 60 * 60;
    if (hoursMatch) totalSeconds += parseInt(hoursMatch[1]) * 60 * 60;
    if (minutesMatch) totalSeconds += parseInt(minutesMatch[1]) * 60;
    if (secondsMatch) totalSeconds += parseInt(secondsMatch[1]);
    return totalSeconds > 0 ? totalSeconds : null;
};
const formatSecondsToTimeString = (seconds) => {
    if (!seconds || seconds <= 0) return '';
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const remainingSeconds = Math.floor(seconds % 60); // Ensure integer for display
    let timeString = '';
    if (days > 0) timeString += `${days}d `;
    if (hours > 0) timeString += `${hours}h `;
    if (minutes > 0) timeString += `${minutes}m `;
    if (remainingSeconds > 0) timeString += `${remainingSeconds}s`;
    return timeString.trim() || (seconds > 0 ? '<1s' : '0s'); // Handle very small durations
};
const cleanPartName = (name) => {
    if (!name) return '';
    return name.trim()
        .replace(/_PLA_.*|_PETG_.*|_ABS_.*|_ASA_.*|_\d+m\d+s/gi, '') // More aggressive cleaning
        .replace(/\.(stl|obj|3mf|step|stp|gcode|gc)$/i, '')
        .replace(/[_-]/g, ' ')
        .replace(/\s+/g, ' ') // Replace multiple spaces with single
        .trim();
};


export const parseGcodeFile = async (filePath, originalFilename = '') => {
    const extractedData = {
        estimatedTimeSeconds: null,
        filamentUsedGrams: null,
        filamentUsedLengthMm: null,
        conceptualPartNameSuggestion: null,
        parsedFilamentDensity: null,
        parsedFilamentDiameter: null,
        filamentTypeSuggestion: null, // <<< NEW for parsed filament type

        // Fields for the template
        conceptualPartName: '',
        machinePlateNo: '',
        machineId: '',
        printTimeScheduled: '',
        weightGrams: '',
        totalPiecesInConcept: '1',
        filamentType: '', // <<< NEW for final structure
    };

    try {
        await fs.promises.access(filePath, fs.constants.R_OK);
    } catch (err) {
        console.error(`Parser: Cannot access G-code file: ${filePath}`, err);
        return extractedData;
    }

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    // const totalEstimatedTimeRegex = /;.*total estimated time:\s*(.*?)(?:;|$)/i;
    // const curaTimeRegex = /;TIME:(\d+)/i;
    // const filamentLengthRegex = /;\s*filament used \[mm\]\s*=\s*(\d+\.?\d*)/i;
    // const filamentWeightRegex = /;\s*filament used \[g\]\s*=\s*(\d+\.?\d*)/i;
    // const filamentDensityRegex = /;\s*filament_density\s*=\s*(\d+\.?\d*)/i;
    // const filamentDiameterRegex = /;\s*filament_diameter\s*=\s*(\d+\.?\d*)/i;
    // const orcaModelFilenameRegex = /; printing model normal filename\s*=\s*(.*?)(?:\.gcode|\.gc|\.stl|\.3mf|\.obj)?(?:$|\n|\r|;)/i;
    // const genericFilenameRegex = /; filename\s*=\s*(.*?)(?:\.gcode|\.gc|\.stl|\.3mf|\.obj)?(?:$|\n|\r|;)/i;
    // const piecesCountRegex = /; (?:objects_count|total_objects|copies)\s*=\s*(\d+)/i;

    // Regex patterns
    const totalEstimatedTimeRegex = /;.*total estimated time:\s*(.*?)(?:;|$)/i;
    const curaTimeRegex = /;TIME:(\d+)/i;
    const filamentLengthRegex = /;\s*filament used \[mm\]\s*=\s*(\d+\.?\d*)/i;
    const filamentWeightRegex = /;\s*filament used \[g\]\s*=\s*(\d+\.?\d*)/i;
    const filamentDensityRegex = /;\s*filament_density\s*=\s*(\d+\.?\d*)/i;
    const filamentDiameterRegex = /;\s*filament_diameter\s*=\s*(\d+\.?\d*)/i;
    const filamentTypeRegex = /;\s*filament_type\s*=\s*(.*?)(?:$|\n|\r|;)/i; // <<< NEW REGEX
    const orcaModelFilenameRegex = /; printing model normal filename\s*=\s*(.*?)(?:\.gcode|\.gc|\.stl|\.3mf|\.obj)?(?:$|\n|\r|;)/i;
    const genericFilenameRegex = /; filename\s*=\s*(.*?)(?:\.gcode|\.gc|\.stl|\.3mf|\.obj)?(?:$|\n|\r|;)/i;
    const piecesCountRegex = /; (?:objects_count|total_objects|copies)\s*=\s*(\d+)/i;

    let linesParsed = 0;
    // MAX_LINES_TO_CHECK_TOTAL can be a safeguard, but we need to ensure we read enough if data is at the end.
    // For smaller files, this won't be an issue. For very large files, it might.
    // Consider removing MAX_LINES_TO_CHECK_TOTAL or making it very large if performance is not an issue for typical file sizes.
    // const MAX_LINES_TO_CHECK_TOTAL = 50000; // Example: Allow reading more lines

    // Let's remove the early exit condition based on linesParsed < MAX_LINES_TO_CHECK_HEADER for now,
    // to ensure we read till the end if necessary for filament data.
    // We'll rely on finding all key pieces of data or hitting the end of the file.

    let foundAllKeyData = false;

    for await (const line of rl) {
        linesParsed++;
        // if (linesParsed > MAX_LINES_TO_CHECK_TOTAL) break; // Optional safeguard

        let match;

        if (extractedData.estimatedTimeSeconds === null) {
            match = line.match(totalEstimatedTimeRegex);
            if (match && match[1]) {
                const timeVal = parseOrcaTimeFromString(match[1].trim());
                if (timeVal !== null) extractedData.estimatedTimeSeconds = timeVal;
            } else {
                match = line.match(curaTimeRegex);
                if (match && match[1]) extractedData.estimatedTimeSeconds = parseInt(match[1]);
            }
        }

        if (extractedData.filamentUsedGrams === null) {
            match = line.match(filamentWeightRegex);
            if (match && match[1]) {
                extractedData.filamentUsedGrams = parseFloat(match[1]);
                // console.log(`DEBUG: Matched direct weight: ${extractedData.filamentUsedGrams} from line: ${line}`);
            }
        }

        if (extractedData.filamentUsedLengthMm === null) {
            match = line.match(filamentLengthRegex);
            if (match && match[1]) {
                extractedData.filamentUsedLengthMm = parseFloat(match[1]);
                // console.log(`DEBUG: Matched length: ${extractedData.filamentUsedLengthMm} from line: ${line}`);
            }
        }

        if (extractedData.parsedFilamentDensity === null) {
            match = line.match(filamentDensityRegex);
            if (match && match[1]) extractedData.parsedFilamentDensity = parseFloat(match[1]);
        }

        if (extractedData.parsedFilamentDiameter === null) {
            match = line.match(filamentDiameterRegex);
            if (match && match[1]) extractedData.parsedFilamentDiameter = parseFloat(match[1]);
        }

        if (extractedData.conceptualPartNameSuggestion === null) {
            match = line.match(orcaModelFilenameRegex) || line.match(genericFilenameRegex);
            if (match && match[1]) {
                const cleanedName = cleanPartName(match[1]);
                if (cleanedName) extractedData.conceptualPartNameSuggestion = cleanedName;
            }
        }

        if (extractedData.totalPiecesInConcept === '1') {
            match = line.match(piecesCountRegex);
            if (match && match[1]) {
                extractedData.totalPiecesInConcept = match[1];
            }
        }
        if (extractedData.filamentTypeSuggestion === null) {
            match = line.match(filamentTypeRegex);
            if (match && match[1]) {
                extractedData.filamentTypeSuggestion = match[1].trim();
            }
        }

        // Check if all essential data points we are looking for *within the G-code comments* are found
        // We won't break early just for header data anymore if filament data is typically at the end.
        if (extractedData.estimatedTimeSeconds !== null &&
            extractedData.filamentUsedGrams !== null && // Prioritize direct weight
            extractedData.conceptualPartNameSuggestion !== null && // If we care about finding it in comments
            extractedData.parsedFilamentDensity !== null &&
            extractedData.parsedFilamentDiameter !== null &&
            extractedData.filamentTypeSuggestion !== null
            // No need to check totalPiecesInConcept for early exit, it's often '1'
        ) {
            foundAllKeyData = true; // Mark that we found what we expected from comments
            // We could break here if performance is critical and these are always found together,
            // but since filament data is at the end, we probably need to read most of it.
            // For now, let's let it read the whole file or up to MAX_LINES_TO_CHECK_TOTAL.
        }
    }
    rl.close(); // This ensures the filestream is processed

    // Fallback calculation for weight (should ideally not be needed if direct weight is parsed)
    if (extractedData.filamentUsedGrams === null && extractedData.filamentUsedLengthMm !== null) {
        const diameterToUse = extractedData.parsedFilamentDiameter || 1.75;
        const densityToUse = extractedData.parsedFilamentDensity || 1.24;
        const volumeMm3 = filamentLengthToVolume(extractedData.filamentUsedLengthMm, diameterToUse);
        if (volumeMm3 !== null) {
            const weight = filamentVolumeToWeight(volumeMm3, densityToUse);
            if (weight !== null) {
                extractedData.filamentUsedGrams = parseFloat(weight.toFixed(2));
            }
        }
    }

    // Populate the final structure for the frontend form
    extractedData.printTimeScheduled = extractedData.estimatedTimeSeconds
        ? formatSecondsToTimeString(extractedData.estimatedTimeSeconds)
        : '';
    extractedData.weightGrams = extractedData.filamentUsedGrams
        ? String(parseFloat(extractedData.filamentUsedGrams.toFixed(2)))
        : '';
    if (!extractedData.conceptualPartNameSuggestion && originalFilename) {
        extractedData.conceptualPartNameSuggestion = cleanPartName(originalFilename);
    }
    extractedData.conceptualPartName = extractedData.conceptualPartNameSuggestion || '';
    extractedData.filamentType = extractedData.filamentTypeSuggestion || ''; // <<< POPULATE FINAL FIELD

   // console.log('GcodeParser Final Processed Result:', extractedData);
    return extractedData;
};