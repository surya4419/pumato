import { createContext,useEffect,useState } from "react";
//import { food_list } from "../assets/assets";
import axios from "axios"


export const StoreContext = createContext(null) //new context to use throughout application

const StoreContextProvider = (props) =>{
   
  const [cartItems,setCartItems] = useState({});
  const url = "http://localhost:4000"
  const [token,setToken] = useState("")
  const [food_list,setFoodlist] = useState([])
    
  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
        setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }

    const token = localStorage.getItem("token");
    if (token) {
        try {
            await axios.post(url + "/api/cart/add", { itemId }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert("Failed to add item to cart. Please check your login status.");
        }
    } else {
        alert("You must be logged in to add items to the cart.");
    }
};

  

  const removeFromCart = async (itemId) =>{
    setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}))
    if (token) {
      await axios.post(url+"/api/cart/remove",{itemId},{headers:{token}})
    }
  }

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems){
      if(cartItems[item]>0){
        let itemInfo = food_list.find((product) => product._id === item);
        totalAmount += itemInfo.price * cartItems[item];
      }
    }
    return totalAmount;

  }

  //foodlist from backend
  const fetchFoodlist = async ()=> {
    const response = await axios.get(url+"/api/food/list");
    setFoodlist(response.data.data)
  }

  const loadCartData = async (token) => {
    try {
        const response = await axios.post(url + "/api/cart/get", {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setCartItems(response.data.cartData);
    } catch (error) {
        console.error("Error loading cart data:", error.response ? error.response.data : error.message);
        
    }
};


  //stay logged in on refreshing
  useEffect(() => {
    async function loadData() {
        try {
            await fetchFoodlist();
            const token = localStorage.getItem("token");
            if (token) {
                setToken(token);
                await loadCartData(token);
            }
        } catch (error) {
            console.error("Error loading data:", error);
            // Optionally handle the error, e.g., set error state or show a message
        }
    }
    loadData();
}, []);





      const contextvalue = {
           food_list,    //we can access the food_list anywhere
           cartItems,
           setCartItems,
           addToCart,
           removeFromCart,
           getTotalCartAmount,
           url,
           token,
           setToken

      }
      return(
        //provider component will wrap your application and provide value to all children
        <StoreContext.Provider value={contextvalue}>
            {props.children}
        </StoreContext.Provider>
      )

}

export default StoreContextProvider;