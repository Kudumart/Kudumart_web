import React from 'react';
import Setting from "../../../components/Setting"; // Ensure the correct import

const App = () => {
    const data = {
        countries: ["Nigeria", "Ghana", "Kenya", "South Africa"], // Example country options
        states: ["Lagos", "Abuja", "Kano", "Rivers"], // Example state options
        currencies: ["USD", "NGN", "KES", "ZAR"], // Example currency options
    };

    return (
        <div className="min-h-screen">
            <Setting data={data} />
        </div>
    );
};

export default App;
