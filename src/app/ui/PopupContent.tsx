import Image from "next/image";
import { Overlay } from "ol";
import React, { ChangeEventHandler, RefObject, useCallback, useEffect, useRef } from "react";
import ReactSwitch from "react-switch";

import usePopupData, { IPopupData } from "@/store/usePopupData";
import { STORAGE_KEY_POINTS, storageUtils } from "@/utils/storage";

import points, { IPoint } from "../utils/sampleData";

interface Props {
  popupRef: RefObject<HTMLDivElement>;
  popupOverlay?: Overlay;
  updateMarkerStyle: (point: IPopupData) => void;
}

export default function PopupContent({ popupRef, popupOverlay, updateMarkerStyle }: Props) {
  const documentRef = useRef(document);

  const { getItem } = storageUtils;
  const storedPoints = (getItem(STORAGE_KEY_POINTS) ?? points) as IPoint[];

  const { popupData, setPopupData } = usePopupData();

  const { setItem } = storageUtils;

  const handleStatusChange = (value: boolean) => {
    setPopupData({ status: value });

    const updatedPoints = storedPoints.map((point) =>
      point.id === popupData.id ? { ...point, status: value } : point
    );
    setItem(STORAGE_KEY_POINTS, updatedPoints);

    updateMarkerStyle({ ...popupData, status: value });
  };

  const handleDetailsChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    const newValue = event.target.value;
    setPopupData({ details: newValue });

    const updatedPoints = storedPoints.map((point) =>
      point.id === popupData.id ? { ...point, details: newValue } : point
    );
    setItem(STORAGE_KEY_POINTS, updatedPoints);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        popupOverlay?.setPosition(undefined);
      }
    },
    [popupOverlay]
  );

  useEffect(() => {
    documentRef.current.addEventListener("keydown", handleKeyDown);

    return () => {
      documentRef.current.removeEventListener("keydown", handleKeyDown);
    };
  }, [popupOverlay]);

  return (
    <div ref={popupRef} className="bg-white rounded-md p-2 border shadow-md w-[200px]">
      {popupData && (
        <div className="text-sm space-y-2 relative">
          <button
            onClick={() => popupOverlay?.setPosition(undefined)}
            className="absolute -top-0.5 right-1 hover:bg-gray-100 p-1.5 rounded-md transition-colors"
          >
            <Image src="/icons/x.svg" width={12} height={12} alt="close" />
          </button>
          <p className="flex items-center gap-2">
            <span className="font-medium">Id: </span>
            <span>{popupData.id}</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="font-medium">Status: </span>
            <ReactSwitch checked={!!popupData.status} onChange={handleStatusChange} />
          </p>
          <p className="flex flex-col gap-1">
            <span className="font-medium">Details: </span>
            <textarea className="border rounded-md p-1" value={popupData.details} onChange={handleDetailsChange} />
          </p>
        </div>
      )}
    </div>
  );
}
