"use client";

import "ol/ol.css";

import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { fromLonLat } from "ol/proj";
import { OSM } from "ol/source";
import React, { useEffect, useRef } from "react";

export default function CustomMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    new Map({
      target: mapRef.current as HTMLElement,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([30.5, 50.5]),
        zoom: 6,
      }),
    });
  }, []);

  return <div ref={mapRef} className="map" style={{ height: "100vh", width: "100%" }}></div>;
}
