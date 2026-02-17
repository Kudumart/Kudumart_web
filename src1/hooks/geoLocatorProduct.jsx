import useAppState from "./appState";

export const useGeoLocatorProduct = (productsArr) => {
    const { ipInfo } = useAppState(); // ✅ Hook is now inside a custom hook

    return productsArr.filter(product => {
        if (ipInfo?.country_name === "Nigeria") {
            return product.store?.currency?.symbol === "₦";
        } else {
            return product.store?.currency?.symbol === "$" || product.store?.currency?.symbol === "€";
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

