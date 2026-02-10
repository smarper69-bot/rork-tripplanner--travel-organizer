export type TripIcon = 'cherry-blossom' | 'cathedral' | 'palm-tree' | 'mountain' | 'sun' | 'landmark' | 'trees' | 'snowflake' | 'tent';

export interface Trip {
  id: string;
  name: string;
  destination: string;
  country: string;
  icon: TripIcon;
  iconColor: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'upcoming' | 'ongoing' | 'completed';
  collaborators: Collaborator[];
  totalBudget: number;
  spentBudget: number;
  currency: string;
  itinerary: ItineraryDay[];
  packingList: PackingItem[];
  isOfflineAvailable: boolean;
}

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'editor' | 'viewer';
}

export interface ItineraryDay {
  id: string;
  date: string;
  activities: Activity[];
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  category: ActivityCategory;
  cost?: number;
  notes?: string;
  isBooked: boolean;
}

export type ActivityCategory = 
  | 'flights'
  | 'accommodation'
  | 'food'
  | 'activities'
  | 'transport'
  | 'shopping'
  | 'other';

export interface PackingItem {
  id: string;
  name: string;
  category: PackingCategory;
  isPacked: boolean;
  quantity: number;
}

export type PackingCategory =
  | 'essentials'
  | 'clothing'
  | 'toiletries'
  | 'electronics'
  | 'documents'
  | 'other';

export interface BudgetCategory {
  category: ActivityCategory;
  allocated: number;
  spent: number;
}

export type DestinationIcon = 'torii-gate' | 'sun' | 'mountain' | 'snowflake' | 'store' | 'trees' | 'landmark' | 'palm-tree';

export interface Destination {
  id: string;
  name: string;
  country: string;
  icon: DestinationIcon;
  iconColor: string;
  description: string;
  tags: string[];
  averageBudget: string;
  bestTime: string;
  rating: number;
}

export interface TravelAlert {
  id: string;
  tripId: string;
  type: 'schedule_change' | 'weather' | 'reminder' | 'booking';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  suggestions?: string[];
  tripSuggestion?: {
    destination: string;
    country: string;
    duration: string;
    highlights: string[];
  };
  bookingSuggestion?: {
    type: 'hotel' | 'activity' | 'flight';
    name: string;
    price: string;
    rating: number;
    image?: string;
  }[];
}

export interface Booking {
  id: string;
  type: 'hotel' | 'activity' | 'flight' | 'transport';
  name: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  amenities?: string[];
  dates?: string;
  duration?: string;
}

export interface GroupComment {
  id: string;
  tripId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  activityId?: string;
}

export interface Vote {
  id: string;
  tripId: string;
  activityId: string;
  userId: string;
  vote: 'up' | 'down';
}

export interface Stay {
  id: string;
  tripId: string;
  hotelName: string;
  address: string;
  checkIn: string;
  checkOut: string;
  price?: number;
  isConfirmed: boolean;
  bookingRef?: string;
  notes?: string;
}

export interface VisitedPlace {
  id: string;
  destination: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  trips: string[];
  firstVisited: string;
  lastVisited: string;
  totalNights: number;
  hotels: string[];
}

export interface TravelStats {
  totalTrips: number;
  totalCountries: number;
  totalCities: number;
  totalNights: number;
  topDestinations: { name: string; visits: number }[];
}

export interface ProFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface ProSubscription {
  isActive: boolean;
  plan?: 'monthly' | 'annual';
  expiresAt?: string;
}
