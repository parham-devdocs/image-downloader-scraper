export type WeatherData = {
    location: {
        name: string; // Name of the location (e.g., "London")
        region: string; // Region or administrative area (e.g., "City of London, Greater London")
        country: string; // Country name (e.g., "United Kingdom")
        lat: number; // Latitude coordinate
        lon: number; // Longitude coordinate
        tz_id: string; // Timezone ID (e.g., "Europe/London")
        localtime_epoch: number; // Local time in Unix timestamp format
        localtime: string; // Local time in human-readable format (e.g., "2025-02-06 07:36")
    };
    current: {
        last_updated_epoch: number; // Last updated time in Unix timestamp format
        last_updated: string; // Last updated time in human-readable format (e.g., "2025-02-06 07:30")
        temp_c: number; // Temperature in Celsius
        temp_f: number; // Temperature in Fahrenheit
        is_day: number; // Indicates whether it is daytime (1) or nighttime (0)
        condition: {
            text: string; // Description of the weather condition (e.g., "Mist")
            icon: string; // URL to the weather condition icon
            code: number; // Code representing the weather condition
        };
        wind_mph: number; // Wind speed in miles per hour
        wind_kph: number; // Wind speed in kilometers per hour
        wind_degree: number; // Wind direction in degrees
        wind_dir: string; // Wind direction as a compass point (e.g., "NNE")
        pressure_mb: number; // Atmospheric pressure in millibars
        pressure_in: number; // Atmospheric pressure in inches of mercury
        precip_mm: number; // Precipitation amount in millimeters
        precip_in: number; // Precipitation amount in inches
        humidity: number; // Relative humidity percentage
        cloud: number; // Cloud cover percentage
        feelslike_c: number; // Feels-like temperature in Celsius
        feelslike_f: number; // Feels-like temperature in Fahrenheit
        windchill_c: number; // Wind chill temperature in Celsius
        windchill_f: number; // Wind chill temperature in Fahrenheit
        heatindex_c: number; // Heat index temperature in Celsius
        heatindex_f: number; // Heat index temperature in Fahrenheit
        dewpoint_c: number; // Dew point temperature in Celsius
        dewpoint_f: number; // Dew point temperature in Fahrenheit
        vis_km: number; // Visibility distance in kilometers
        vis_miles: number; // Visibility distance in miles
        uv: number; // UV index
        gust_mph: number; // Wind gust speed in miles per hour
        gust_kph: number; // Wind gust speed in kilometers per hour
    };
};