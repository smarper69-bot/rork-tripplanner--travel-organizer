function getMapboxToken(): string {
  const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || process.env.MAPBOX_ACCESS_TOKEN || '';
  return token;
}

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

  const token = getMapboxToken();
  console.log('[MapboxSearch] Token available:', token ? `yes (${token.substring(0, 8)}...)` : 'NO TOKEN');

  if (!token) {
    console.log('[MapboxSearch] No Mapbox token found. Set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN.');
    return [];
  }

  const encoded = encodeURIComponent(query.trim());
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${token}&types=place,locality,region,district&limit=8&language=en`;

  console.log('[MapboxSearch] Searching for:', query);
  console.log('[MapboxSearch] URL:', url.replace(token, 'TOKEN_HIDDEN'));

  try {
    const response = await fetch(url);
    console.log('[MapboxSearch] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('[MapboxSearch] API error body:', errorText);
      return [];
    }

    const data = await response.json();
    console.log('[MapboxSearch] Raw features count:', data.features?.length ?? 0);

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

    console.log('[MapboxSearch] Found', results.length, 'results:', results.map(r => r.name).join(', '));
    return results;
  } catch (error) {
    console.log('[MapboxSearch] Fetch error:', error);
    return [];
  }
}
