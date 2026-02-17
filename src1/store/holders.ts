import { atomWithStorage } from "jotai/utils";
import { atom, useAtom } from "jotai";

interface Category {
  id: number;
  name: string;
  image: null | string;
  createdAt: string;
  updatedAt: string;
}

const categorieAtom = atomWithStorage<Category | null>("categories", null);

export function useCategorie() {
  const [categories, setCategories] = useAtom(categorieAtom);
  return { categories, setCategories };
}
