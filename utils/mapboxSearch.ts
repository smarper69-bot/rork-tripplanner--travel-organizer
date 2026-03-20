const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || process.env.MAPBOX_ACCESS_TOKEN || '';

export interface MapboxPlace {
  id: string;
  name: string;
  country: string;
  region?: string;
  coordinates: { latitude: number; longitude: number };
  placeType: string;
}

export async function searchPlaces(query: string): Promise<MapboxPlace[]> {
  if (!query || query.trim().length < 2) {
    console.log('[MapboxSearch] Query too short, skipping');
    return [];
  }

  const encoded = encodeURIComponent(query.trim());
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${MAPBOX_TOKEN}&types=place,locality,region,district&limit=8&language=en`;

  console.log('[MapboxSearch] Searching for:', query);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log('[MapboxSearch] API error:', response.status);
      return [];
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      console.log('[MapboxSearch] No results for:', query);
      return [];
    }

    const results: MapboxPlace[] = data.features.map((feature: any) => {
      const contextCountry = feature.context?.find((c: any) => c.id?.startsWith('country'));
      const contextRegion = feature.context?.find((c: any) => c.id?.startsWith('region'));

      const placeName = feature.text || feature.place_name?.split(',')[0] || query;
      const country = contextCountry?.text || feature.place_name?.split(',').pop()?.trim() || '';
      const region = contextRegion?.text;

      return {
        id: feature.id,
        name: placeName,
        country,
        region,
        coordinates: {
          latitude: feature.center[1],
          longitude: feature.center[0],
        },
        placeType: feature.place_type?.[0] || 'place',
      };
    });

    console.log('[MapboxSearch] Found', results.length, 'results');
    return results;
  } catch (error) {
    console.log('[MapboxSearch] Error:', error);
    return [];
  }
}
