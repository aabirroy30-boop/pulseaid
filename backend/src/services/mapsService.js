// src/services/mapsService.js
'use strict';

const axios      = require('axios');
const { logger } = require('../utils/logger');

const ORS_BASE = 'https://api.openrouteservice.org';

const getKey = () => {
  const key = process.env.ORS_API_KEY;
  if (!key) throw new Error('ORS_API_KEY environment variable is not set');
  return key;
};

// ── Profile map (mode → ORS profile) ─────────────────────────────────────────
const PROFILES = {
  driving:   'driving-car',
  walking:   'foot-walking',
  cycling:   'cycling-regular',
  bicycling: 'cycling-regular',
};

// ── Directions ────────────────────────────────────────────────────────────────
/**
 * Get turn-by-turn directions between two coordinates.
 *
 * @param {object} options
 * @param {{lat: number, lng: number}} options.origin
 * @param {{lat: number, lng: number}} options.destination
 * @param {string} [options.mode='driving']
 * @returns {Promise<object>}
 */
const getDirections = async ({ origin, destination, mode = 'driving' }) => {
  try {
    const profile  = PROFILES[mode] || 'driving-car';

    const response = await axios.post(
      `${ORS_BASE}/v2/directions/${profile}/json`,
      {
        coordinates: [
          [origin.lng,      origin.lat],
          [destination.lng, destination.lat],
        ],
        instructions:       true,
        units:              'km',
        language:           'en',
      },
      {
        headers: {
          Authorization: getKey(),
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    const route   = response.data.routes?.[0];
    const summary = route?.summary;
    const steps   = route?.segments?.[0]?.steps || [];

    return {
      status:          'OK',
      distanceKm:      parseFloat((summary?.distance || 0).toFixed(2)),
      durationMinutes: Math.ceil((summary?.duration || 0) / 60),
      distance: {
        text:  `${parseFloat((summary?.distance || 0).toFixed(2))} km`,
        value: Math.round((summary?.distance || 0) * 1000),
      },
      duration: {
        text:  `${Math.ceil((summary?.duration || 0) / 60)} mins`,
        value: Math.round(summary?.duration || 0),
      },
      steps: steps.map((s) => ({
        instruction: s.instruction,
        distanceKm:  parseFloat((s.distance || 0).toFixed(2)),
        durationMin: Math.ceil((s.duration || 0) / 60),
        type:        s.type,
        name:        s.name || '',
      })),
      // Encoded polyline for map rendering
      geometry: route?.geometry,
      bbox:     response.data.bbox,
    };
  } catch (error) {
    logger.error('getDirections error:', error.response?.data || error.message);
    throw new Error(`Directions failed: ${error.response?.data?.error?.message || error.message}`);
  }
};

// ── ETA ───────────────────────────────────────────────────────────────────────
/**
 * Get estimated time and distance between two points.
 *
 * @param {{lat: number, lng: number}} origin
 * @param {{lat: number, lng: number}} destination
 * @param {string} [mode='driving']
 * @returns {Promise<object>}
 */
const getETA = async (origin, destination, mode = 'driving') => {
  try {
    const profile  = PROFILES[mode] || 'driving-car';

    const response = await axios.post(
      `${ORS_BASE}/v2/matrix/${profile}`,
      {
        locations: [
          [origin.lng,      origin.lat],
          [destination.lng, destination.lat],
        ],
        metrics:   ['distance', 'duration'],
        units:     'km',
      },
      {
        headers: {
          Authorization: getKey(),
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    const distanceKm      = parseFloat((response.data.distances?.[0]?.[1] || 0).toFixed(2));
    const durationSeconds = response.data.durations?.[0]?.[1] || 0;
    const durationMinutes = Math.ceil(durationSeconds / 60);

    return {
      status:          'OK',
      distanceKm,
      durationMinutes,
      distance: {
        text:  `${distanceKm} km`,
        value: Math.round(distanceKm * 1000),
      },
      duration: {
        text:  `${durationMinutes} mins`,
        value: Math.round(durationSeconds),
      },
    };
  } catch (error) {
    logger.error('getETA error:', error.response?.data || error.message);
    throw new Error(`ETA failed: ${error.response?.data?.error?.message || error.message}`);
  }
};

// ── Geocode (address → coordinates) ──────────────────────────────────────────
/**
 * Convert a text address to coordinates using Nominatim (OpenStreetMap).
 * No API key needed for Nominatim.
 *
 * @param {string} address
 * @returns {Promise<object>}
 */
const geocodeAddress = async (address) => {
  try {
    const response = await axios.get(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          q:              address,
          format:         'json',
          addressdetails: 1,
          limit:          1,
        },
        headers: {
          // Nominatim requires a User-Agent
          'User-Agent': 'PulseAid/1.0 (blood donation app)',
        },
        timeout: 10000,
      }
    );

    const result = response.data?.[0];
    if (!result) throw new Error(`No results found for: ${address}`);

    return {
      lat:              parseFloat(result.lat),
      lng:              parseFloat(result.lon),
      formattedAddress: result.display_name,
      city:             result.address?.city || result.address?.town || result.address?.village || '',
      state:            result.address?.state || '',
      country:          result.address?.country || '',
      postalCode:       result.address?.postcode || '',
    };
  } catch (error) {
    logger.error('geocodeAddress error:', error.message);
    throw new Error(`Geocoding failed: ${error.message}`);
  }
};

// ── Reverse Geocode (coordinates → address) ───────────────────────────────────
/**
 * Convert coordinates to a human-readable address using Nominatim.
 *
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<object>}
 */
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get(
      'https://nominatim.openstreetmap.org/reverse',
      {
        params: {
          lat,
          lon:    lng,
          format: 'json',
        },
        headers: {
          'User-Agent': 'PulseAid/1.0 (blood donation app)',
        },
        timeout: 10000,
      }
    );

    const result = response.data;
    if (result.error) throw new Error(result.error);

    return {
      formattedAddress: result.display_name,
      city:             result.address?.city || result.address?.town || result.address?.village || '',
      state:            result.address?.state || '',
      country:          result.address?.country || '',
      postalCode:       result.address?.postcode || '',
      placeId:          result.osm_id?.toString() || '',
    };
  } catch (error) {
    logger.error('reverseGeocode error:', error.message);
    throw new Error(`Reverse geocoding failed: ${error.message}`);
  }
};

// ── Find Nearby Places ────────────────────────────────────────────────────────
/**
 * Find nearby hospitals/blood banks using Nominatim + Overpass API (OpenStreetMap).
 *
 * @param {number} lat
 * @param {number} lng
 * @param {string} [type='hospital']  – hospital | blood_bank | clinic
 * @param {number} [radius=5000]      – metres
 * @returns {Promise<Array>}
 */
const findNearbyPlaces = async (lat, lng, type = 'hospital', radius = 5000) => {
  try {
    // Map type to OpenStreetMap amenity tag
    const amenityMap = {
      hospital:   'hospital',
      blood_bank: 'blood_bank',
      clinic:     'clinic',
      pharmacy:   'pharmacy',
    };
    const amenity = amenityMap[type] || 'hospital';

    // Overpass API query
    const query = `
      [out:json][timeout:25];
      node["amenity"="${amenity}"](around:${radius},${lat},${lng});
      out body;
    `;

    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      query,
      {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 15000,
      }
    );

    return (response.data.elements || []).map((place) => ({
      name:    place.tags?.name || 'Unknown',
      lat:     place.lat,
      lng:     place.lon,
      address: [
        place.tags?.['addr:street'],
        place.tags?.['addr:city'],
      ].filter(Boolean).join(', '),
      phone:   place.tags?.phone || place.tags?.['contact:phone'] || null,
      placeId: place.id?.toString(),
      type:    amenity,
    }));
  } catch (error) {
    logger.error('findNearbyPlaces error:', error.message);
    throw new Error(`Nearby places search failed: ${error.message}`);
  }
};

module.exports = {
  getDirections,
  getETA,
  geocodeAddress,
  reverseGeocode,
  findNearbyPlaces,
};