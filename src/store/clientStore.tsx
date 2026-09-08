import { getDefaultStore } from "jotai";
import { useAtom } from "jotai/react";
import { atomWithStorage } from "jotai/utils";

export interface CountryOption {
  value: string;
  label: string;
  name: string;
  flag: string;
  currency: string;
  symbol: string;
}

export const COUNTRIES: CountryOption[] = [
  { value: "Nigeria", label: "NGA", name: "Nigeria", flag: "🇳🇬", currency: "NGN", symbol: "₦" },
  { value: "United States", label: "USA", name: "United States", flag: "🇺🇸", currency: "USD", symbol: "$" },
  { value: "United Kingdom", label: "UK", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", symbol: "£" },
];

const country_atom = atomWithStorage<CountryOption>("country", {
  value: "Nigeria",
  label: "NGA",
  name: "Nigeria",
  flag: "🇳🇬",
  currency: "NGN",
  symbol: "₦",
});

export const useCountrySelect = () => {
  const [country, setCountry] = useAtom(country_atom);
  const countries = COUNTRIES;
  return { country, setCountry, countries };
};
const store = getDefaultStore();
export const countryvalue = store.get(country_atom);

const perms_atom = atomWithStorage("permissions", null);

export const usePermissions = () => {
  const [perms, setPerms] = useAtom(perms_atom);
  return { perms, setPerms };
};
