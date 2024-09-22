"use client";

import "ol/ol.css";

import { Map, Overlay, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { fromLonLat } from "ol/proj";
import { OSM } from "ol/source";
import React, { useEffect, useRef, useState } from "react";

import usePopupData from "@/store/usePopupData";
import { STORAGE_KEY_POINTS, storageUtils } from "@/utils/storage";

import points, { IPoint } from "../utils/sampleData";
import useIconLayer from "../utils/useIconLayer";
import PopupContent from "./PopupContent";

export default function CustomMap() {
  const { getItem } = storageUtils;
  const storedPoints = (getItem(STORAGE_KEY_POINTS) ?? points) as IPoint[];

  const { popupData, setPopupData } = usePopupData();
  const { vectorLayer, vectorSource } = useIconLayer();

  const mapRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const [map, setMap] = useState<Map>();
  const [popupOverlay, setPopupOverlay] = useState<Overlay>();

  useEffect(() => {
    const centerCoordinations = [storedPoints[0].latitude, storedPoints[0].longitude];

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

    // Add popup overlay
    const popupOverlay = new Overlay({
      element: popupRef.current as HTMLElement,
      autoPan: true,
      id: "popup",
    });
    setPopupOverlay(popupOverlay);
    map.addOverlay(popupOverlay);

    if (vectorLayer) map.addLayer(vectorLayer);

    // Adjust the view to fit all markers
    if (vectorSource) {
      const extent = vectorSource.getExtent();
      map.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 10 });
    }

    setMap(map);

    return () => map.setTarget();
  }, [vectorLayer, vectorSource]);

  useEffect(() => {
    map?.on("click", function (e) {
      popupOverlay?.setPosition(undefined);
      if (popupOverlay)
        map.forEachFeatureAtPixel(e.pixel, (feature) => {
          if (popupOverlay.getPosition() && popupData.id === feature.get("id")) {
            popupOverlay.setPosition(undefined);
            setPopupData(null);
          } else {
            setPopupData({ details: feature.get("details"), status: feature.get("status"), id: feature.get("id") });
            popupOverlay.setPosition(e.coordinate);
          }
        });
    });
  }, [popupOverlay, popupData]);

  const handleMarkerFocus = (coordinates: number[], pointId: number) => {
    const focusedPoint = storedPoints.find((point) => point.id === pointId);
    setPopupData({ details: focusedPoint?.details, status: focusedPoint?.status, id: focusedPoint?.id });
    if (map) {
      map.getOverlayById("popup")?.setPosition(fromLonLat(coordinates));
    }
  };

  return (
    <div>
      <div ref={mapRef} className="map" style={{ height: "100vh", width: "100%" }}></div>
      <div className="flex gap-4">
        {/* Render focusable markers */}
        {storedPoints.map((point) => (
          <button
            key={point.id}
            className="bg-transparent"
            onFocus={() => handleMarkerFocus([point.latitude, point.longitude], point.id)}
            aria-label={`Marker for ${point.details} - Status: ${point.status}`}
          />
        ))}
      </div>
      <PopupContent popupOverlay={popupOverlay} popupRef={popupRef} />
    </div>
  );
}
