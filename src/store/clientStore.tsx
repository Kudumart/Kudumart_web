import { getDefaultStore } from "jotai";
import { useAtom } from "jotai/react";
import { atomWithStorage } from "jotai/utils";

const country_atom = atomWithStorage("country", {
  value: "Nigeria",
  label: "NGA",
});

export const useCountrySelect = () => {
  const [country, setCountry] =
    useAtom<(typeof countries)[number]>(country_atom);
  const countries = [
    { value: "United Kingdom", label: "UK" },
    { value: "United States", label: "USA" },
    { value: "Nigeria", label: "NGA" },
  ];
  return { country, setCountry, countries };
};
const store = getDefaultStore();
export const countryvalue = store.get(country_atom);

const perms_atom = atomWithStorage("permissions", null);

export const usePermissions = () => {
  const [perms, setPerms] = useAtom(perms_atom);
  return { perms, setPerms };
};
