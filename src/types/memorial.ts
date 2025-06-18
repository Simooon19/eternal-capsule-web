export interface Image {
  _key: string;
  url: string;
  alt: string;
  width: number;
  height: number;
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

export interface GuestbookEntry {
  _id: string;
  author: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Memorial {
  _id: string;
  title?: string;
  name?: string;
  subtitle?: string;
  description?: string;
  slug: {
    current: string;
  };
  born: string;
  died: string;
  coverImage?: Image;
  gallery: Image[];
  storyBlocks: StoryBlock[];
  guestbook?: GuestbookEntry[];
  bornAt?: {
    location: string;
    coordinates?: Coordinates;
  };
  diedAt?: {
    location: string;
    coordinates?: Coordinates;
  };
  status: 'draft' | 'published' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  yearRange: 'all' | 'recent' | 'old';
  hasPhotos?: boolean;
  hasStories?: boolean;
} 