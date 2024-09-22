"use client";

import "ol/ol.css";

import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { fromLonLat } from "ol/proj";
import { OSM } from "ol/source";
import React, { useEffect, useRef } from "react";

import sampleData from "../utils/sampleData";
import useIconLayer from "../utils/useIconLayer";

export default function CustomMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const { vectorLayer, vectorSource } = useIconLayer();

  useEffect(() => {
    const centerCoordinations = [sampleData.coordinates[0].latitude, sampleData.coordinates[0].longitude];

    const map = new Map({
      target: mapRef.current as HTMLElement,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat(centerCoordinations),
        zoom: 6,
      }),
    });

    if (vectorLayer) map.addLayer(vectorLayer);

    // Adjust the view to fit all markers
    if (vectorSource) {
      const extent = vectorSource.getExtent();
      map.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 10 });
    }

    return () => map.setTarget();
  }, [vectorLayer, vectorSource]);

  return <div ref={mapRef} className="map" style={{ height: "100vh", width: "100%" }}></div>;
}
