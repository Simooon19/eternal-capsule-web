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
  coordinates?: Coordinates;
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
  users?: string[]; // Session IDs of users who reacted (optional for privacy)
}

export interface GuestbookEntry {
  _id: string;
  author: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reactions?: Reaction[];
}

export interface TimelineEvent {
  _key: string;
  date: string;
  title: string;
  description?: string;
  image?: Image;
}

export interface AudioMemory {
  _key: string;
  url: string;
  title?: string;
  description?: string;
}

export interface Video {
  _key: string;
  url: string;
  title?: string;
  description?: string;
}

export interface Memorial {
  _id: string;
  name: string;
  description?: string;
  born?: string;
  died?: string;
  title: string;
  subtitle?: string;
  slug: {
    current: string;
  };
  bornAt?: {
    location?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  diedAt?: {
    location?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  personalInfo?: {
    dateOfBirth?: string;
    dateOfDeath?: string;
    birthLocation?: string;
    deathLocation?: string;
    age?: number;
    restingPlace?: {
      cemetery?: string;
      section?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
  };
  coverImage?: {
    url: string;
    alt?: string;
  };
  gallery?: {
    url: string;
    alt?: string;
    caption?: string;
  }[];
  storyBlocks: StoryBlock[];
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'published';
  createdAt: string;
  updatedAt: string;
  _createdAt: string;
  _updatedAt?: string;
  guestbook?: GuestbookEntry[];
  videos?: any[];
  audioMemories?: any[];
  tags?: string[];
  coordinates?: Coordinates;
  blackAndWhiteHero?: boolean;
  nfcTagUid?: string;
  viewCount?: number;
  scanCount?: number;
  privacy?: 'public' | 'link-only' | 'password-protected';
  password?: string;
  /**
   * Detailed life events timeline.  If provided the memorial page will render a rich timeline component; otherwise a simplified birth→death timeline is shown.
   */
  timeline?: TimelineEvent[];
}

export interface SearchFilters {
  yearRange: 'all' | 'recent' | 'old';
  hasPhotos?: boolean;
  hasStories?: boolean;
}

// Obituaries-specific types
export interface ObituaryFilters {
  radius: number; // in miles
  period: number; // in days
  sortBy: 'distance' | 'date' | 'engagement';
}

export interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
  region?: string;
  country?: string;
}

export interface ObituaryMemorial extends Memorial {
  distance?: number;
  daysAgo?: number;
  engagement?: number;
  relevanceScore?: number;
} 