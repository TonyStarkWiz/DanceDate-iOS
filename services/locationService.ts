// Location Services for Web Version
// Mirrors the Android app's sophisticated location handling

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  locationName?: string;
  postalCode?: string;
  country?: string;
  city?: string;
  state?: string;
}

export interface PostalCodeData {
  code: string;
  country: string;
  isValid: boolean;
  locationName?: string;
}

// GPS Location Detection
export class LocationService {
  private static instance: LocationService;
  private defaultLocation: LocationData = {
    latitude: 27.6648, // Orlando, FL
    longitude: -81.5158,
    locationName: 'Orlando, FL',
    country: 'US'
  };

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Primary GPS method - mirrors Android's SmartLocationHandler
  async getCurrentLocation(): Promise<LocationData> {
    try {
      console.log('🧪 LocationService: Getting current location via GPS...');
      
      if (!navigator.geolocation) {
        console.log('🧪 LocationService: Geolocation not supported, using fallback');
        return this.getFallbackLocation();
      }

      const position = await this.getGeolocationPosition();
      
      // Validate location (ensure it's in target regions, not Berlin, etc.)
      if (this.isValidLocation(position.coords.latitude, position.coords.longitude)) {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          locationName: await this.reverseGeocode(position.coords.latitude, position.coords.longitude)
        };
        
        console.log('🧪 LocationService: GPS location obtained:', locationData);
        return locationData;
      } else {
        console.log('🧪 LocationService: Invalid location detected, using fallback');
        return this.getFallbackLocation();
      }
    } catch (error) {
      console.error('🧪 LocationService: GPS error:', error);
      return this.getFallbackLocation();
    }
  }

  private getGeolocationPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Location request timeout'));
      }, 5000); // 5 second timeout like Android

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          resolve(position);
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Fallback location method - mirrors Android's FallbackLocationHandler
  private async getFallbackLocation(): Promise<LocationData> {
    try {
      console.log('🧪 LocationService: Using IP-based fallback location...');
      
      // Try IP-based geolocation
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        const locationData: LocationData = {
          latitude: data.latitude,
          longitude: data.longitude,
          locationName: `${data.city}, ${data.region}`,
          country: data.country_code,
          city: data.city,
          state: data.region
        };
        
        console.log('🧪 LocationService: IP-based location obtained:', locationData);
        return locationData;
      }
    } catch (error) {
      console.error('🧪 LocationService: IP geolocation failed:', error);
    }
    
    console.log('🧪 LocationService: Using default Orlando location');
    return this.defaultLocation;
  }

  // Location validation - ensures location is in target regions
  private isValidLocation(lat: number, lng: number): boolean {
    // Check if location is in reasonable bounds (not Berlin, etc.)
    // US bounds: roughly 24-71 lat, -180 to -66 lng
    if (lat >= 24 && lat <= 71 && lng >= -180 && lng <= -66) {
      return true;
    }
    
    // Add other valid regions as needed
    return false;
  }

  // Simple reverse geocoding
  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.results && data.results[0]) {
        return data.results[0].formatted_address;
      }
    } catch (error) {
      console.error('🧪 LocationService: Reverse geocoding failed:', error);
    }
    
    // Fallback to coordinate-based location name
    return this.getLocationNameFromCoordinates(lat, lng);
  }

  private getLocationNameFromCoordinates(lat: number, lng: number): string {
    // Simplified location name based on coordinates
    if (lat > 40 && lat < 45 && lng > -80 && lng < -70) return 'New York';
    if (lat > 30 && lat < 35 && lng > -120 && lng < -110) return 'Los Angeles';
    if (lat > 40 && lat < 45 && lng > -90 && lng < -80) return 'Chicago';
    if (lat > 25 && lat < 30 && lng > -85 && lng < -75) return 'Florida';
    return 'United States';
  }
}

// Smart Postal Code System - mirrors Android's PostalCodeValidator
export class PostalCodeValidator {
  private static countryConfigs = {
    US: { pattern: /^\d{5}$/, name: 'United States' },
    UK: { pattern: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, name: 'United Kingdom' },
    DE: { pattern: /^\d{5}$/, name: 'Germany' },
    CA: { pattern: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, name: 'Canada' },
    FR: { pattern: /^\d{5}$/, name: 'France' },
    IT: { pattern: /^\d{5}$/, name: 'Italy' },
    ES: { pattern: /^\d{5}$/, name: 'Spain' },
    NL: { pattern: /^\d{4}\s?[A-Z]{2}$/i, name: 'Netherlands' },
    AU: { pattern: /^\d{4}$/, name: 'Australia' },
    // Add more countries as needed
  };

  static validatePostalCode(code: string, country: string): { isValid: boolean; message: string } {
    const config = this.countryConfigs[country as keyof typeof this.countryConfigs];
    
    if (!config) {
      return { isValid: false, message: 'Unsupported country' };
    }

    const isValid = config.pattern.test(code);
    const message = isValid ? 'Valid postal code' : `Invalid format for ${config.name}`;
    
    return { isValid, message };
  }

  static getSupportedCountries(): Array<{ code: string; name: string }> {
    return Object.entries(this.countryConfigs).map(([code, config]) => ({
      code,
      name: config.name
    }));
  }

  static formatPostalCode(code: string, country: string): string {
    // Add formatting logic for different countries
    switch (country) {
      case 'US':
        return code.replace(/(\d{5})/, '$1');
      case 'UK':
        return code.toUpperCase().replace(/([A-Z]{1,2})(\d[A-Z\d]?)\s?(\d[A-Z]{2})/, '$1 $2 $3');
      case 'CA':
        return code.toUpperCase().replace(/([A-Z]\d[A-Z])\s?(\d[A-Z]\d)/, '$1 $2');
      default:
        return code;
    }
  }
}

// Export singleton instance
export const locationService = LocationService.getInstance();
