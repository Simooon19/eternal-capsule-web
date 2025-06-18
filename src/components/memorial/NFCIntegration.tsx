import React, { useEffect, useState } from 'react';
import { Memorial } from '@/types/memorial';

interface NFCIntegrationProps {
  memorial: Memorial;
  onScanDetected?: (scanData: any) => void;
}

declare global {
  interface Window {
    NDEFReader: any;
  }
}

export default function NFCIntegration({ memorial, onScanDetected }: NFCIntegrationProps) {
  const [isNFCSupported, setIsNFCSupported] = useState(false);
  const [nfcStatus, setNfcStatus] = useState<'idle' | 'scanning' | 'found' | 'error'>('idle');
  const [scanData, setScanData] = useState<any>(null);

  useEffect(() => {
    // Check if NFC is supported
    if ('NDEFReader' in window) {
      setIsNFCSupported(true);
    }

    // Check if we arrived via NFC scan (from URL params or referrer)
    const urlParams = new URLSearchParams(window.location.search);
    const nfcScan = urlParams.get('nfc');
    const source = urlParams.get('source');

    if (nfcScan === 'true' || source === 'nfc') {
      trackScan('nfc');
      setNfcStatus('found');
      onScanDetected?.({ type: 'nfc', memorialId: memorial._id });
    }

    // Check for QR code scan
    if (source === 'qr') {
      trackScan('qr');
      setNfcStatus('found');
      onScanDetected?.({ type: 'qr', memorialId: memorial._id });
    }
  }, [memorial._id, onScanDetected]);

  const trackScan = async (type: 'nfc' | 'qr') => {
    try {
      await fetch('/api/analytics/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memorialId: memorial._id,
          scanType: type,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        }),
      });
    } catch (error) {
      console.error('Failed to track scan:', error);
    }
  };

  const writeNFCTag = async () => {
    if (!isNFCSupported) return;

    try {
      setNfcStatus('scanning');
      const ndef = new window.NDEFReader();
      
      const memorialUrl = `${window.location.origin}/memorial/${memorial.slug.current}?source=nfc&nfc=true`;
      
      await ndef.write({
        records: [
          {
            recordType: 'url',
            data: memorialUrl
          },
          {
            recordType: 'text',
            data: `Memorial for ${memorial.title}`
          }
        ]
      });

      setNfcStatus('found');
      setScanData({ type: 'write', url: memorialUrl });
    } catch (error) {
      console.error('NFC write failed:', error);
      setNfcStatus('error');
    }
  };

  const readNFCTag = async () => {
    if (!isNFCSupported) return;

    try {
      setNfcStatus('scanning');
      const ndef = new window.NDEFReader();
      
      await ndef.scan();
      
      ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
        setNfcStatus('found');
        const data = {
          serialNumber,
          records: message.records.map((record: any) => ({
            recordType: record.recordType,
            data: record.data
          }))
        };
        setScanData(data);
        onScanDetected?.(data);
      });

    } catch (error) {
      console.error('NFC read failed:', error);
      setNfcStatus('error');
    }
  };

  const generateQRCode = () => {
    const memorialUrl = `${window.location.origin}/memorial/${memorial.slug.current}?source=qr`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(memorialUrl)}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">NFC & QR Code</h3>
      
      {/* NFC Tag UID Display */}
      {memorial.nfcTagUid && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            NFC Tag ID: <code className="font-mono">{memorial.nfcTagUid}</code>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NFC Section */}
        <div>
          <h4 className="font-medium mb-3">NFC Tag</h4>
          
          {!isNFCSupported ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              NFC is not supported on this device
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={writeNFCTag}
                disabled={nfcStatus === 'scanning'}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 transition-colors"
              >
                {nfcStatus === 'scanning' ? 'Writing...' : 'Write to NFC Tag'}
              </button>
              
              <button
                onClick={readNFCTag}
                disabled={nfcStatus === 'scanning'}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md disabled:opacity-50 transition-colors"
              >
                {nfcStatus === 'scanning' ? 'Scanning...' : 'Test NFC Scan'}
              </button>
            </div>
          )}

          {/* NFC Status */}
          {nfcStatus !== 'idle' && (
            <div className={`mt-3 p-3 rounded text-sm ${
              nfcStatus === 'found' ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300' :
              nfcStatus === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300' :
              'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            }`}>
              {nfcStatus === 'scanning' && 'Please tap your device to the NFC tag...'}
              {nfcStatus === 'found' && 'NFC operation successful!'}
              {nfcStatus === 'error' && 'NFC operation failed. Please try again.'}
            </div>
          )}
        </div>

        {/* QR Code Section */}
        <div>
          <h4 className="font-medium mb-3">QR Code</h4>
          <div className="text-center">
            <img
              src={generateQRCode()}
              alt="QR Code for Memorial"
              className="w-32 h-32 mx-auto mb-3 border rounded"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Scan to visit this memorial
            </p>
          </div>
        </div>
      </div>

      {/* Scan Data Display */}
      {scanData && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <h5 className="font-medium mb-2">Scan Data:</h5>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(scanData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}