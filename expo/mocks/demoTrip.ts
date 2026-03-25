import { Trip } from '@/types/trip';

export const DEMO_TRIP_ID = '__demo_paris__';

export const demoTrip: Trip = {
  id: DEMO_TRIP_ID,
  name: 'Trip to Paris',
  destination: 'Paris',
  country: 'France',
  icon: 'landmark',
  iconColor: '#2D3436',
  startDate: '2026-06-10',
  endDate: '2026-06-17',
  status: 'planning',
  collaborators: [
    {
      id: 'self',
      name: 'You',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      role: 'owner',
    },
  ],
  totalBudget: 3500,
  spentBudget: 0,
  currency: 'USD',
  itinerary: [
    {
      id: 'demo-d1',
      date: '2026-06-10',
      activities: [
        { id: 'demo-a1', title: 'Arrive at Charles de Gaulle', startTime: '10:00', endTime: '11:30', category: 'flights', cost: 650, isBooked: true },
        { id: 'demo-a2', title: 'Check-in at Le Marais Hotel', startTime: '14:00', category: 'accommodation', cost: 220, isBooked: true, location: 'Le Marais' },
        { id: 'demo-a3', title: 'Evening stroll along the Seine', startTime: '18:00', endTime: '20:00', category: 'activities', isBooked: false, location: 'Seine River' },
        { id: 'demo-a4', title: 'Dinner at Café de Flore', startTime: '20:30', category: 'food', cost: 55, isBooked: false, location: 'Saint-Germain' },
      ],
    },
    {
      id: 'demo-d2',
      date: '2026-06-11',
      activities: [
        { id: 'demo-a5', title: 'Eiffel Tower Visit', startTime: '09:00', endTime: '12:00', category: 'activities', cost: 30, isBooked: true, location: 'Champ de Mars' },
        { id: 'demo-a6', title: 'Lunch at Le Jules Verne', startTime: '12:30', category: 'food', cost: 120, isBooked: true, location: 'Eiffel Tower' },
        { id: 'demo-a7', title: 'Musée d\'Orsay', startTime: '15:00', endTime: '18:00', category: 'activities', cost: 16, isBooked: false, location: 'Orsay' },
      ],
    },
    {
      id: 'demo-d3',
      date: '2026-06-12',
      activities: [
        { id: 'demo-a8', title: 'Louvre Museum', startTime: '09:30', endTime: '13:00', category: 'activities', cost: 22, isBooked: true, location: 'Louvre' },
        { id: 'demo-a9', title: 'Montmartre & Sacré-Cœur', startTime: '15:00', endTime: '18:00', category: 'activities', isBooked: false, location: 'Montmartre' },
      ],
    },
  ],
  packingList: [
    { id: 'demo-p1', name: 'Passport', category: 'documents', isPacked: false, quantity: 1 },
    { id: 'demo-p2', name: 'Comfortable Walking Shoes', category: 'clothing', isPacked: false, quantity: 1 },
    { id: 'demo-p3', name: 'Travel Adapter (EU)', category: 'electronics', isPacked: false, quantity: 1 },
    { id: 'demo-p4', name: 'Light Rain Jacket', category: 'clothing', isPacked: false, quantity: 1 },
    { id: 'demo-p5', name: 'Sunglasses', category: 'essentials', isPacked: false, quantity: 1 },
  ],
  isOfflineAvailable: false,
  ownerId: 'demo',
  ownerName: 'Demo',
};
