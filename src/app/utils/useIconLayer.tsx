import { Feature } from "ol";
import { ColorLike } from "ol/colorlike";
import { Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";
import { useEffect, useState } from "react";

import { IPopupData } from "@/store/usePopupData";
import { STORAGE_KEY_POINTS, storageUtils } from "@/utils/storage";

import points, { IPoint } from "./sampleData";

export default function useIconLayer() {
  const { getItem } = storageUtils;
  const storedPoints = (getItem(STORAGE_KEY_POINTS) ?? points) as IPoint[];

  const [vectorLayer, setVectorLayer] = useState<VectorLayer<VectorSource<Feature<Point>>, Feature<Point>>>();
  const [vectorSource, setVectorSource] = useState<VectorSource<Feature<Point>>>();

  const OK_COLOR = "#4F75FF";
  const WARNING_COLOR = "#EE66A6";

  // Create the icon style using an SVG encoded as a data URL
  const getEncodedSvg = (status: boolean) =>
    `data:image/svg+xml;utf8,${encodeURIComponent(getIcon(status ? OK_COLOR : WARNING_COLOR))}`;

  useEffect(() => {
    const iconFeatures = storedPoints.map((point) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([point.latitude, point.longitude])),
        id: point.id,
        details: point.details,
        status: point.status,
      });

      feature.setStyle(
        new Style({
          image: new Icon({
            src: getEncodedSvg(point.status),
            scale: 1.2,
          }),
        })
      );
      feature.setId(String(point.id));
      return feature;
    });

    const vectorSource = new VectorSource({
      features: iconFeatures,
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    setVectorSource(vectorSource);
    setVectorLayer(vectorLayer);
  }, []);

  // Update the marker style dynamically based on the updated point data
  const updateMarkerStyle = (point: IPopupData) => {
    const feature = vectorSource?.getFeatureById(String(point.id));

    if (feature) {
      feature.setStyle(
        new Style({
          image: new Icon({
            src: getEncodedSvg(!!point.status),
            scale: 1.2,
          }),
        })
      );
    }
  };

  return { vectorSource, vectorLayer, updateMarkerStyle };
}

function getIcon(color: ColorLike) {
  return `<svg
    version="1.0"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width="25"
    height="25"
    viewBox="0 0 64 64"
    enable-background="new 0 0 64 64"
    xmlSpace="preserve"
    style="fill: ${color}; stroke: 1px solid #fff"
  >
    <path
      d="M32,0C18.746,0,8,10.746,8,24c0,5.219,1.711,10.008,4.555,13.93c0.051,0.094,0.059,0.199,0.117,0.289l16,24
	C29.414,63.332,30.664,64,32,64s2.586-0.668,3.328-1.781l16-24c0.059-0.09,0.066-0.195,0.117-0.289C54.289,34.008,56,29.219,56,24
	C56,10.746,45.254,0,32,0z M32,32c-4.418,0-8-3.582-8-8s3.582-8,8-8s8,3.582,8,8S36.418,32,32,32z"
    />
  </svg>`;
}
