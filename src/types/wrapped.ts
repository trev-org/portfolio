export interface WrappedVisit {
  start: string;
  end: string;
}

export interface WrappedCity {
  city: string;
  regionCountry: string;
  lat: number;
  lng: number;
  firstVisited?: string;
  dates?: WrappedVisit[];
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
    example: boolean;
    monthlyMiles: WrappedDrivingMonth[];
  };
  steps: {
    example: boolean;
    monthly: WrappedStepsMonth[];
    yearlyTotal: number;
  };
}
