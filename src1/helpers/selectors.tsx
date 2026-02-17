import { useState } from "react";

export default function useSelectItem() {
  const [selected, setSelected] = useState<{
    [key: string]: any;
  } | null>({});
  const mapped = selected ? Object.keys(selected).map(String) : [];
  const add_to = (item: { id: string; [key: string]: any }) => {
    setSelected((prev) => ({
      ...prev,
      [item.id]: item,
    }));
  };

  const remove = (id: string) => {
    setSelected((prev) => {
      const newSelected = { ...prev };
      delete newSelected[id];
      return newSelected;
    });
  };

  const clear = () => {
    setSelected({});
  };

  return { selected, setSelected, mapped, add_to, remove, clear };
}

export function useSingleSelect<T extends string | number>(
  initialValue: T | null,
) {
  const [selectedItem, setSelectedItem] = useState<T | null>(
    initialValue || null,
  );

  const selectItem = (item: T) => {
    setSelectedItem(item);
  };

  const clearSelection = () => {
    setSelectedItem(null);
  };

  return { selectedItem, selectItem, clearSelection };
}
