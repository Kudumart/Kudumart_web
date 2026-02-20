import { useAtom } from "jotai";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useRef } from "react";

export const useReModal = () => {
  const modalRef = useRef<{ open: () => void; close: () => void }>(null);

  const openModal = () => modalRef.current?.open();
  const closeModal = () => modalRef.current?.close();

  return { modalRef, openModal, closeModal };
};

interface FilterState {
  minPrice: number;
  maxPrice: number;
}

const stored = localStorage.getItem("filter_defaults");
const filter_defaults = stored
  ? JSON.parse(stored)
  : { minPrice: 0, maxPrice: 5000000 };
const filter_atom = atomWithStorage<FilterState>(
  "filter_defaults",
  filter_defaults,
);
export const useNewFilters = () => {
  const [filters, setFilters] = useAtom(filter_atom);

  const clearFilters = () => {
    setFilters(filter_defaults);
  };
  const setMin = (min: number) => {
    setFilters((prev) => ({ ...prev, minPrice: min }));
  };
  const setMax = (max: number) => {
    setFilters((prev) => ({ ...prev, maxPrice: max }));
  };
  return {
    filters,
    setFilters,
    clearFilters,
    setMin,
    setMax,
  };
};
