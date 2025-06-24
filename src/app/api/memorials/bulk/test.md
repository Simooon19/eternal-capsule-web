# Bulk Memorial API Testing Guide

## Quick Test (cURL)

```bash
# Test with sample data
curl -X POST http://localhost:3000/api/memorials/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FUNERAL_HOME_SESSION_TOKEN" \
  -d '{
    "memorials": [
      {
        "name": "John Doe",
        "born": "1950-05-15",
        "died": "2023-12-01",
        "birthLocation": "New York, NY",
        "deathLocation": "San Francisco, CA",
        "description": "A loving father and devoted husband",
        "familyEmail": "family@example.com",
        "tags": ["father", "husband"]
      },
      {
        "name": "Jane Smith",
        "born": "1955-08-20",
        "died": "2023-11-15",
        "birthLocation": "Chicago, IL",
        "deathLocation": "Chicago, IL",
        "description": "A beloved teacher",
        "familyEmail": "smith@example.com",
        "tags": ["teacher"]
      }
    ]
  }'
```

## Expected Response

```json
{
  "success": true,
  "created": 2,
  "failed": 0,
  "results": [
    {
      "index": 0,
      "success": true,
      "memorial": {
        "id": "memorial-xyz",
        "slug": "john-doe-memorial-123",
        "url": "http://localhost:3000/memorial/john-doe-memorial-123",
        "nfcTagUid": "nfc_1234567890_abc123"
      }
    },
    {
      "index": 1,
      "success": true,
      "memorial": {
        "id": "memorial-abc",
        "slug": "jane-smith-memorial-456",
        "url": "http://localhost:3000/memorial/jane-smith-memorial-456",
        "nfcTagUid": "nfc_1234567891_def456"
      }
    }
  ]
}
```

## JavaScript Example

```javascript
// For funeral home software integration
async function createMemorialsInBulk(memorialData) {
  const response = await fetch('/api/memorials/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`
    },
    body: JSON.stringify({
      memorials: memorialData
    })
  });

  const result = await response.json();
  
  if (result.success) {
    console.log(`Created ${result.created} memorials successfully`);
    
    // Send NFC tag info to funeral home
    result.results.forEach(memorial => {
      if (memorial.success) {
        console.log(`Memorial: ${memorial.memorial.url}`);
        console.log(`NFC Tag ID: ${memorial.memorial.nfcTagUid}`);
      }
    });
  }
  
  return result;
}
```

## Error Handling

```json
{
  "success": true,
  "created": 1,
  "failed": 1,
  "results": [
    {
      "index": 0,
      "success": true,
      "memorial": {...}
    }
  ],
  "errors": [
    {
      "index": 1,
      "error": "Missing required fields: name, born, died",
      "data": {
        "name": "",
        "born": "1950-05-15",
        "died": ""
      }
    }
  ]
}
```

## Rate Limits

- **Funeral Home Plan**: 50 memorials per request, 100 requests per hour
- **Enterprise Plan**: 50 memorials per request, unlimited requests

## Notes

1. All memorials are created with `status: 'pending'` and require admin approval
2. Family emails automatically receive notification when memorial is approved
3. NFC tag UIDs are generated automatically for each memorial
4. Memorial URLs are ready for immediate QR code generation 