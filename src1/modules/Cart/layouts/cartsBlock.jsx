import React, {useState, useEffect} from "react";
import CartItem from "./CartItem";
import PulseLoader from "react-spinners/PulseLoader";

const CartBlock = ({cart, removeFromCart, reload}) => {
    const [isLoading, setIsLoading]  = useState(true);

    useEffect(() => {
        cart && setIsLoading(false)
    }, [cart])
  
    return (
        <div className="w-full flex flex-col gap-2 py-4 rounded-lg bg-white">
            {isLoading ? 
            (
             <div className="flex justify-center">
                <PulseLoader color="#000000"  size={10}/>
             </div>
            ) 
            : 
            (
            <div>
                <div className="flex flex-col px-10 gap-4">
                    <h1 className="md:text-lg text-base font-semibold my-3 md:mb-6 md:mt-4">CART ({cart.length})</h1>
                </div>
                <div className="w-full h-px md:-mt-4 border border-[1.5px]" />
                <div className="w-full flex flex-col gap-5 md:px-10 px-3 bg-white">
                    {cart.length > 0 && cart.map((item) => (
                        <CartItem
                            key={item.id}
                            item={item}
                            refetch={reload}
                            removeFromCart={removeFromCart}
                        />
                    ))}
                    {
                        cart.length === 0 && (
                            <div className="flex w-full justify-center">
                            <h1 className="text-lg font-semibold mb-6 mt-4">NO ITEM FOUND</h1>
                        </div>        
                        )
                    }
                </div>
            </div>
            )}
        </div>
    );
};

export default CartBlock;
