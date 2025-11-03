"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface Polygon {
  points: Array<[number, number]>;
  area?: number;
}

interface MapComponentProps {
  imageUrl: string;
  polygons: Polygon[];
}

export default function MapComponent({
  imageUrl,
  polygons,
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const isLoadedRef = useRef(false);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    console.log("Initializing MapLibre map...");

    // Initialize map with MapLibre (no API key needed)
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "osm-tiles": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm-tiles-layer",
            type: "raster",
            source: "osm-tiles",
          },
        ],
      },
      center: [0, 0],
      zoom: 1,
    });

    console.log("MapLibre map created:", map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Add parking image and polygons when ready
  useEffect(() => {
    if (!mapRef.current || !imageUrl || !polygons.length) return;
    if (isLoadedRef.current) return; // Only load once

    const map = mapRef.current;

    // If map is already loaded, add content immediately
    if (map.loaded()) {
      addParkingContent(map, imageUrl, polygons);
      isLoadedRef.current = true;
    } else {
      // Otherwise wait for map to load
      map.on("load", () => {
        addParkingContent(map, imageUrl, polygons);
        isLoadedRef.current = true;
      });
    }
  }, [imageUrl, polygons]);

  function addParkingContent(
    map: maplibregl.Map,
    imageUrl: string,
    polygons: Polygon[]
  ) {
    if (map.getSource("parking-image")) return;

    // Create image element from data URL
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const imageWidth = img.width;
      const imageHeight = img.height;

      // Add parking image to map
      map.addSource("parking-image", {
        type: "image",
        url: imageUrl,
        coordinates: [
          [-1, 1], // top left
          [1, 1], // top right
          [1, -1], // bottom right
          [-1, -1], // bottom left
        ],
      });

      // Add parking image layer
      map.addLayer({
        id: "parking-image-layer",
        type: "raster",
        source: "parking-image",
        paint: {
          "raster-opacity": 0.85,
        },
      });

      // Fit map to image bounds
      map.fitBounds(
        [
          [-1, -1], // southwest
          [1, 1], // northeast
        ],
        { padding: 50 }
      );

      // Add polygon layers for each parking space
      polygons.forEach((polygon, idx) => {
        const sourceId = `parking-polygon-${idx}`;
        const layerId = `parking-layer-${idx}`;

        // Convert pixel coordinates to normalized map coordinates [-1, 1]
        const coordinates = polygon.points.map(([x, y]: [number, number]) => {
          // Normalize pixel coordinates to [-1, 1] range
          const normalizedX = (x / imageWidth) * 2 - 1;
          const normalizedY = 1 - (y / imageHeight) * 2; // Flip Y axis
          return [normalizedX, normalizedY];
        });

        // Close the polygon
        const closedCoordinates = [...coordinates, coordinates[0]];

        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [closedCoordinates],
            },
            properties: {
              index: idx,
            },
          } as maplibregl.GeoJSONSourceSpecification["data"],
        });

        // Add polygon layer
        map.addLayer({
          id: layerId,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": `hsl(${(idx * 60) % 360}, 70%, 50%)`,
            "fill-opacity": 0.3,
          },
        });

        // Add polygon outline
        map.addLayer({
          id: `${layerId}-outline`,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": `hsl(${(idx * 60) % 360}, 70%, 50%)`,
            "line-width": 2,
          },
        });
      });
    };

    img.onerror = (err) => {
      console.error("Failed to load parking image:", err);
    };
  }

  return (
    <div className="relative h-96 w-full overflow-hidden rounded-lg">
      <div ref={mapContainer} className="h-full w-full" />
      {polygons.length > 0 && (
        <div className="absolute bottom-4 right-4 rounded-lg bg-white/90 px-3 py-2 text-sm font-semibold shadow-lg dark:bg-zinc-900/90 dark:text-zinc-100">
          {polygons.length} parking spaces
        </div>
      )}
    </div>
  );
}
