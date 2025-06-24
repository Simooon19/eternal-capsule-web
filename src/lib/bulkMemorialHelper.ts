import type { BulkMemorialData, BulkMemorialRequest, BulkMemorialResponse } from '@/types/api';

/**
 * Helper utility for funeral homes to format and validate bulk memorial data
 */

// Template for a single memorial
export const memorialTemplate: BulkMemorialData = {
  name: 'John Doe',
  born: '1950-05-15',
  died: '2023-12-01',
  birthLocation: 'New York, NY',
  deathLocation: 'San Francisco, CA',
  description: 'A loving father and devoted husband',
  familyEmail: 'family@example.com',
  tags: ['father', 'husband']
};

// Common tags for memorials
export const commonTags = [
  'father', 'mother', 'husband', 'wife', 'son', 'daughter',
  'veteran', 'teacher', 'nurse', 'doctor', 'artist', 'musician',
  'coach', 'volunteer', 'business-owner', 'community-leader',
  'grandparent', 'friend', 'mentor', 'sports-fan', 'gardener',
  'chef', 'traveler', 'book-lover'
];

/**
 * Validate a single memorial's data
 */
export function validateMemorial(memorial: Partial<BulkMemorialData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!memorial.name || memorial.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!memorial.born) {
    errors.push('Birth date is required');
  } else if (isNaN(Date.parse(memorial.born))) {
    errors.push('Birth date must be a valid date (YYYY-MM-DD format)');
  }

  if (!memorial.died) {
    errors.push('Death date is required');
  } else if (isNaN(Date.parse(memorial.died))) {
    errors.push('Death date must be a valid date (YYYY-MM-DD format)');
  }

  // Check date logic
  if (memorial.born && memorial.died && 
      Date.parse(memorial.born) >= Date.parse(memorial.died)) {
    errors.push('Death date must be after birth date');
  }

  // Validate email if provided
  if (memorial.familyEmail && 
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memorial.familyEmail)) {
    errors.push('Family email must be a valid email address');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate bulk memorial request
 */
export function validateBulkRequest(request: BulkMemorialRequest): { 
  valid: boolean; 
  errors: Array<{ index: number; errors: string[] }>;
  warnings: string[];
} {
  const errors: Array<{ index: number; errors: string[] }> = [];
  const warnings: string[] = [];

  if (!request.memorials || !Array.isArray(request.memorials)) {
    return {
      valid: false,
      errors: [{ index: -1, errors: ['Memorials must be an array'] }],
      warnings: []
    };
  }

  if (request.memorials.length === 0) {
    return {
      valid: false,
      errors: [{ index: -1, errors: ['At least one memorial is required'] }],
      warnings: []
    };
  }

  if (request.memorials.length > 50) {
    return {
      valid: false,
      errors: [{ index: -1, errors: ['Maximum 50 memorials per request'] }],
      warnings: []
    };
  }

  // Validate each memorial
  request.memorials.forEach((memorial, index) => {
    const validation = validateMemorial(memorial);
    if (!validation.valid) {
      errors.push({
        index,
        errors: validation.errors
      });
    }
  });

  // Check for duplicate names (warning)
  const names = request.memorials.map(m => m.name?.toLowerCase().trim()).filter(Boolean);
  const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);
  if (duplicateNames.length > 0) {
    warnings.push(`Duplicate names found: ${duplicateNames.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Format CSV data into bulk memorial format
 */
export function csvToMemorials(csvData: string): { 
  memorials: BulkMemorialData[]; 
  errors: string[];
  skipped: number;
} {
  const lines = csvData.trim().split('\n');
  const memorials: BulkMemorialData[] = [];
  const errors: string[] = [];
  let skipped = 0;

  if (lines.length < 2) {
    errors.push('CSV must have at least a header row and one data row');
    return { memorials, errors, skipped };
  }

  // Expected header format: name,born,died,birthLocation,deathLocation,description,familyEmail,tags
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const requiredHeaders = ['name', 'born', 'died'];
  
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
    return { memorials, errors, skipped };
  }

  // Process data rows
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    
    if (values.length !== headers.length) {
      errors.push(`Row ${i + 1}: Column count mismatch`);
      skipped++;
      continue;
    }

    const memorial: Partial<BulkMemorialData> = {};
    
    headers.forEach((header, index) => {
      const value = values[index];
      
      switch (header) {
        case 'name':
          memorial.name = value;
          break;
        case 'born':
          memorial.born = value;
          break;
        case 'died':
          memorial.died = value;
          break;
        case 'birthlocation':
          memorial.birthLocation = value;
          break;
        case 'deathlocation':
          memorial.deathLocation = value;
          break;
        case 'description':
          memorial.description = value;
          break;
        case 'familyemail':
          memorial.familyEmail = value;
          break;
        case 'tags':
          memorial.tags = value ? value.split('|').map(t => t.trim()) : [];
          break;
      }
    });

    const validation = validateMemorial(memorial);
    if (validation.valid) {
      memorials.push(memorial as BulkMemorialData);
    } else {
      errors.push(`Row ${i + 1}: ${validation.errors.join(', ')}`);
      skipped++;
    }
  }

  return { memorials, errors, skipped };
}

/**
 * Generate sample CSV for funeral homes
 */
export function generateSampleCSV(): string {
  const header = 'name,born,died,birthLocation,deathLocation,description,familyEmail,tags';
  const samples = [
    'John Doe,1950-05-15,2023-12-01,New York NY,San Francisco CA,A loving father and devoted husband,family@example.com,father|husband|veteran',
    'Jane Smith,1955-08-20,2023-11-15,Chicago IL,Chicago IL,A beloved teacher and community leader,jane.family@example.com,teacher|community-leader',
    'Robert Johnson,1942-03-10,2023-10-30,Boston MA,Miami FL,A skilled carpenter and grandfather,robert.family@example.com,grandparent|business-owner'
  ];

  return [header, ...samples].join('\n');
}

/**
 * Create bulk memorial request from validated data
 */
export function createBulkRequest(memorials: BulkMemorialData[]): BulkMemorialRequest {
  return { memorials };
}

/**
 * Format bulk response for display
 */
export function formatBulkResponse(response: BulkMemorialResponse): {
  summary: string;
  successList: string[];
  errorList: string[];
} {
  const summary = `Created ${response.created} of ${response.created + response.failed} memorials`;
  
  const successList = response.results
    .filter(r => r.success)
    .map(r => `✅ ${r.memorial?.url} (NFC: ${r.memorial?.nfcTagUid})`);

  const errorList = response.errors?.map(e => 
    `❌ Row ${e.index + 1}: ${e.error}`
  ) || [];

  return { summary, successList, errorList };
} 