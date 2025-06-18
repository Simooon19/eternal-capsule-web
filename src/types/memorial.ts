export interface Image {
  _key: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

export interface Video {
  _key: string;
  url: string;
  title?: string;
  description?: string;
  playbackId?: string;
  filename?: string;
}

export interface AudioMemory {
  _key: string;
  url: string;
  title?: string;
  description?: string;
  filename?: string;
}

export interface TimelineEvent {
  _key: string;
  date: string;
  title: string;
  description?: string;
  image?: Image;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  location: string;
  coordinates: Coordinates;
}

export interface StoryBlock {
  _type: string;
  _key: string;
  style?: string;
  markDefs?: any[];
  children?: {
    _key: string;
    _type: string;
    text: string;
    marks?: string[];
  }[];
  text: string;
}

export interface Reaction {
  emoji: string;
  count: number;
}

export interface GuestbookEntry {
  _id: string;
  author: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reactions?: Reaction[];
}

export interface Memorial {
  _id: string;
  title: string;
  subtitle?: string;
  slug: {
    current: string;
  };
  coverImage?: Image;
  gallery: Image[];
  videos?: Video[];
  audioMemories?: AudioMemory[];
  timeline?: TimelineEvent[];
  storyBlocks: StoryBlock[];
  bornAt?: Location;
  diedAt?: Location;
  status: 'draft' | 'published' | 'pending' | 'approved' | 'rejected' | 'deleted';
  privacy: 'public' | 'link-only' | 'password-protected';
  password?: string;
  tags?: string[];
  nfcTagUid?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  guestbook?: GuestbookEntry[];
  // Role-based access
  owner?: string; // User ID of family owner
  editors?: string[]; // User IDs of funeral home editors
  // Analytics fields
  viewCount?: number;
  scanCount?: number;
  lastScanned?: string;
}

export interface SearchFilters {
  yearRange: 'all' | 'recent' | 'old';
  hasPhotos?: boolean;
  hasStories?: boolean;
  hasVideos?: boolean;
  hasAudio?: boolean;
  tags?: string[];
  location?: {
    lat: number;
    lng: number;
    radius: number; // in km
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'family-owner' | 'funeral-home-editor' | 'admin';
  permissions: string[];
  createdAt: string;
}

export interface MemorialVersion {
  _id: string;
  memorialId: string;
  version: number;
  data: Partial<Memorial>;
  changedBy: string;
  changeReason?: string;
  createdAt: string;
}

export interface AnalyticsData {
  memorialId: string;
  scans: {
    nfc: number;
    qr: number;
  };
  views: {
    total: number;
    unique: number;
  };
  guestbookEntries: number;
  popularDays: string[];
  deviceTypes: Record<string, number>;
  referrers: Record<string, number>;
} 