export interface WrappedVisit {
  start: string;
  end: string;
}

export interface WrappedCity {
  city: string;
  regionCountry: string;
  lat: number;
  lng: number;
  source: "curated" | "timeline";
  firstVisited?: string;
  dates?: WrappedVisit[];
}

export interface WrappedFlight {
  date: string;
  endDate: string;
  from: string;
  to: string;
  miles: number;
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
  schemaVersion: 2;
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
    updatedThrough: string;
    daysTracked: number;
    dailyAverage: number;
    bestDay: {
      date: string;
      steps: number;
    };
  };
}
