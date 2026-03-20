import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import { DiscoverDestination, TripType, Region } from '@/mocks/destinations';
import { MapboxPlace } from '@/utils/mapboxSearch';
import { getDestinationImageWithConfidence } from '@/utils/destinationImages';
import { DestinationIcon } from '@/types/trip';

const destinationSchema = z.object({
  description: z.string().describe('A short 1-2 sentence factual description of the destination'),
  whyGo: z.string().describe('A 2-3 sentence explanation of why someone should visit this destination'),
  tags: z.array(z.string()).describe('3-6 relevant travel tags like Nature, Food, Culture, Adventure, Beach, History, Nightlife, Shopping, Architecture, Wildlife'),
  tripTypes: z.array(z.string()).describe('2-4 trip types from: beach, adventure, city, culture, food, nature, romantic, family, solo, luxury, budget'),
  avgDailyCost: z.number().describe('Estimated average daily cost in USD for a mid-range traveler'),
  bestMonths: z.array(z.number()).describe('Best months to visit (1-12)'),
  highlights: z.array(z.string()).describe('3-5 top landmarks or attractions'),
  region: z.string().describe('Region: europe, asia, north-america, south-america, africa, oceania, middle-east, or caribbean'),
  icon: z.string().describe('Icon type: landmark, sun, mountain, snowflake, store, trees, or palm-tree'),
});

function getImageForPlace(name: string, country: string): string {
  const result = getDestinationImageWithConfidence(name, country);
  if (result.confidence !== 'low') {
    console.log('[DestGen] Found curated image for:', name, 'confidence:', result.confidence);
    return result.url;
  }

  const unsplashUrl = `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop&q=80`;
  console.log('[DestGen] Using fallback image for:', name);
  return unsplashUrl;
}

export async function generateDestinationInfo(
  place: MapboxPlace,
): Promise<DiscoverDestination> {
  const cacheId = `search_${place.id}`;

  console.log('[DestGen] Generating info for:', place.name, place.country);

  try {
    const result = await generateObject({
      messages: [
        {
          role: 'user',
          content: `Provide travel information about ${place.name}, ${place.country}${place.region ? ` (${place.region})` : ''}. Be factual and concise. Give realistic daily cost estimates in USD.`,
        },
      ],
      schema: destinationSchema,
    });

    const validTripTypes = ['beach', 'adventure', 'city', 'culture', 'food', 'nature', 'romantic', 'family', 'solo', 'luxury', 'budget'] as const;
    const validRegions = ['europe', 'asia', 'north-america', 'south-america', 'africa', 'oceania', 'middle-east', 'caribbean'] as const;
    const validIcons = ['landmark', 'sun', 'mountain', 'snowflake', 'store', 'trees', 'palm-tree'] as const;

    const tripTypes = (result.tripTypes || ['city', 'culture']).filter(
      (t): t is TripType => validTripTypes.includes(t as any)
    ) as TripType[];

    const region = validRegions.includes(result.region as any)
      ? (result.region as Region)
      : 'europe';

    const icon = validIcons.includes(result.icon as any)
      ? (result.icon as DestinationIcon)
      : 'landmark';

    const imageUrl = getImageForPlace(place.name, place.country);

    const destination: DiscoverDestination = {
      id: cacheId,
      city: place.name,
      country: place.country,
      region,
      avgDailyCost: result.avgDailyCost || 100,
      bestMonths: result.bestMonths || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      tripTypes: tripTypes.length > 0 ? tripTypes : ['city', 'culture'],
      popularityScore: 75,
      imageUrl,
      icon,
      iconColor: '#1A1A1A',
      description: result.description || `Discover the beauty of ${place.name}, ${place.country}.`,
      highlights: result.highlights || [`${place.name} City Center`, 'Local Markets', 'Historic Quarter'],
      coordinates: place.coordinates,
      tags: result.tags || ['Travel', 'Explore'],
      whyGo: result.whyGo || `${place.name} offers a unique travel experience in ${place.country}.`,
    };

    console.log('[DestGen] Generated destination:', destination.city, '- cost:', destination.avgDailyCost);
    return destination;
  } catch (error) {
    console.log('[DestGen] AI generation failed, using fallback:', error);
    return createFallbackDestination(place);
  }
}

function createFallbackDestination(place: MapboxPlace): DiscoverDestination {
  const imageUrl = getImageForPlace(place.name, place.country);

  return {
    id: `search_${place.id}`,
    city: place.name,
    country: place.country,
    region: 'europe',
    avgDailyCost: 100,
    bestMonths: [3, 4, 5, 9, 10, 11],
    tripTypes: ['city', 'culture'],
    popularityScore: 70,
    imageUrl,
    icon: 'landmark',
    iconColor: '#1A1A1A',
    description: `Discover ${place.name}, a destination in ${place.country} waiting to be explored.`,
    highlights: [`${place.name} City Center`, 'Local Culture', 'Regional Cuisine'],
    coordinates: place.coordinates,
    tags: ['Travel', 'Explore', 'Culture'],
    whyGo: `${place.name} in ${place.country} offers travelers a chance to experience local culture, cuisine, and history.`,
  };
}
