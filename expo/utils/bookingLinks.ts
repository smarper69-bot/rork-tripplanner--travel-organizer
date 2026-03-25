import { Linking } from 'react-native';

const BOOKING_AFFILIATE_ID = 'YOUR_BOOKING_AFF_ID';
const FLIGHTS_AFFILIATE_ID = 'YOUR_FLIGHTS_AFF_ID';

function formatDateForBooking(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

export function buildHotelSearchUrl(params: {
  city: string;
  country?: string;
  checkIn?: string;
  checkOut?: string;
}): string {
  const { city, country, checkIn, checkOut } = params;
  const destination = country ? `${city}, ${country}` : city;
  const base = 'https://www.booking.com/searchresults.html';
  const query = new URLSearchParams({
    ss: destination,
    aid: BOOKING_AFFILIATE_ID,
  });
  if (checkIn) query.set('checkin', formatDateForBooking(checkIn));
  if (checkOut) query.set('checkout', formatDateForBooking(checkOut));
  return `${base}?${query.toString()}`;
}

export function buildFlightSearchUrl(params: {
  city: string;
  country?: string;
  departDate?: string;
  returnDate?: string;
}): string {
  const { city, country, departDate, returnDate } = params;
  const destination = country ? `${city}, ${country}` : city;
  const base = 'https://www.skyscanner.com/transport/flights';
  const query = new URLSearchParams({
    query: destination,
    aid: FLIGHTS_AFFILIATE_ID,
  });
  if (departDate) query.set('odate', formatDateForBooking(departDate));
  if (returnDate) query.set('idate', formatDateForBooking(returnDate));
  return `${base}?${query.toString()}`;
}

export async function openHotelSearch(params: {
  city: string;
  country?: string;
  checkIn?: string;
  checkOut?: string;
}): Promise<void> {
  const url = buildHotelSearchUrl(params);
  console.log('[BookingLinks] Opening hotel search:', url);
  try {
    await Linking.openURL(url);
  } catch (e) {
    console.error('[BookingLinks] Failed to open hotel URL:', e);
  }
}

export async function openFlightSearch(params: {
  city: string;
  country?: string;
  departDate?: string;
  returnDate?: string;
}): Promise<void> {
  const url = buildFlightSearchUrl(params);
  console.log('[BookingLinks] Opening flight search:', url);
  try {
    await Linking.openURL(url);
  } catch (e) {
    console.error('[BookingLinks] Failed to open flight URL:', e);
  }
}
