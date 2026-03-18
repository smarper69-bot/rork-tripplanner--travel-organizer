export type ImageConfidence = 'high' | 'medium' | 'low';

export interface ImageResult {
  url: string;
  confidence: ImageConfidence;
}

const CURATED_IMAGES: Record<string, string> = {
  'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=500&fit=crop&q=80',
  'Bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=500&fit=crop&q=80',
  'Paris': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&h=500&fit=crop&q=80',
  'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=500&fit=crop&q=80',
  'New York': 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800&h=500&fit=crop&q=80',
  'Santorini': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=500&fit=crop&q=80',
  'Barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=500&fit=crop&q=80',
  'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=500&fit=crop&q=80',
  'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=500&fit=crop&q=80',
  'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=500&fit=crop&q=80',
  'Hanoi': 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=800&h=500&fit=crop&q=80',
  'Bangkok': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&h=500&fit=crop&q=80',
  'Istanbul': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=500&fit=crop&q=80',
  'Kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=500&fit=crop&q=80',
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
  'Reykjavik': 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800&h=500&fit=crop&q=80',
  'Machu Picchu': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=500&fit=crop&q=80',
  'Dubrovnik': 'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800&h=500&fit=crop&q=80',
  'Florence': 'https://images.unsplash.com/photo-1543429257-3eb0b65d9c58?w=800&h=500&fit=crop&q=80',
  'Edinburgh': 'https://images.unsplash.com/photo-1506377585622-bedcbb5f8c2e?w=800&h=500&fit=crop&q=80',
  'Cancun': 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800&h=500&fit=crop&q=80',
  'Berlin': 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=500&fit=crop&q=80',
  'Copenhagen': 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&h=500&fit=crop&q=80',
  'Queenstown': 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&h=500&fit=crop&q=80',
  'Maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=500&fit=crop&q=80',
  'Phuket': 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&h=500&fit=crop&q=80',
  'Cairo': 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800&h=500&fit=crop&q=80',
  'Vancouver': 'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=800&h=500&fit=crop&q=80',
  'Petra': 'https://images.unsplash.com/photo-1579606032821-4e6161c81571?w=800&h=500&fit=crop&q=80',
  'Cartagena': 'https://images.unsplash.com/photo-1533050487297-09b450131914?w=800&h=500&fit=crop&q=80',
  'Swiss Alps': 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=500&fit=crop&q=80',
  'Siem Reap': 'https://images.unsplash.com/photo-1600490036275-35f5f1656861?w=800&h=500&fit=crop&q=80',
  'Angkor Wat': 'https://images.unsplash.com/photo-1600490036275-35f5f1656861?w=800&h=500&fit=crop&q=80',
  'Los Angeles': 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&h=500&fit=crop&q=80',
  'Zanzibar': 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800&h=500&fit=crop&q=80',
  'Mumbai': 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800&h=500&fit=crop&q=80',
  'Lake Bled': 'https://images.unsplash.com/photo-1583318432730-a19c89692612?w=800&h=500&fit=crop&q=80',
  'Havana': 'https://images.unsplash.com/photo-1500759285222-a95626b934cb?w=800&h=500&fit=crop&q=80',
  'Patagonia': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop&q=80',
  'Amalfi Coast': 'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=800&h=500&fit=crop&q=80',
  'Nice': 'https://images.unsplash.com/photo-1491166617655-0723a0999cfc?w=800&h=500&fit=crop&q=80',
  'Bruges': 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=800&h=500&fit=crop&q=80',
  'Costa Rica': 'https://images.unsplash.com/photo-1518183214770-9cffbec72538?w=800&h=500&fit=crop&q=80',
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
  'Iceland': 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800&h=500&fit=crop&q=80',
  'Hawaii': 'https://images.unsplash.com/photo-1507876466758-bc54f384809c?w=800&h=500&fit=crop&q=80',
  'Bermuda': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=500&fit=crop&q=80',
  'Medellin': 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&h=500&fit=crop&q=80',
  'Bogota': 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&h=500&fit=crop&q=80',
  'Santiago': 'https://images.unsplash.com/photo-1569012871812-f38ee64cd54c?w=800&h=500&fit=crop&q=80',
  'Ho Chi Minh': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=500&fit=crop&q=80',
  'Ho Chi Minh City': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=500&fit=crop&q=80',
  'Chiang Mai': 'https://images.unsplash.com/photo-1598935898639-81586f7d2129?w=800&h=500&fit=crop&q=80',
  'Luang Prabang': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=500&fit=crop&q=80',
  'Kathmandu': 'https://images.unsplash.com/photo-1558799401-1dcba79834c2?w=800&h=500&fit=crop&q=80',
  'Delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=500&fit=crop&q=80',
  'New Delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=500&fit=crop&q=80',
  'Jaipur': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=500&fit=crop&q=80',
  'Goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=500&fit=crop&q=80',
  'Colombo': 'https://images.unsplash.com/photo-1586098561468-3bad2c13da15?w=800&h=500&fit=crop&q=80',
  'Sri Lanka': 'https://images.unsplash.com/photo-1586098561468-3bad2c13da15?w=800&h=500&fit=crop&q=80',
  'Tbilisi': 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&h=500&fit=crop&q=80',
  'Baku': 'https://images.unsplash.com/photo-1603920505553-d7b869c7ada3?w=800&h=500&fit=crop&q=80',
  'Muscat': 'https://images.unsplash.com/photo-1597522781074-9a05ab90638e?w=800&h=500&fit=crop&q=80',
  'Oman': 'https://images.unsplash.com/photo-1597522781074-9a05ab90638e?w=800&h=500&fit=crop&q=80',
  'Jordan': 'https://images.unsplash.com/photo-1579606032821-4e6161c81571?w=800&h=500&fit=crop&q=80',
  'Lebanon': 'https://images.unsplash.com/photo-1579606032821-4e6161c81571?w=800&h=500&fit=crop&q=80',
  'Beirut': 'https://images.unsplash.com/photo-1579606032821-4e6161c81571?w=800&h=500&fit=crop&q=80',
  'Tel Aviv': 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&h=500&fit=crop&q=80',
  'Jerusalem': 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&h=500&fit=crop&q=80',
  'Abu Dhabi': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=500&fit=crop&q=80',
  'Doha': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=500&fit=crop&q=80',
  'Riyadh': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=500&fit=crop&q=80',
  'Warsaw': 'https://images.unsplash.com/photo-1519197924284-31fc3a804e9e?w=800&h=500&fit=crop&q=80',
  'Krakow': 'https://images.unsplash.com/photo-1519197924284-31fc3a804e9e?w=800&h=500&fit=crop&q=80',
  'Budapest': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=500&fit=crop&q=80',
  'Bucharest': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=500&fit=crop&q=80',
  'Sofia': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=500&fit=crop&q=80',
  'Tallinn': 'https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?w=800&h=500&fit=crop&q=80',
  'Riga': 'https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?w=800&h=500&fit=crop&q=80',
  'Vilnius': 'https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?w=800&h=500&fit=crop&q=80',
  'Oslo': 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&h=500&fit=crop&q=80',
  'Lagos': 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=800&h=500&fit=crop&q=80',
  'Accra': 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=800&h=500&fit=crop&q=80',
  'Addis Ababa': 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=800&h=500&fit=crop&q=80',
  'Dar es Salaam': 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=800&h=500&fit=crop&q=80',
  'Marrakesh': 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&h=500&fit=crop&q=80',
  'Fez': 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&h=500&fit=crop&q=80',
  'Casablanca': 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&h=500&fit=crop&q=80',
  'Tangier': 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&h=500&fit=crop&q=80',
  'Tunis': 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&h=500&fit=crop&q=80',
  'Dakar': 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=800&h=500&fit=crop&q=80',
  'Windhoek': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=500&fit=crop&q=80',
  'Namibia': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=500&fit=crop&q=80',
  'Johannesburg': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=500&fit=crop&q=80',
  'Durban': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=500&fit=crop&q=80',
  'Victoria Falls': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=500&fit=crop&q=80',
  'Seychelles': 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800&h=500&fit=crop&q=80',
  'Mauritius': 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800&h=500&fit=crop&q=80',
  'Madagascar': 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800&h=500&fit=crop&q=80',
  'Toronto': 'https://images.unsplash.com/photo-1517090504332-af4bd824bdf6?w=800&h=500&fit=crop&q=80',
  'Montreal': 'https://images.unsplash.com/photo-1517090504332-af4bd824bdf6?w=800&h=500&fit=crop&q=80',
  'Chicago': 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800&h=500&fit=crop&q=80',
  'Miami': 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=800&h=500&fit=crop&q=80',
  'Las Vegas': 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=800&h=500&fit=crop&q=80',
  'Washington DC': 'https://images.unsplash.com/photo-1501466044931-62695aada8e9?w=800&h=500&fit=crop&q=80',
  'Boston': 'https://images.unsplash.com/photo-1501979376754-2ff867a4f659?w=800&h=500&fit=crop&q=80',
  'Seattle': 'https://images.unsplash.com/photo-1502175353174-a7a70e73b362?w=800&h=500&fit=crop&q=80',
  'Portland': 'https://images.unsplash.com/photo-1507245338956-96b36b7c7c40?w=800&h=500&fit=crop&q=80',
  'Denver': 'https://images.unsplash.com/photo-1546156929-a4c0ac411f47?w=800&h=500&fit=crop&q=80',
  'Austin': 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=800&h=500&fit=crop&q=80',
  'Nashville': 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=800&h=500&fit=crop&q=80',
  'New Orleans': 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=800&h=500&fit=crop&q=80',
};

const COUNTRY_IMAGES: Record<string, string> = {
  'Japan': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=500&fit=crop&q=80',
  'France': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&h=500&fit=crop&q=80',
  'Italy': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=500&fit=crop&q=80',
  'Spain': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=500&fit=crop&q=80',
  'Greece': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=500&fit=crop&q=80',
  'Thailand': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&h=500&fit=crop&q=80',
  'Indonesia': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=500&fit=crop&q=80',
  'Vietnam': 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=800&h=500&fit=crop&q=80',
  'Cambodia': 'https://images.unsplash.com/photo-1600490036275-35f5f1656861?w=800&h=500&fit=crop&q=80',
  'India': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=500&fit=crop&q=80',
  'China': 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&h=500&fit=crop&q=80',
  'South Korea': 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&h=500&fit=crop&q=80',
  'Australia': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=500&fit=crop&q=80',
  'New Zealand': 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&h=500&fit=crop&q=80',
  'United States': 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800&h=500&fit=crop&q=80',
  'Canada': 'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=800&h=500&fit=crop&q=80',
  'Mexico': 'https://images.unsplash.com/photo-1518659526054-190340b32735?w=800&h=500&fit=crop&q=80',
  'Brazil': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=500&fit=crop&q=80',
  'Argentina': 'https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=800&h=500&fit=crop&q=80',
  'Peru': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=500&fit=crop&q=80',
  'Colombia': 'https://images.unsplash.com/photo-1533050487297-09b450131914?w=800&h=500&fit=crop&q=80',
  'Chile': 'https://images.unsplash.com/photo-1569012871812-f38ee64cd54c?w=800&h=500&fit=crop&q=80',
  'United Kingdom': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=500&fit=crop&q=80',
  'England': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=500&fit=crop&q=80',
  'Scotland': 'https://images.unsplash.com/photo-1506377585622-bedcbb5f8c2e?w=800&h=500&fit=crop&q=80',
  'Germany': 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=500&fit=crop&q=80',
  'Netherlands': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=500&fit=crop&q=80',
  'Portugal': 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&h=500&fit=crop&q=80',
  'Switzerland': 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=500&fit=crop&q=80',
  'Austria': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&h=500&fit=crop&q=80',
  'Czech Republic': 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&h=500&fit=crop&q=80',
  'Croatia': 'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800&h=500&fit=crop&q=80',
  'Turkey': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=500&fit=crop&q=80',
  'Morocco': 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&h=500&fit=crop&q=80',
  'Egypt': 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800&h=500&fit=crop&q=80',
  'South Africa': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=500&fit=crop&q=80',
  'Kenya': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=500&fit=crop&q=80',
  'Tanzania': 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800&h=500&fit=crop&q=80',
  'United Arab Emirates': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=500&fit=crop&q=80',
  'Jordan': 'https://images.unsplash.com/photo-1579606032821-4e6161c81571?w=800&h=500&fit=crop&q=80',
  'Iceland': 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800&h=500&fit=crop&q=80',
  'Denmark': 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&h=500&fit=crop&q=80',
  'Sweden': 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&h=500&fit=crop&q=80',
  'Norway': 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&h=500&fit=crop&q=80',
  'Finland': 'https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?w=800&h=500&fit=crop&q=80',
  'Belgium': 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=800&h=500&fit=crop&q=80',
  'Slovenia': 'https://images.unsplash.com/photo-1583318432730-a19c89692612?w=800&h=500&fit=crop&q=80',
  'Cuba': 'https://images.unsplash.com/photo-1500759285222-a95626b934cb?w=800&h=500&fit=crop&q=80',
  'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=500&fit=crop&q=80',
  'Malaysia': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=500&fit=crop&q=80',
  'Philippines': 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800&h=500&fit=crop&q=80',
  'Sri Lanka': 'https://images.unsplash.com/photo-1586098561468-3bad2c13da15?w=800&h=500&fit=crop&q=80',
  'Nepal': 'https://images.unsplash.com/photo-1558799401-1dcba79834c2?w=800&h=500&fit=crop&q=80',
  'Georgia': 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&h=500&fit=crop&q=80',
  'Maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=500&fit=crop&q=80',
  'Hungary': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=500&fit=crop&q=80',
  'Poland': 'https://images.unsplash.com/photo-1519197924284-31fc3a804e9e?w=800&h=500&fit=crop&q=80',
  'Ireland': 'https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=800&h=500&fit=crop&q=80',
  'Romania': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=500&fit=crop&q=80',
  'Israel': 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&h=500&fit=crop&q=80',
  'Taiwan': 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=800&h=500&fit=crop&q=80',
  'Costa Rica': 'https://images.unsplash.com/photo-1518183214770-9cffbec72538?w=800&h=500&fit=crop&q=80',
};

const REGION_FALLBACK_IMAGES: Record<string, string> = {
  'europe': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=500&fit=crop&q=80',
  'asia': 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&h=500&fit=crop&q=80',
  'north-america': 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800&h=500&fit=crop&q=80',
  'south-america': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=500&fit=crop&q=80',
  'africa': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=500&fit=crop&q=80',
  'oceania': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=500&fit=crop&q=80',
  'middle-east': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=500&fit=crop&q=80',
  'caribbean': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop&q=80',
};

export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop&q=80';

const SAFE_TRAVEL_FALLBACKS = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&h=500&fit=crop&q=80',
];

function normalizeKey(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

function findExactMatch(destination: string): string | null {
  const direct = CURATED_IMAGES[destination];
  if (direct) return direct;
  return null;
}

function findFuzzyMatch(destination: string): string | null {
  const lower = normalizeKey(destination);
  if (!lower) return null;

  for (const [key, url] of Object.entries(CURATED_IMAGES)) {
    const keyNorm = normalizeKey(key);
    if (keyNorm === lower) return url;
  }

  for (const [key, url] of Object.entries(CURATED_IMAGES)) {
    const keyNorm = normalizeKey(key);
    if (lower.includes(keyNorm) || keyNorm.includes(lower)) return url;
  }

  return null;
}

function findCountryMatch(country: string): string | null {
  if (!country) return null;
  const direct = COUNTRY_IMAGES[country];
  if (direct) return direct;

  const lower = normalizeKey(country);
  for (const [key, url] of Object.entries(COUNTRY_IMAGES)) {
    const keyNorm = normalizeKey(key);
    if (keyNorm === lower || lower.includes(keyNorm) || keyNorm.includes(lower)) return url;
  }
  return null;
}

function getStableFallback(seed: string): string {
  const hash = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return SAFE_TRAVEL_FALLBACKS[hash % SAFE_TRAVEL_FALLBACKS.length];
}

export function getDestinationImageWithConfidence(
  destination: string,
  country?: string,
  region?: string,
): ImageResult {
  if (!destination || destination.trim().length === 0) {
    console.log('[DestinationImages] Empty destination, using fallback');
    return { url: DEFAULT_FALLBACK_IMAGE, confidence: 'low' };
  }

  const exact = findExactMatch(destination);
  if (exact) {
    console.log('[DestinationImages] Exact match for:', destination);
    return { url: exact, confidence: 'high' };
  }

  const fuzzy = findFuzzyMatch(destination);
  if (fuzzy) {
    console.log('[DestinationImages] Fuzzy match for:', destination);
    return { url: fuzzy, confidence: 'high' };
  }

  if (country) {
    const countryImg = findCountryMatch(country);
    if (countryImg) {
      console.log('[DestinationImages] Country match for:', destination, '/', country);
      return { url: countryImg, confidence: 'medium' };
    }
  }

  if (region && REGION_FALLBACK_IMAGES[region]) {
    console.log('[DestinationImages] Region fallback for:', destination, '/', region);
    return { url: REGION_FALLBACK_IMAGES[region], confidence: 'medium' };
  }

  console.log('[DestinationImages] No match for:', destination, '- using stable fallback');
  return { url: getStableFallback(destination), confidence: 'low' };
}

export function getDestinationImage(destination: string, fallbackId?: string): string {
  const result = getDestinationImageWithConfidence(destination);
  if (result.confidence === 'low' && fallbackId) {
    return getStableFallback(fallbackId);
  }
  return result.url;
}

export function getDestinationImageHQ(destination: string, country?: string): string {
  const result = getDestinationImageWithConfidence(destination, country);
  return result.url.replace('w=800&h=500', 'w=1600&h=900');
}

export function getImageConfidence(destination: string, country?: string): ImageConfidence {
  return getDestinationImageWithConfidence(destination, country).confidence;
}
