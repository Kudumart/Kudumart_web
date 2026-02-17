import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const token = localStorage.getItem("kuduUserToken");

//Create an async thunk to fetch cart items from an API
export const getCart = createAsyncThunk('cart/getCart', async () => {
    const response = await fetch(`${BASE_URL}/user/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, 
        },
    }); 

    const data = await response.json();
    return data;
  });

//ADD TO CART
export const addToCart = createAsyncThunk("cart/addToCart", async (product, { rejectWithValue }) => {
    try{
        const response = await fetch(`${BASE_URL}/user/cart/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`, 
            },
            body:JSON.stringify(product)
        });
        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.message || `Error ${response.status}: Unknown error`
            throw new Error(errorMessage);
        }
        const data = await response.json();
        toast.success(data.message);
    }catch(error){
        toast.error(error.message);
    }
    const data = await response.json();
 });   

//  REMOVE FROM CART
  export const removeFromCart = createAsyncThunk("cart/removeFromCart", async (cartId) => {
    try{
        const response = await fetch(`${BASE_URL}/user/cart/remove?cartId=${cartId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`, 
            },
        });  
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        toast.success(data.message);
    }catch(error){
        toast.error(error.message);
    }
  });
  

  const cartSlice = createSlice({
    name: "cart",
    initialState: {
      cart: [],
      totalPrice: 0,
      status: "idle",
      error: null,
    },
  
    reducers: {
      increaseQuantity: (state, action) => {
        const item = state.cart.find((item) => item.id === action.payload);
        if (item) {
          item.quantity += 1;
          item.totalPrice = item.quantity * item.product.price;
  
          // Ensure totalPrice updates globally
          state.totalPrice = state.cart.reduce(
            (sum, product) => sum + product.totalPrice,
            0
          );
        }
      },
  
      decreaseQuantity: (state, action) => {
        const item = state.cart.find((item) => item.id === action.payload);
        if (item && item.quantity > 1) {
          item.quantity -= 1;
          item.totalPrice = item.quantity * item.product.price;
  
          // Ensure totalPrice updates correctly
          state.totalPrice = state.cart.reduce(
            (sum, product) => sum + product.totalPrice,
            0
          );
        }
      },
    },


  extraReducers: (builder) => {
    builder
      .addCase(getCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getCart.fulfilled, (state, action) => {
        const updatedCart = action.payload.data.map((newItem) => {
            const existingItem = state.cart.find((item) => item.id === newItem.id);

            return {
                ...newItem,
                quantity: existingItem ? existingItem.quantity : newItem.quantity || 1,
                totalPrice: (existingItem ? existingItem.quantity : newItem.quantity || 1) * newItem.product.price
            };
        });

        state.cart = updatedCart; 
        state.totalPrice = state.cart.reduce((acc, item) => acc + item.totalPrice, 0);

      })
      .addCase(getCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

    // Add to Cart
    .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
    })
    .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        let itemExists = false;

        state.items = state.items.map((item) => {
            if(item.id === action.payload.id){
                itemExists = true;
                return { ...item, quantity: item.quantity + 1}
            }
            return item;
        })

        if (!itemExists) {
            state.items.push({ ...action.payload, quantity: 1 });
        }
    })
    .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
    })

    //   REMOVE CART
     .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { increaseQuantity, decreaseQuantity } = cartSlice.actions;
export default cartSlice.reducer;


