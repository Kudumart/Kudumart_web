import React from 'react';
import PostNewAdvert from "../../../components/PostNewAdvert";

const App = () => {
    const data = {
        advertTitle: '',
        category: '',
        region: '',
        description: '',
        productName: '',
        price: '',
        biddingOption: '',
        promo: '',
        productDescription:'',
        productCategory: '',
        productCondition: '',
        productLocation: '',
        auctionName: '',
        auctionStartTime: '',
        auctionEndTime: '',
        maximumNumberOfBids: '',
        bidIncrement: '',
    };

    return (
        <div className="min-h-screen">
            <PostNewAdvert data={data} />
        </div>
    );
};

export default App;
