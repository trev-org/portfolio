"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
const MOBILE_PIN_RADIUS = 8;
const MOBILE_PIN_DISTANCE = 36;
const MOBILE_PIN_HIT_RADIUS = 18;
const MOBILE_VIEW_ASPECT_RATIO = 1.45;
const MOBILE_VIEW_PADDING = 50;
const MOBILE_VIEW_MIN_WIDTH = 420;
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

type MapViewport = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const desktopViewport: MapViewport = {
  x: 0,
  y: 0,
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
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
  minimumDistance: number,
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
        distanceBetween(candidate, placedPin) >= minimumDistance,
    )
  );
}

function layoutPins(cities: WrappedCity[], minimumDistance: number) {
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
        isValidPinPosition(candidate, placedPins, minimumDistance),
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

function getFocusedViewport(pins: MapPin[]): MapViewport {
  if (pins.length === 0) {
    return desktopViewport;
  }

  const minX = Math.min(...pins.map((pin) => Math.min(pin.x, pin.anchorX)));
  const maxX = Math.max(...pins.map((pin) => Math.max(pin.x, pin.anchorX)));
  const minY = Math.min(...pins.map((pin) => Math.min(pin.y, pin.anchorY)));
  const maxY = Math.max(...pins.map((pin) => Math.max(pin.y, pin.anchorY)));
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const width = Math.min(
    Math.max(maxX - minX + MOBILE_VIEW_PADDING * 2, MOBILE_VIEW_MIN_WIDTH),
    MAP_WIDTH,
  );
  const height = Math.min(width / MOBILE_VIEW_ASPECT_RATIO, MAP_HEIGHT);
  const x = Math.min(Math.max(centerX - width / 2, 0), MAP_WIDTH - width);
  const y = Math.min(Math.max(centerY - height / 2, 0), MAP_HEIGHT - height);

  return { x, y, width, height };
}

function getLeaderEnd(pin: MapPin, pinRadius: number) {
  const deltaX = pin.x - pin.anchorX;
  const deltaY = pin.y - pin.anchorY;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance <= pinRadius) {
    return null;
  }

  const pinEdgeOffset = pinRadius + 1;

  return {
    x: pin.x - (deltaX / distance) * pinEdgeOffset,
    y: pin.y - (deltaY / distance) * pinEdgeOffset,
  };
}

function getTooltipLayout(
  pin: MapPin,
  width: number,
  viewport: MapViewport,
  pinRadius: number,
) {
  const viewportRight = viewport.x + viewport.width;
  const viewportBottom = viewport.y + viewport.height;
  const preferredLeft = pin.x - width / 2;
  const left = Math.min(
    Math.max(preferredLeft, viewport.x + TOOLTIP_MARGIN),
    viewportRight - width - TOOLTIP_MARGIN,
  );
  const preferredTop =
    pin.y - TOOLTIP_HEIGHT - pinRadius - TOOLTIP_GAP;
  const top =
    preferredTop >= viewport.y + TOOLTIP_MARGIN
      ? preferredTop
      : Math.min(
          pin.y + pinRadius + TOOLTIP_GAP,
          viewportBottom - TOOLTIP_HEIGHT - TOOLTIP_MARGIN,
        );

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
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredPinIndex, setHoveredPinIndex] = useState<number | null>(null);
  const [focusedPinIndex, setFocusedPinIndex] = useState<number | null>(null);
  const [selectedPinIndex, setSelectedPinIndex] = useState<number | null>(null);
  const [tooltipTextWidth, setTooltipTextWidth] = useState<number | null>(null);
  const tooltipTextRef = useRef<SVGTextElement>(null);
  const pinRadius = isMobile ? MOBILE_PIN_RADIUS : PIN_RADIUS;
  const pins = layoutPins(
    cities,
    isMobile ? MOBILE_PIN_DISTANCE : MIN_PIN_DISTANCE,
  );
  const viewport = isMobile ? getFocusedViewport(pins) : desktopViewport;
  const activePinIndex =
    hoveredPinIndex ?? focusedPinIndex ?? selectedPinIndex;
  const activePin = pins.find((pin) => pin.index === activePinIndex);
  const activeLabel = activePin ? getLocationLabel(activePin.city) : "";
  const estimatedTextWidth = activeLabel.length * 6;
  const tooltipWidth =
    (tooltipTextWidth ?? estimatedTextWidth) +
    TOOLTIP_HORIZONTAL_PADDING * 2;
  const activeTooltip = activePin
    ? getTooltipLayout(activePin, tooltipWidth, viewport, pinRadius)
    : null;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 550px)");
    const updateMobileState = () => setIsMobile(mediaQuery.matches);

    updateMobileState();
    mediaQuery.addEventListener("change", updateMobileState);

    return () => {
      mediaQuery.removeEventListener("change", updateMobileState);
    };
  }, []);

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
      viewBox={`${viewport.x} ${viewport.y} ${viewport.width} ${viewport.height}`}
      role="group"
      aria-label="Cities visited"
      aria-describedby="wrapped-map-description"
      onClick={() => {
        setSelectedPinIndex(null);
        setFocusedPinIndex(null);
      }}
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
          const leaderEnd = getLeaderEnd(pin, pinRadius);

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
              aria-expanded={activePinIndex === pin.index}
              role="button"
              tabIndex={0}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") {
                  setHoveredPinIndex(pin.index);
                }
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse") {
                  setHoveredPinIndex(null);
                }
              }}
              onFocus={() => setFocusedPinIndex(pin.index)}
              onBlur={() => setFocusedPinIndex(null)}
              onClick={(event) => {
                event.stopPropagation();
                setSelectedPinIndex(pin.index);
              }}
            >
              <circle
                className={styles.mapPinHitArea}
                r={isMobile ? MOBILE_PIN_HIT_RADIUS : 12}
              />
              <circle
                className={styles.mapPinHalo}
                r={isMobile ? 13 : 10}
              />
              <circle className={styles.mapPinDot} r={pinRadius} />
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
