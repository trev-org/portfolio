"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { geoGraticule10, geoNaturalEarth1, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { GeometryObject, Topology } from "topojson-specification";
import worldTopology from "world-atlas/countries-110m.json";
import styles from "../styles/wrapped.module.css";
import type { WrappedCity } from "../types/wrapped";

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 520;
const MAP_PADDING = 24;
const PIN_RADIUS = 6;
const PIN_MARGIN = PIN_RADIUS + 4;
const MIN_PIN_DISTANCE = PIN_RADIUS * 2 + 4;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const SEARCH_RADII = [0, 18, 28, 40, 54, 70];
const TOOLTIP_HEIGHT = 32;
const TOOLTIP_MARGIN = 6;
const TOOLTIP_GAP = 10;
const TOOLTIP_HORIZONTAL_PADDING = 8;

const sphere = { type: "Sphere" } as const;
const topology = worldTopology as unknown as Topology;
const countries = topology.objects.countries;
const land = feature(topology, topology.objects.land);
const countryBorders = mesh(
  topology,
  countries as GeometryObject,
  (countryA, countryB) => countryA !== countryB,
);
const graticule = geoGraticule10();
const projection = geoNaturalEarth1().fitExtent(
  [
    [MAP_PADDING, MAP_PADDING],
    [MAP_WIDTH - MAP_PADDING, MAP_HEIGHT - MAP_PADDING],
  ],
  sphere,
);
const path = geoPath(projection);

type MapPin = {
  city: WrappedCity;
  index: number;
  anchorX: number;
  anchorY: number;
  x: number;
  y: number;
};

function distanceBetween(
  first: { x: number; y: number },
  second: { x: number; y: number },
) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function isValidPinPosition(
  candidate: { x: number; y: number },
  placedPins: MapPin[],
) {
  const insideMap =
    candidate.x >= PIN_MARGIN &&
    candidate.x <= MAP_WIDTH - PIN_MARGIN &&
    candidate.y >= PIN_MARGIN &&
    candidate.y <= MAP_HEIGHT - PIN_MARGIN;

  return (
    insideMap &&
    placedPins.every(
      (placedPin) =>
        distanceBetween(candidate, placedPin) >= MIN_PIN_DISTANCE,
    )
  );
}

function layoutPins(cities: WrappedCity[]) {
  return cities.reduce<MapPin[]>((placedPins, city, index) => {
    const projected = projection([city.lng, city.lat]);

    if (!projected) {
      return placedPins;
    }

    const [anchorX, anchorY] = projected;
    const candidates = SEARCH_RADII.flatMap((radius) => {
      if (radius === 0) {
        return [{ x: anchorX, y: anchorY }];
      }

      return Array.from({ length: 24 }, (_, step) => {
        const angle = index * GOLDEN_ANGLE + (step / 24) * Math.PI * 2;

        return {
          x: anchorX + Math.cos(angle) * radius,
          y: anchorY + Math.sin(angle) * radius,
        };
      });
    });
    const position =
      candidates.find((candidate) =>
        isValidPinPosition(candidate, placedPins),
      ) ?? { x: anchorX, y: anchorY };

    placedPins.push({
      city,
      index,
      anchorX,
      anchorY,
      ...position,
    });

    return placedPins;
  }, []);
}

function getLeaderEnd(pin: MapPin) {
  const deltaX = pin.x - pin.anchorX;
  const deltaY = pin.y - pin.anchorY;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance <= PIN_RADIUS) {
    return null;
  }

  const pinEdgeOffset = PIN_RADIUS + 1;

  return {
    x: pin.x - (deltaX / distance) * pinEdgeOffset,
    y: pin.y - (deltaY / distance) * pinEdgeOffset,
  };
}

function getTooltipLayout(pin: MapPin, width: number) {
  const preferredLeft = pin.x - width / 2;
  const left = Math.min(
    Math.max(preferredLeft, TOOLTIP_MARGIN),
    MAP_WIDTH - width - TOOLTIP_MARGIN,
  );
  const preferredTop =
    pin.y - TOOLTIP_HEIGHT - PIN_RADIUS - TOOLTIP_GAP;
  const top =
    preferredTop >= TOOLTIP_MARGIN
      ? preferredTop
      : pin.y + PIN_RADIUS + TOOLTIP_GAP;

  return {
    x: left,
    y: top,
    width,
  };
}

function getLocationLabel(city: WrappedCity) {
  const regionParts = city.regionCountry
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const country = regionParts.at(-1);

  if (country === "US" || country === "USA" || country === "United States") {
    const state = regionParts.at(-2);
    return state ? `${city.city}, ${state}` : city.city;
  }

  return country ? `${city.city}, ${country}` : city.city;
}

export default function WrappedMap({ cities }: { cities: WrappedCity[] }) {
  const [hoveredPinIndex, setHoveredPinIndex] = useState<number | null>(null);
  const [focusedPinIndex, setFocusedPinIndex] = useState<number | null>(null);
  const [tooltipTextWidth, setTooltipTextWidth] = useState<number | null>(null);
  const tooltipTextRef = useRef<SVGTextElement>(null);
  const pins = layoutPins(cities);
  const activePinIndex = hoveredPinIndex ?? focusedPinIndex;
  const activePin = pins.find((pin) => pin.index === activePinIndex);
  const activeLabel = activePin ? getLocationLabel(activePin.city) : "";
  const estimatedTextWidth = activeLabel.length * 6;
  const tooltipWidth =
    (tooltipTextWidth ?? estimatedTextWidth) +
    TOOLTIP_HORIZONTAL_PADDING * 2;
  const activeTooltip = activePin
    ? getTooltipLayout(activePin, tooltipWidth)
    : null;

  useLayoutEffect(() => {
    let cancelled = false;

    const measureTooltip = () => {
      if (!cancelled && tooltipTextRef.current) {
        setTooltipTextWidth(tooltipTextRef.current.getComputedTextLength());
      }
    };

    measureTooltip();
    void document.fonts.ready.then(measureTooltip);

    return () => {
      cancelled = true;
    };
  }, [activeLabel]);

  return (
    <svg
      className={styles.map}
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      role="group"
      aria-label="Cities visited"
      aria-describedby="wrapped-map-description"
    >
      <desc id="wrapped-map-description">
        A world map with one pin for every city visited. Hover or focus a pin
        to see its location.
      </desc>

      <path
        className={styles.mapSphere}
        d={path(sphere) ?? undefined}
        aria-hidden="true"
      />
      <path
        className={styles.mapGraticule}
        d={path(graticule) ?? undefined}
        aria-hidden="true"
      />
      <path
        className={styles.mapLand}
        d={path(land) ?? undefined}
        aria-hidden="true"
      />
      <path
        className={styles.mapBorders}
        d={path(countryBorders) ?? undefined}
        aria-hidden="true"
      />
      {cities.length === 0 && (
        <text
          className={styles.emptyMap}
          x={MAP_WIDTH / 2}
          y={MAP_HEIGHT / 2}
          textAnchor="middle"
        >
          No cities added yet.
        </text>
      )}

      <g className={styles.mapLeaders} aria-hidden="true">
        {pins.map((pin) => {
          const leaderEnd = getLeaderEnd(pin);

          return (
            leaderEnd && (
              <line
                key={`leader-${pin.city.city}-${pin.index}`}
                x1={pin.anchorX}
                y1={pin.anchorY}
                x2={leaderEnd.x}
                y2={leaderEnd.y}
              />
            )
          );
        })}
      </g>

      <g className={styles.mapAnchors} aria-hidden="true">
        {pins.map((pin) => (
          <circle
            key={`anchor-${pin.city.city}-${pin.index}`}
            cx={pin.anchorX}
            cy={pin.anchorY}
            r="2.5"
          />
        ))}
      </g>

      <g className={styles.mapPins}>
        {pins.map((pin) => {
          const label = getLocationLabel(pin.city);

          return (
            <g
              key={`${pin.city.city}-${pin.city.regionCountry}-${pin.index}`}
              className={styles.mapPin}
              transform={`translate(${pin.x} ${pin.y})`}
              aria-label={label}
              role="img"
              tabIndex={0}
              onMouseEnter={() => setHoveredPinIndex(pin.index)}
              onMouseLeave={() => setHoveredPinIndex(null)}
              onFocus={() => setFocusedPinIndex(pin.index)}
              onBlur={() => setFocusedPinIndex(null)}
            >
              <circle className={styles.mapPinHalo} r="10" />
              <circle className={styles.mapPinDot} r={PIN_RADIUS} />
            </g>
          );
        })}
      </g>

      {activePin && activeTooltip && (
        <g
          key={activePin.index}
          className={styles.mapTooltip}
          transform={`translate(${activeTooltip.x} ${activeTooltip.y})`}
          aria-hidden="true"
        >
          <rect
            width={activeTooltip.width}
            height={TOOLTIP_HEIGHT}
            rx="7"
          />
          <text
            ref={tooltipTextRef}
            className={styles.mapTooltipTitle}
            x={TOOLTIP_HORIZONTAL_PADDING}
            y="21"
          >
            {activeLabel}
          </text>
        </g>
      )}
    </svg>
  );
}
