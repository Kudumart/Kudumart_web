import useAppState from "./appState";

export const useGeoLocatorProduct = (productsArr) => {
    const { ipInfo } = useAppState();

    if (!Array.isArray(productsArr)) return [];

    return productsArr.filter(product => {
        if (!product) return false;
        const symbol = product.store?.currency?.symbol || product.currency?.symbol || product.vendor?.currency?.symbol;
        if (!symbol) return true;

        if (ipInfo?.country_name === "Nigeria") {
            return symbol === "₦" || symbol === "NGN" || symbol === "$" || symbol === "USD";
        } else {
            return symbol === "$" || symbol === "USD" || symbol === "€" || symbol === "EUR" || symbol === "₦" || symbol === "NGN";
        }
    });
};

export const useGeoLocatorCurrency = () => {
    const { ipInfo } = useAppState(); // ✅ Hook is now inside a custom hook

    if (ipInfo?.country_name === "Nigeria") {
        return [{ id: '₦', name: 'Naira', symbol: '₦' }];
    }
    else {
        return [{ id: '$', name: 'USD', symbol: '$' }];
    }
};

