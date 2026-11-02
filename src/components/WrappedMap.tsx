import styles from "../styles/wrapped.module.css";
import type { WrappedCity } from "../types/wrapped";

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 500;
const PIN_MARGIN = 12;

function projectCity(city: WrappedCity) {
  const x = ((city.lng + 180) / 360) * MAP_WIDTH;
  const y = ((90 - city.lat) / 180) * MAP_HEIGHT;

  return {
    x: Math.min(Math.max(x, PIN_MARGIN), MAP_WIDTH - PIN_MARGIN),
    y: Math.min(Math.max(y, PIN_MARGIN), MAP_HEIGHT - PIN_MARGIN),
  };
}

export default function WrappedMap({ cities }: { cities: WrappedCity[] }) {
  return (
    <svg
      className={styles.map}
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      role="img"
      aria-labelledby="wrapped-map-title wrapped-map-description"
    >
      <title id="wrapped-map-title">Cities visited</title>
      <desc id="wrapped-map-description">
        A world map with one numbered pin for every city in the city list.
      </desc>

      <g className={styles.mapGrid} aria-hidden="true">
        {[125, 250, 375, 500, 625, 750, 875].map((x) => (
          <line key={`longitude-${x}`} x1={x} x2={x} y1="0" y2={MAP_HEIGHT} />
        ))}
        {[125, 250, 375].map((y) => (
          <line key={`latitude-${y}`} x1="0" x2={MAP_WIDTH} y1={y} y2={y} />
        ))}
      </g>

      <g className={styles.land} aria-hidden="true">
        <path d="M53 111 91 73l69-28 83 15 54 46-19 42-46 4-19 35-36 13-8 38-29 7-17-37-40-24-28-32Z" />
        <path d="m208 226 45 26 31 51-11 52-27 66-28 40-19-35 5-64-22-56 8-52Z" />
        <path d="m121 55 27-31 61 4 18 25-35 24-51 1Z" />
        <path d="m443 111 27-29 44-4 31 20-15 30-40 6-21 28-32-9Z" />
        <path d="m459 160 58-25 63 36 12 70-27 92-42 61-34-30-9-78-35-52Z" />
        <path d="m526 80 91-35 116 14 88 44 114 21-11 55-75 12-55 50-63-18-55 14-45-48-53-5-34-43Z" />
        <path d="m760 278 42-30 69 7 46 42-17 63-72 20-59-39Z" />
        <path d="m914 391 23-19 26 8-8 24-31 12Z" />
        <path d="m0 477 132-18 144 13 135-16 150 20 154-18 151 15 134-10v37H0Z" />
      </g>

      <g className={styles.mapPins}>
        {cities.map((city, index) => {
          const { x, y } = projectCity(city);
          const label = `${index + 1}. ${city.city}, ${city.regionCountry}`;

          return (
            <g
              key={`${city.city}-${city.regionCountry}-${index}`}
              className={styles.mapPin}
              transform={`translate(${x} ${y})`}
              aria-label={label}
            >
              <title>{label}</title>
              <circle className={styles.mapPinHalo} r="13" />
              <circle className={styles.mapPinDot} r="8" />
              <text x="0" y="3.25" textAnchor="middle">
                {index + 1}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
