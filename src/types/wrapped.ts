export interface WrappedCity {
  city: string;
  regionCountry: string;
  lat: number;
  lng: number;
  firstVisited?: string;
  dates?: string[];
}

export interface WrappedFlight {
  date: string;
  from: string;
  to: string;
}

export interface WrappedDrivingMonth {
  month: string;
  miles: number;
}

export interface WrappedStepsMonth {
  month: string;
  total: number;
  sourceMix: string;
}

export interface WrappedData {
  $schema: string;
  schemaVersion: 1;
  year: number;
  example: boolean;
  updatedThrough: string;
  cities: WrappedCity[];
  flights: {
    segments: WrappedFlight[];
    totalMiles: number;
  };
  driving: {
    monthlyMiles: WrappedDrivingMonth[];
  };
  steps: {
    monthly: WrappedStepsMonth[];
    yearlyTotal: number;
  };
}
