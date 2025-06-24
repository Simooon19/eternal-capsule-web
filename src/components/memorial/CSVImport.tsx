'use client';

import React, { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { validateBulkRequest, generateSampleCSV } from '@/lib/bulkMemorialHelper';
import type { BulkMemorialData, BulkMemorialResponse } from '@/types/api';

interface CSVImportProps {
  onSuccess?: (results: BulkMemorialResponse) => void;
  onError?: (error: string) => void;
}

interface ImportStatus {
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  message: string;
  results?: BulkMemorialResponse;
}

export default function CSVImport({ onSuccess, onError }: CSVImportProps) {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [csvPreview, setCSVPreview] = useState<BulkMemorialData[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Check if user has permission for CSV import
  const hasPermission = session?.user?.planId && ['funeral', 'enterprise'].includes(session.user.planId);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setImportStatus({
        status: 'error',
        progress: 0,
        message: 'Please select a CSV file'
      });
      return;
    }

    setImportStatus({
      status: 'uploading',
      progress: 25,
      message: 'Reading CSV file...'
    });

    try {
      const csvText = await file.text();
      const memorials = parseCSV(csvText);
      
      if (memorials.length === 0) {
        throw new Error('No valid memorial data found in CSV');
      }

      if (memorials.length > 50) {
        throw new Error('CSV contains more than 50 memorials. Please split into smaller files.');
      }

      setCSVPreview(memorials);
      setShowPreview(true);
      setImportStatus({
        status: 'idle',
        progress: 50,
        message: `Found ${memorials.length} memorials. Review and confirm import.`
      });

    } catch (error) {
      setImportStatus({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Failed to read CSV file'
      });
      onError?.(error instanceof Error ? error.message : 'Failed to read CSV file');
    }
  };

  const parseCSV = (csvText: string): BulkMemorialData[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must contain header row and at least one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['name', 'born', 'died'];
    
    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        throw new Error(`Missing required column: ${required}`);
      }
    }

    const memorials: BulkMemorialData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        console.warn(`Row ${i + 1}: Column count mismatch, skipping`);
        continue;
      }

      const memorial: BulkMemorialData = {
        name: '',
        born: '',
        died: ''
      };

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
          case 'birth_location':
            memorial.birthLocation = value;
            break;
          case 'deathlocation':
          case 'death_location':
            memorial.deathLocation = value;
            break;
          case 'description':
            memorial.description = value;
            break;
          case 'familyemail':
          case 'family_email':
            memorial.familyEmail = value;
            break;
          case 'tags':
            memorial.tags = value ? value.split('|').map(t => t.trim()) : [];
            break;
        }
      });

      // Validate required fields
      if (memorial.name && memorial.born && memorial.died) {
        memorials.push(memorial);
      } else {
        console.warn(`Row ${i + 1}: Missing required fields, skipping`);
      }
    }

    return memorials;
  };

  const handleImport = async () => {
    if (!csvPreview.length) return;

    setImportStatus({
      status: 'processing',
      progress: 75,
      message: 'Creating memorials...'
    });

    try {
      const response = await fetch('/api/memorials/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memorials: csvPreview
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create memorials');
      }

      const results: BulkMemorialResponse = await response.json();
      
      setImportStatus({
        status: 'complete',
        progress: 100,
        message: `Import complete! Created ${results.created} memorials.`,
        results
      });

      setShowPreview(false);
      setCSVPreview([]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onSuccess?.(results);

    } catch (error) {
      setImportStatus({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Import failed'
      });
      onError?.(error instanceof Error ? error.message : 'Import failed');
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = generateSampleCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'memorial-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setImportStatus({ status: 'idle', progress: 0, message: '' });
    setCSVPreview([]);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!hasPermission) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Upgrade Required</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              CSV import requires a Funeral Home or Enterprise plan. 
              <a href="/pricing" className="underline font-medium">Upgrade now</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          📄 CSV Memorial Import
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Upload a CSV file to create multiple memorials at once. Maximum 50 memorials per import.
        </p>
      </div>

      {/* Sample Download */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">
              📋 Need a template?
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Download our sample CSV file with the correct format and example data.
            </p>
          </div>
          <button
            onClick={downloadSampleCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Download Template
          </button>
        </div>
      </div>

      {/* File Upload */}
      {!showPreview && (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
              </svg>
            </div>
            <div>
              <label htmlFor="csv-upload" className="cursor-pointer">
                <span className="text-copper-600 hover:text-copper-500 font-medium">
                  Choose CSV file
                </span>
                <span className="text-gray-600 dark:text-gray-300"> or drag and drop</span>
              </label>
              <input
                ref={fileInputRef}
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              CSV files only, up to 50 memorials
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">CSV Format Requirements:</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>• <strong>Required columns:</strong> name, born, died</li>
          <li>• <strong>Optional columns:</strong> birthLocation, deathLocation, description, familyEmail, tags</li>
          <li>• <strong>Date format:</strong> YYYY-MM-DD (e.g., 1950-05-15)</li>
          <li>• <strong>Tags format:</strong> Separate multiple tags with | (e.g., father|veteran|teacher)</li>
          <li>• <strong>Email format:</strong> Valid email addresses for family notifications</li>
        </ul>
      </div>

      {/* Progress Bar */}
      {importStatus.progress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">{importStatus.message}</span>
            <span className="text-gray-600 dark:text-gray-300">{importStatus.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-copper-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${importStatus.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* CSV Preview */}
      {showPreview && csvPreview.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Preview ({csvPreview.length} memorials)
            </h3>
            <div className="space-x-2">
              <button
                onClick={resetImport}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importStatus.status === 'processing'}
                className="px-4 py-2 bg-copper-600 text-white rounded-md hover:bg-copper-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {importStatus.status === 'processing' ? 'Creating...' : 'Import Memorials'}
              </button>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Born</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Died</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Family Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tags</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  {csvPreview.slice(0, 10).map((memorial, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {memorial.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(memorial.born).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(memorial.died).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {memorial.familyEmail || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {memorial.tags?.join(', ') || '-'}
                      </td>
                    </tr>
                  ))}
                  {csvPreview.length > 10 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                        ... and {csvPreview.length - 10} more memorials
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {importStatus.status === 'complete' && importStatus.results && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="font-medium text-green-800 dark:text-green-200">
                Import Complete!
              </h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                <p>✅ Created: {importStatus.results.created} memorials</p>
                {importStatus.results.failed > 0 && (
                  <p>❌ Failed: {importStatus.results.failed} memorials</p>
                )}
                <p className="mt-2">
                  Memorials are now pending admin approval. Families will receive email notifications once approved.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {importStatus.status === 'error' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-200">Import Failed</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{importStatus.message}</p>
              <button
                onClick={resetImport}
                className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-500 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 