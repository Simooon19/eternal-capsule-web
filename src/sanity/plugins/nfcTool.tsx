// New file: Sanity Studio Tool for NFC & QR code management
// Note: This uses the existing NFCIntegration component from the web app for convenience.
// It will appear in Studio's left-hand menu as "NFC / QR".

'use client'

import { definePlugin } from 'sanity';
import { useEffect, useState } from 'react';
import NFCIntegration from '@/components/memorial/NFCIntegration';
import { client } from '@/lib/sanity';
import { Memorial } from '@/types/memorial';

// Simple wrapper component – shows the NFCIntegration for the currently selected memorial document.
// When opened outside a memorial context, it just asks to select a document.
function NFCToolPane() {
  const [memorials, setMemorials] = useState<Pick<Memorial, '_id' | 'title' | 'slug'>[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [memorial, setMemorial] = useState<Memorial | null>(null);

  // Fetch list of memorials once
  useEffect(() => {
    client
      .fetch(`*[_type == "memorial"]{ _id, title, slug } | order(title asc)`)
      .then((list: any) => setMemorials(list));
  }, []);

  // Fetch the selected memorial details
  useEffect(() => {
    if (!selectedId) return;
    client
      .fetch(
        `*[_type == "memorial" && _id == $id][0]{
          _id,
          title,
          slug,
          nfcTagUid,
          gallery[0],
          blackAndWhiteHero,
          bornAt,
          diedAt
        }`,
        { id: selectedId }
      )
      .then((doc: any) => setMemorial(doc));
  }, [selectedId]);

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <h2 style={{ fontWeight: 600, marginBottom: 12 }}>Select a memorial to manage NFC / QR</h2>
      <select
        style={{ padding: '8px 12px', width: '100%', marginBottom: 24 }}
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        <option value="">-- Choose memorial --</option>
        {memorials.map((m) => (
          <option key={m._id} value={m._id}>
            {m.title}
          </option>
        ))}
      </select>

      {memorial && <NFCIntegration memorial={memorial} />}
    </div>
  );
}

export const nfcTool = definePlugin({
  name: 'nfc-tool',
  tools: (prev) => [
    ...prev,
    {
      name: 'nfc',
      title: 'NFC / QR',
      component: NFCToolPane,
      icon: () => '📳',
    },
  ],
}); 