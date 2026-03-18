const DESTINATION_IMAGES: Record<string, string> = {
  'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=500&fit=crop&q=80',
  'Bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=500&fit=crop&q=80',
  'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=500&fit=crop&q=80',
  'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=500&fit=crop&q=80',
  'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=500&fit=crop&q=80',
  'Santorini': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=500&fit=crop&q=80',
  'Barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=500&fit=crop&q=80',
  'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=500&fit=crop&q=80',
  'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=500&fit=crop&q=80',
  'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=500&fit=crop&q=80',
  'Hanoi': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&h=500&fit=crop&q=80',
  'Bangkok': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&h=500&fit=crop&q=80',
  'Istanbul': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=500&fit=crop&q=80',
  'Kyoto': 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=500&fit=crop&q=80',
  'Marrakech': 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&h=500&fit=crop&q=80',
  'Amsterdam': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=500&fit=crop&q=80',
  'Lisbon': 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&h=500&fit=crop&q=80',
  'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=500&fit=crop&q=80',
  'Prague': 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&h=500&fit=crop&q=80',
  'Vienna': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&h=500&fit=crop&q=80',
  'Hong Kong': 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&h=500&fit=crop&q=80',
  'Buenos Aires': 'https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=800&h=500&fit=crop&q=80',
  'Seoul': 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&h=500&fit=crop&q=80',
  'Cape Town': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=500&fit=crop&q=80',
  'Reykjavik': 'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?w=800&h=500&fit=crop&q=80',
  'Machu Picchu': 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&h=500&fit=crop&q=80',
  'Dubrovnik': 'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800&h=500&fit=crop&q=80',
  'Florence': 'https://images.unsplash.com/photo-1543429257-3eb0b65d9c58?w=800&h=500&fit=crop&q=80',
  'Edinburgh': 'https://images.unsplash.com/photo-1506377585622-bedcbb5f8c2e?w=800&h=500&fit=crop&q=80',
  'Cancun': 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800&h=500&fit=crop&q=80',
  'Berlin': 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=500&fit=crop&q=80',
  'Copenhagen': 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&h=500&fit=crop&q=80',
  'Queenstown': 'https://images.unsplash.com/photo-1589871973318-9ca1258faa5d?w=800&h=500&fit=crop&q=80',
  'Maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=500&fit=crop&q=80',
  'Phuket': 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&h=500&fit=crop&q=80',
  'Cairo': 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&h=500&fit=crop&q=80',
  'Vancouver': 'https://images.unsplash.com/photo-1559511260-66a68eea8c09?w=800&h=500&fit=crop&q=80',
  'Petra': 'https://images.unsplash.com/photo-1579606032821-4e6161c81571?w=800&h=500&fit=crop&q=80',
  'Cartagena': 'https://images.unsplash.com/photo-1533050487297-09b450131914?w=800&h=500&fit=crop&q=80',
  'Swiss Alps': 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=500&fit=crop&q=80',
  'Siem Reap': 'https://images.unsplash.com/photo-1508159452718-d22f6b8dfeea?w=800&h=500&fit=crop&q=80',
  'Los Angeles': 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&h=500&fit=crop&q=80',
  'Zanzibar': 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&h=500&fit=crop&q=80',
  'Mumbai': 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800&h=500&fit=crop&q=80',
  'Lake Bled': 'https://images.unsplash.com/photo-1583318432730-a19c89692612?w=800&h=500&fit=crop&q=80',
  'Havana': 'https://images.unsplash.com/photo-1500759285222-a95626b934cb?w=800&h=500&fit=crop&q=80',
  'Patagonia': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop&q=80',
  'Amalfi Coast': 'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=800&h=500&fit=crop&q=80',
  'Nice': 'https://images.unsplash.com/photo-1491166617655-0723a0999cfc?w=800&h=500&fit=crop&q=80',
  'Bruges': 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=800&h=500&fit=crop&q=80',
  'Costa Rica': 'https://images.unsplash.com/photo-1518259102261-b57f7c7a4c85?w=800&h=500&fit=crop&q=80',
  'Safari Kenya': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=500&fit=crop&q=80',
  'Milan': 'https://images.unsplash.com/photo-1520440229-6469a149ac59?w=800&h=500&fit=crop&q=80',
  'Athens': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=500&fit=crop&q=80',
  'Zurich': 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800&h=500&fit=crop&q=80',
  'Osaka': 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&h=500&fit=crop&q=80',
  'Kuala Lumpur': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=500&fit=crop&q=80',
  'San Francisco': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=500&fit=crop&q=80',
  'Mexico City': 'https://images.unsplash.com/photo-1518659526054-190340b32735?w=800&h=500&fit=crop&q=80',
  'Rio de Janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=500&fit=crop&q=80',
  'Stockholm': 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&h=500&fit=crop&q=80',
  'Madrid': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=500&fit=crop&q=80',
  'Taipei': 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=800&h=500&fit=crop&q=80',
  'Helsinki': 'https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?w=800&h=500&fit=crop&q=80',
  'Nairobi': 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=800&h=500&fit=crop&q=80',
  'Lima': 'https://images.unsplash.com/photo-1531968455001-5c5272a67c8d?w=800&h=500&fit=crop&q=80',
  'Cusco': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=500&fit=crop&q=80',
  'Fiji': 'https://images.unsplash.com/photo-1535916707207-35f97e715e1c?w=800&h=500&fit=crop&q=80',
  'Morocco': 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&h=500&fit=crop&q=80',
  'New Zealand': 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&h=500&fit=crop&q=80',
  'Iceland': 'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?w=800&h=500&fit=crop&q=80',
  'Angkor Wat': 'https://images.unsplash.com/photo-1508159452718-d22f6b8dfeea?w=800&h=500&fit=crop&q=80',
};

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&h=500&fit=crop&q=80',
];

export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop&q=80';

export function getDestinationImage(destination: string, fallbackId?: string): string {
  if (!destination || destination.trim().length === 0) {
    console.log('[DestinationImages] Empty destination, using fallback');
    return DEFAULT_FALLBACK_IMAGE;
  }

  const direct = DESTINATION_IMAGES[destination];
  if (direct) return direct;

  const lower = destination.toLowerCase().trim();
  for (const [key, url] of Object.entries(DESTINATION_IMAGES)) {
    const keyLower = key.toLowerCase();
    if (keyLower === lower || lower.includes(keyLower) || keyLower.includes(lower)) {
      return url;
    }
  }

  const hash = (fallbackId ?? destination).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const fallback = FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length];
  console.log('[DestinationImages] No match for:', destination, '- using fallback');
  return fallback;
}

export function getDestinationImageHQ(destination: string): string {
  const base = getDestinationImage(destination);
  return base.replace('w=800&h=500', 'w=1600&h=900');
}
