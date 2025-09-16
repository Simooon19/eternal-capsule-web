import { OfflineSync } from '../offlineSync';
import { safeIndexedDB } from '../safariCompat';

jest.mock('../safariCompat', () => ({
  safeIndexedDB: {
    isAvailable: jest.fn(),
    open: jest.fn(),
  },
}));

describe('OfflineSync fallback queue', () => {
  const mockedSafeIndexedDB = safeIndexedDB as jest.Mocked<typeof safeIndexedDB>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedSafeIndexedDB.isAvailable.mockResolvedValue(false);
    mockedSafeIndexedDB.open.mockResolvedValue(null as unknown as IDBDatabase);
  });

  it('stores and retrieves entries when IndexedDB is unavailable', async () => {
    const offline = new OfflineSync();

    const entryId = await offline.storeForSync('guestbook', { message: 'Hello' });

    expect(entryId).toMatch(/^guestbook_/);
    expect(mockedSafeIndexedDB.open).not.toHaveBeenCalled();

    const pendingEntries = await offline.getPendingEntries('guestbook');
    expect(pendingEntries).toHaveLength(1);
    expect(pendingEntries[0]).toMatchObject({
      id: entryId,
      data: { message: 'Hello' },
      type: 'guestbook',
    });

    await offline.removeSyncedEntry('guestbook', entryId);
    const remainingEntries = await offline.getPendingEntries('guestbook');
    expect(remainingEntries).toHaveLength(0);
  });
});
