import useAppState from "./appState";
import { useCountrySelect } from "../store/clientStore";

export const useGeoLocatorProduct = (productsArr) => {
    const { ipInfo } = useAppState();
    const { country } = useCountrySelect();

    if (!Array.isArray(productsArr)) return [];

    const activeCountryStr = (country?.value || country?.label || ipInfo?.country_name || "").toLowerCase();

    return productsArr.filter(product => {
        if (!product) return false;
        const symbol = product.store?.currency?.symbol || product.currency?.symbol || product.vendor?.currency?.symbol;
        if (!symbol) return true;

        if (activeCountryStr.includes("nigeria") || activeCountryStr === "nga") {
            return symbol === "₦" || symbol === "NGN";
        } else if (activeCountryStr.includes("kingdom") || activeCountryStr === "uk" || activeCountryStr === "gb") {
            return symbol === "£" || symbol === "GBP";
        } else {
            return symbol === "$" || symbol === "USD" || symbol === "€" || symbol === "EUR";
        }
    });
};

export const useGeoLocatorCurrency = () => {
    const { ipInfo } = useAppState();
    const { country } = useCountrySelect();

    const activeCountryStr = (country?.value || country?.label || ipInfo?.country_name || "").toLowerCase();

    if (activeCountryStr.includes("nigeria") || activeCountryStr === "nga") {
        return [{ id: '₦', name: 'Naira', symbol: '₦', code: 'NGN' }];
    } else if (activeCountryStr.includes("kingdom") || activeCountryStr === "uk" || activeCountryStr === "gb") {
        return [{ id: '£', name: 'Pound Sterling', symbol: '£', code: 'GBP' }];
    } else {
        return [{ id: '$', name: 'USD', symbol: '$', code: 'USD' }];
    }
};

