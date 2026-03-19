import { destinations, DiscoverDestination } from '@/mocks/destinations';
import { getDestinationImageWithConfidence, ImageConfidence, DEFAULT_FALLBACK_IMAGE } from '@/utils/destinationImages';

export interface ResolvedDestination {
  name: string;
  country: string;
  region: string;
  description: string;
  imageUrl: string;
  confidence: ImageConfidence;
  tags: string[];
  estimatedDailyBudget: number | null;
  coordinates: { latitude: number; longitude: number } | null;
  isKnown: boolean;
}

function normalizeForMatch(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

const ALIAS_MAP: Record<string, string> = {
  'costa rica': 'san jose',
  'safari kenya': 'masai mara',
  'angkor wat': 'siem reap',
  'angkor': 'siem reap',
  'machu pichu': 'machu picchu',
  'macchu picchu': 'machu picchu',
  'swiss alps': 'swiss alps',
  'alps': 'swiss alps',
  'amalfi': 'amalfi coast',
  'positano': 'amalfi coast',
  'ravello': 'amalfi coast',
  'oia': 'santorini',
  'fira': 'santorini',
  'ubud': 'bali',
  'seminyak': 'bali',
  'canggu': 'bali',
  'kuta': 'bali',
  'patong': 'phuket',
  'phi phi': 'phuket',
  'giza': 'cairo',
  'pyramids': 'cairo',
  'manhattan': 'new york',
  'brooklyn': 'new york',
  'hollywood': 'los angeles',
  'beverly hills': 'los angeles',
  'venice beach': 'los angeles',
  'shibuya': 'tokyo',
  'shinjuku': 'tokyo',
  'akihabara': 'tokyo',
  'montmartre': 'paris',
  'le marais': 'paris',
  'colosseum': 'rome',
  'vatican': 'rome',
  'trastevere': 'rome',
  'la rambla': 'barcelona',
  'gaudi': 'barcelona',
  'sagrada familia': 'barcelona',
  'stone town': 'zanzibar',
  'la boca': 'buenos aires',
  'palermo': 'buenos aires',
  'old town': 'dubrovnik',
  'gion': 'kyoto',
  'arashiyama': 'kyoto',
  'nyhavn': 'copenhagen',
  'tivoli': 'copenhagen',
  'myeongdong': 'seoul',
  'gangnam': 'seoul',
  'alfama': 'lisbon',
  'belem': 'lisbon',
  'medina': 'marrakech',
  'jemaa el fna': 'marrakech',
  'table mountain': 'cape town',
  'stanley park': 'vancouver',
  'bondi': 'sydney',
  'bondi beach': 'sydney',
  'marina bay': 'singapore',
  'gardens by the bay': 'singapore',
  'blue lagoon': 'reykjavik',
  'golden circle': 'reykjavik',
  'charles bridge': 'prague',
  'old town square': 'prague',
  'torres del paine': 'patagonia',
  'el chalten': 'patagonia',
  'perito moreno': 'patagonia',
};

function resolveAlias(input: string): string {
  const norm = normalizeForMatch(input);
  return ALIAS_MAP[norm] || input;
}

function findKnownDestination(city: string, country?: string): DiscoverDestination | null {
  const resolved = resolveAlias(city);
  const cityNorm = normalizeForMatch(resolved);
  const countryNorm = country ? normalizeForMatch(country) : '';

  let match = destinations.find(d => normalizeForMatch(d.city) === cityNorm);
  if (match) return match;

  match = destinations.find(d => {
    const dCity = normalizeForMatch(d.city);
    return dCity.includes(cityNorm) || cityNorm.includes(dCity);
  });
  if (match) return match;

  if (countryNorm) {
    match = destinations.find(d => {
      const dCountry = normalizeForMatch(d.country);
      return dCountry === countryNorm || dCountry.includes(countryNorm) || countryNorm.includes(dCountry);
    });
  }

  return match ?? null;
}

function generateSafeDescription(city: string, country: string): string {
  if (country) {
    return `Discover ${city}, ${country}. A destination waiting to be explored.`;
  }
  return `Discover ${city}. A destination waiting to be explored.`;
}

function inferTagsFromName(city: string, country: string): string[] {
  const combined = `${city} ${country}`.toLowerCase();
  const tags: string[] = ['travel'];

  const beachKeywords = ['beach', 'island', 'coast', 'bay', 'sea', 'ocean', 'tropical', 'resort', 'maldives', 'fiji', 'hawaii', 'cancun', 'phuket', 'zanzibar', 'seychelles', 'mauritius'];
  const mountainKeywords = ['mountain', 'alps', 'peak', 'highland', 'hill', 'everest', 'himalaya', 'andes', 'patagonia', 'queenstown'];
  const cityKeywords = ['city', 'york', 'london', 'tokyo', 'paris', 'berlin', 'mumbai', 'shanghai', 'delhi', 'bangkok', 'singapore', 'hong kong', 'seoul'];
  const cultureKeywords = ['temple', 'ancient', 'historic', 'old town', 'ruins', 'heritage', 'kyoto', 'rome', 'athens', 'petra', 'angkor', 'machu picchu'];
  const natureKeywords = ['forest', 'jungle', 'rainforest', 'park', 'national', 'safari', 'wildlife', 'costa rica', 'iceland', 'new zealand'];

  if (beachKeywords.some(k => combined.includes(k))) tags.push('beach');
  if (mountainKeywords.some(k => combined.includes(k))) tags.push('mountain');
  if (cityKeywords.some(k => combined.includes(k))) tags.push('city');
  if (cultureKeywords.some(k => combined.includes(k))) tags.push('culture');
  if (natureKeywords.some(k => combined.includes(k))) tags.push('nature');

  if (tags.length === 1) tags.push('explore');

  return tags;
}

export function resolveDestination(city: string, country?: string): ResolvedDestination {
  console.log('[DestResolver] Resolving:', city, country ?? '');

  const known = findKnownDestination(city, country);

  if (known) {
    console.log('[DestResolver] Found known destination:', known.city, known.country);
    const imageResult = getDestinationImageWithConfidence(known.city, known.country, known.region);
    return {
      name: known.city,
      country: known.country,
      region: known.region,
      description: known.description,
      imageUrl: known.imageUrl || imageResult.url,
      confidence: 'high',
      tags: known.tags,
      estimatedDailyBudget: known.avgDailyCost,
      coordinates: known.coordinates,
      isKnown: true,
    };
  }

  const safeCountry = country ?? '';
  const imageResult = getDestinationImageWithConfidence(city, safeCountry);

  console.log('[DestResolver] Unknown destination, confidence:', imageResult.confidence);

  return {
    name: city,
    country: safeCountry,
    region: '',
    description: generateSafeDescription(city, safeCountry),
    imageUrl: imageResult.url,
    confidence: imageResult.confidence,
    tags: inferTagsFromName(city, safeCountry),
    estimatedDailyBudget: null,
    coordinates: null,
    isKnown: false,
  };
}

export function resolveDestinationImage(city: string, country?: string): string {
  const resolved = resolveDestination(city, country);
  return resolved.imageUrl;
}

export function isDestinationReliable(city: string, country?: string): boolean {
  const resolved = resolveDestination(city, country);
  return resolved.confidence !== 'low';
}

export function getDestinationFallbackImage(): string {
  return DEFAULT_FALLBACK_IMAGE;
}

export function findDestinationById(id: string): DiscoverDestination | undefined {
  return destinations.find(d => d.id === id);
}

export function searchDestinations(query: string): DiscoverDestination[] {
  if (!query || query.trim().length === 0) return [];
  const norm = normalizeForMatch(query);
  return destinations.filter(d => {
    const cityNorm = normalizeForMatch(d.city);
    const countryNorm = normalizeForMatch(d.country);
    const tagMatch = d.tags.some(t => normalizeForMatch(t).includes(norm));
    return cityNorm.includes(norm) || countryNorm.includes(norm) || norm.includes(cityNorm) || tagMatch;
  });
}
