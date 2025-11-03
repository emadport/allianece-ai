"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface Polygon {
  points: Array<[number, number]>;
  area?: number;
}

interface GeoBounds {
  northEast: { lat: number; lng: number };
  southWest: { lat: number; lng: number };
}

interface MapComponentProps {
  imageUrl: string;
  polygons: Polygon[];
  geoBounds?: GeoBounds | null;
}

// -----------------------------------------------------------
// 🚨 NEW INTERFACE FOR DIMENSIONS
interface ImageDimensions {
  width: number;
  height: number;
}
// -----------------------------------------------------------

export default function MapComponent({
  imageUrl,
  polygons,
  geoBounds = null,
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  // -----------------------------------------------------------
  // 🚨 NEW STATE FOR IMAGE DIMENSIONS
  const [imageDimensions, setImageDimensions] =
    useState<ImageDimensions | null>(null);
  // -----------------------------------------------------------

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    console.log("Initializing MapLibre map...");

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
    if (isImageLoaded) return; // Image already loaded

    const map = mapRef.current;

    // If map is already loaded, add content immediately
    if (map.loaded()) {
      addParkingContent(map, imageUrl, polygons, geoBounds, setImageDimensions);
    } else {
      // Otherwise wait for map to load
      map.on("load", () => {
        addParkingContent(
          map,
          imageUrl,
          polygons,
          geoBounds,
          setImageDimensions
        );
      });
    }
  }, [imageUrl, polygons, isImageLoaded]);

  // Update geoBounds when they change (update image coordinates and zoom)
  useEffect(() => {
    if (!mapRef.current || !geoBounds || !isImageLoaded || !imageDimensions) {
      return;
    }

    const map = mapRef.current;
    const { width: imageWidth, height: imageHeight } = imageDimensions;

    // --- 1. Update image coordinates ---
    const imageSource = map.getSource(
      "parking-image"
    ) as maplibregl.ImageSource;
    if (imageSource) {
      const imageCoordinates: [
        [number, number],
        [number, number],
        [number, number],
        [number, number]
      ] = [
        [geoBounds.northEast.lng, geoBounds.northEast.lat],
        [geoBounds.southWest.lng, geoBounds.northEast.lat],
        [geoBounds.southWest.lng, geoBounds.southWest.lat],
        [geoBounds.northEast.lng, geoBounds.southWest.lat],
      ];
      imageSource.setCoordinates(imageCoordinates);
      console.log("Updated image coordinates to:", imageCoordinates);
    }

    // --- 2. Update polygon coordinates (NOW SYNCHRONOUS) ---
    // 🚨 Removed the asynchronous new Image() block
    polygons.forEach((polygon, idx) => {
      const sourceId = `parking-polygon-${idx}`;
      const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;

      if (source) {
        const coordinates = polygon.points.map(([x, y]: [number, number]) => {
          const normalizedX = x / imageWidth;
          const normalizedY = y / imageHeight;

          const lng =
            geoBounds.southWest.lng +
            (geoBounds.northEast.lng - geoBounds.southWest.lng) * normalizedX;
          const lat =
            geoBounds.southWest.lat +
            (geoBounds.northEast.lat - geoBounds.southWest.lat) *
              (1 - normalizedY);

          return [lng, lat];
        });

        const closedCoordinates = [...coordinates, coordinates[0]];

        // Set new GeoJSON data
        source.setData({
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [closedCoordinates],
          },
          properties: { index: idx },
        } as any);
      }
    });

    // --- 3. Zoom to bounds (EXECUTED AFTER ALL SOURCE DATA IS UPDATED) ---
    const fitBounds: [[number, number], [number, number]] = [
      [geoBounds.southWest.lng, geoBounds.southWest.lat],
      [geoBounds.northEast.lng, geoBounds.northEast.lat],
    ];

    map.fitBounds(fitBounds, { padding: 50 });
  }, [geoBounds, polygons, isImageLoaded, imageDimensions]); // 🚨 Added imageDimensions dependency

  // -----------------------------------------------------------
  // 🚨 UPDATED FUNCTION SIGNATURE
  function addParkingContent(
    map: maplibregl.Map,
    imageUrl: string,
    polygons: Polygon[],
    geoBounds: GeoBounds | null,
    setImageDimensions: (dims: ImageDimensions) => void // Accepts setter
  ) {
    if (map.getSource("parking-image")) return;

    // Create image element from data URL
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const imageWidth = img.width;
      const imageHeight = img.height;

      setImageDimensions({ width: imageWidth, height: imageHeight });

      let imageCoordinates: [
        [number, number],
        [number, number],
        [number, number],
        [number, number]
      ];
      let fitBounds: [[number, number], [number, number]];

      if (geoBounds) {
        // Use real-world coordinates when provided
        imageCoordinates = [
          [geoBounds.northEast.lng, geoBounds.northEast.lat], // top left (NE)
          [geoBounds.southWest.lng, geoBounds.northEast.lat], // top right
          [geoBounds.southWest.lng, geoBounds.southWest.lat], // bottom right (SW)
          [geoBounds.northEast.lng, geoBounds.southWest.lat], // bottom left
        ];
        fitBounds = [
          [geoBounds.southWest.lng, geoBounds.southWest.lat],
          [geoBounds.northEast.lng, geoBounds.northEast.lat],
        ];
      } else {
        // Use normalized coordinates as fallback
        imageCoordinates = [
          [-1, 1], // top left
          [1, 1], // top right
          [1, -1], // bottom right
          [-1, -1], // bottom left
        ];
        fitBounds = [
          [-1, -1],
          [1, 1],
        ];
      }

      // Add parking image to map
      map.addSource("parking-image", {
        type: "image",
        url: imageUrl,
        coordinates: imageCoordinates,
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

      // Fit map to bounds
      map.fitBounds(fitBounds, { padding: 50 });

      // Add polygon layers for each parking space
      polygons.forEach((polygon, idx) => {
        const sourceId = `parking-polygon-${idx}`;
        const layerId = `parking-layer-${idx}`;

        // Convert pixel coordinates to lat/lng or normalized coordinates
        const coordinates = polygon.points.map(([x, y]: [number, number]) => {
          if (geoBounds) {
            // Convert pixel to real-world lat/lng
            const normalizedX = x / imageWidth;
            const normalizedY = y / imageHeight;

            const lng =
              geoBounds.southWest.lng +
              (geoBounds.northEast.lng - geoBounds.southWest.lng) * normalizedX;
            const lat =
              geoBounds.southWest.lat +
              (geoBounds.northEast.lat - geoBounds.southWest.lat) *
                (1 - normalizedY);

            return [lng, lat]; // [longitude, latitude] for GeoJSON
          } else {
            // Normalize pixel coordinates to [-1, 1] range
            const normalizedX = (x / imageWidth) * 2 - 1;
            const normalizedY = 1 - (y / imageHeight) * 2; // Flip Y axis
            return [normalizedX, normalizedY];
          }
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

      // Mark image as loaded
      setIsImageLoaded(true);
    };

    img.onerror = (err) => {
      console.error("Failed to load parking image:", err);
    };
  }
  // -----------------------------------------------------------

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
