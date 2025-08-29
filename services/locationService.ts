import * as Location from 'expo-location';

// Location Service Initializer (ported from Android LocationServiceInitializer.kt)
export class LocationServiceInitializer {
  private static instance: LocationServiceInitializer;
  private locationPermission: Location.PermissionStatus | null = null;

  private constructor() {}

  public static getInstance(): LocationServiceInitializer {
    if (!LocationServiceInitializer.instance) {
      LocationServiceInitializer.instance = new LocationServiceInitializer();
    }
    return LocationServiceInitializer.instance;
  }

  // Check if location services are available (Android equivalent)
  public async isLocationServicesAvailable(): Promise<boolean> {
    try {
      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        console.log('🧪 Location services are disabled');
        return false;
      }

      // Check permissions
      const { status } = await Location.getForegroundPermissionsAsync();
      this.locationPermission = status;
      
      return status === Location.PermissionStatus.GRANTED;
    } catch (error) {
      console.error('🧪 Error checking location services:', error);
      return false;
    }
  }

  // Safe location service initialization (matches Android implementation)
  public async initializeLocationServices(): Promise<boolean> {
    try {
      // Check if location services are available
      if (!(await this.isLocationServicesAvailable())) {
        console.log('🧪 Location services not available');
        return false;
      }

      // Request permissions if not granted
      if (this.locationPermission !== Location.PermissionStatus.GRANTED) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        this.locationPermission = status;
        
        if (status !== Location.PermissionStatus.GRANTED) {
          console.log('🧪 Location permission denied');
          return false;
        }
      }

      // Test location accuracy
      const accuracy = await this.getLocationAccuracy();
      console.log('🧪 Location accuracy:', accuracy);
      
      return true;
    } catch (error) {
      console.error('🧪 Error initializing location services:', error);
      return false;
    }
  }

  // Get current location with high accuracy
  public async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      if (!(await this.isLocationServicesAvailable())) {
        throw new Error('Location services not available');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 10000, // 10 seconds
        distanceInterval: 10, // 10 meters
      });

      return location;
    } catch (error) {
      console.error('🧪 Error getting current location:', error);
      return null;
    }
  }

  // Get location accuracy (Android equivalent)
  private async getLocationAccuracy(): Promise<string> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 5,
      });

      if (location.coords.accuracy && location.coords.accuracy <= 5) {
        return 'HIGH';
      } else if (location.coords.accuracy && location.coords.accuracy <= 20) {
        return 'MEDIUM';
      } else {
        return 'LOW';
      }
    } catch (error) {
      return 'UNKNOWN';
    }
  }

  // Watch location changes
  public async watchLocation(
    callback: (location: Location.LocationObject) => void,
    options: {
      accuracy?: Location.Accuracy;
      timeInterval?: number;
      distanceInterval?: number;
    } = {}
  ): Promise<() => void> {
    try {
      if (!(await this.isLocationServicesAvailable())) {
        throw new Error('Location services not available');
      }

      const defaultOptions = {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 10,
        ...options,
      };

      const subscription = await Location.watchPositionAsync(
        defaultOptions,
        callback
      );

      // Return unsubscribe function
      return () => subscription.remove();
    } catch (error) {
      console.error('🧪 Error watching location:', error);
      return () => {}; // Return empty function if error
    }
  }

  // Get location from coordinates (reverse geocoding)
  public async getLocationFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<{
    city?: string;
    state?: string;
    country?: string;
    address?: string;
  }> {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const location = reverseGeocode[0];
        return {
          city: location.city,
          state: location.region,
          country: location.country,
          address: `${location.street}, ${location.city}, ${location.region}`,
        };
      }

      return {};
    } catch (error) {
      console.error('🧪 Error reverse geocoding:', error);
      return {};
    }
  }

  // Calculate distance between two coordinates
  public calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Check if location permission is granted
  public isLocationPermissionGranted(): boolean {
    return this.locationPermission === Location.PermissionStatus.GRANTED;
  }

  // Request location permissions
  public async requestLocationPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.locationPermission = status;
      return status === Location.PermissionStatus.GRANTED;
    } catch (error) {
      console.error('🧪 Error requesting location permissions:', error);
      return false;
    }
  }
}

export default LocationServiceInitializer.getInstance();
