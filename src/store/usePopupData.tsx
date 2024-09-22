import { create } from "zustand";

export interface IPopupData {
  id?: number;
  status?: boolean;
  details?: string;
}

interface IPopupStore {
  popupData: IPopupData;
  setPopupData: (a: IPopupData | null) => void;
}

const usePopupData = create<IPopupStore>((set) => ({
  popupData: {
    id: undefined,
    details: "",
    status: false,
  },
  setPopupData: (data) => set((state) => ({ popupData: { ...state.popupData, ...data } })),
}));

export default usePopupData;
