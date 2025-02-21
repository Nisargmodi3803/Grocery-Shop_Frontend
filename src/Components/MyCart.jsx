import React, { useEffect, useState } from 'react'
import './MyCart.css'
import { IoMdHome } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLoading } from '../Context/LoadingContext';

const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => {
    images[item.replace("./", "")] = r(item);
  });
  return images;
};

const imageMap = importAll(require.context("../assets/Product", false, /\.(png|jpeg|svg|jpg|JPEG)$/));

export const MyCart = () => {
  const greater = '>';
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const { setLoading } = useLoading();
  const [customer, setCustomer] = useState({});
  const [discountMap, setDiscountMap] = useState({});
  const [cartState, setCartState] = useState(() => {
    const storedCart = sessionStorage.getItem("cartState");
    return storedCart ? JSON.parse(storedCart) : {};
  });

  const fetchCart = async () => {
    const customerEmail = sessionStorage.getItem("customerEmail");
    if (!customerEmail) return;

    try {
      const response = await axios.get(`http://localhost:9000/cart/${customerEmail}`);
      if (response.status === 200) {
        setCartItems(response.data);
        const cartData = response.data || []; // Ensure it's an array

        // ✅ Get current cart state from sessionStorage
        const storedCartState = JSON.parse(sessionStorage.getItem("cartState") || "{}");

        const updatedCartState = cartData.reduce((acc, item) => {
          const productId = item.product?.id; // Ensure product exists
          if (!productId) return acc; // Skip if productId is undefined

          // ✅ Check if product already exists in sessionStorage
          if (!storedCartState[productId]) {
            acc[productId] = {
              cartBtnClicked: true,
              cartCount: item.productQuantity, // Assuming API returns `productQuantity`
            };
          } else {
            // Keep existing state if already in sessionStorage
            acc[productId] = storedCartState[productId];
          }

          return acc;
        }, { ...storedCartState }); // Start with stored cart state

        console.log("Updated Cart State:", updatedCartState);

        // ✅ Update state & sessionStorage
        setCartState(updatedCartState);
        sessionStorage.setItem("cartState", JSON.stringify(updatedCartState));

        // ✅ Update total cart count
        const totalCount = Object.values(updatedCartState).reduce(
          (sum, item) => sum + (item.cartCount || 0),
          0
        );
        sessionStorage.setItem("cartCount", totalCount.toString());

        // Notify other components
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Error fetching cart details:", error);
    }
  };

  const updateCartCount = async (productId, increment) => {

    if (increment === 1) { // Increament by 1
      try {
        const response = await axios.patch(`http://localhost:9000/cart-increment?customerEmail=${sessionStorage.getItem("customerEmail")}&productId=${productId}`);

        if (response.status === 200) {
          console.log("Product Increament by 1!");
        } else if (response.status === 404) {
          console.log("Customer or Product not found");
        }
      } catch (error) {
        console.error("Error adding product to cart:", error);
        alert("Something went wrong in adding one product to cart. Please try again!");
      }

    } else {
      try {
        const response = await axios.patch(`http://localhost:9000/cart-decrement?customerEmail=${sessionStorage.getItem("customerEmail")}&productId=${productId}`);

        if (response.status === 200) {
          console.log("Product Decrement by 1!");
        } else if (response.status === 404) {
          console.log("Customer or Product not found");
        }
      } catch (error) {
        console.error("Error adding product to cart:", error);
        alert("Something went wrong in removing one product to cart. Please try again!");
      }
    }

    setCartState((prev) => {
      let newCartState = { ...prev };
      const newCount = Math.max((prev[productId]?.cartCount || 0) + increment, 0);

      if (newCount === 0) {
        delete newCartState[productId]; // ✅ Remove product from cartState when count is 0
      } else {
        newCartState[productId] = {
          ...prev[productId],
          cartCount: newCount,
          cartBtnClicked: true,
        };
      }

      // ✅ Update sessionStorage
      sessionStorage.setItem("cartState", JSON.stringify(newCartState));

      const totalCount = Object.values(newCartState).reduce(
        (sum, item) => sum + (item.cartCount || 0),
        0
      );
      sessionStorage.setItem("cartCount", totalCount.toString());

      window.dispatchEvent(new Event("cartUpdated")); // 🔥 Notify other components

      return newCartState;
    });
  };


  const fetchCustomerDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:9000/customer-email/${sessionStorage.getItem("customerEmail")}`);

      if (response.status === 200) {
        setCustomer(response.data);
      }
    } catch (error) {
      if (error.response.status === 404) {
        console.log("Customer not found");
      } else {
        console.error("Error fetching customer details:", error);
        alert("Something went wrong in fetching Customer Details. Please try again!");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCart();
    fetchCustomerDetails();
  }, [])

  const calculateDiscountPercentage = (mrp, discountAmt) => {
    return mrp > 0 ? Math.round(((mrp - discountAmt) * 100) / mrp) : 0;
  };

  useEffect(() => {
    if (Array.isArray(cartItems)) {
      const discountData = {};
      cartItems.forEach((item) => {
        discountData[item.product.id] = calculateDiscountPercentage(item.product.mrp, item.product.discount_amt);
      });
      setDiscountMap(discountData);
    }
  }, [cartItems]);

  return (
    <div className='my-cart'>
      <div>
        <section className='product-navigate-section'>
          <span className='navigate'>
            <a onClick={() => navigate('/ecommerce/')}>
              <b><IoMdHome /> Home</b>
            </a>
            <span> {greater} </span>
            <a href=''>{"Checkout"}</a>
          </span>
        </section>
      </div>

      <div className='my-cart-section'>
        <div className='cart-section'>
          <div className='cart-nav-section'>
            <div className='cart-info'>
              <div className='cart-info-header'>
                <div className='cart-info-header-upper'>
                  <h3>MY CART</h3>
                  <p>({sessionStorage.getItem('cartCount')} item)</p>
                </div>
                <div className='cart-info-header-lower'>
                  <span>Availabe Points : {customer.customerPoint ? customer.customerPoint.toFixed(2) : '0.00'}</span>
                </div>
              </div>

              <div className='cart-info-body'>
                {cartItems.map((item) => {
                  const discount = discountMap[item.product.id] || 0;
                  return (
                    <div className='cart-info-body-card'>
                      <div className='cart-info-body-card-image'>
                        <img src={imageMap[item.product.image_url || "default.jpg"]} alt="" />
                      </div>

                      <div className='cart-info-card-details'>
                        <p>{item.product.name} | {item.product.variantName}</p>
                        <div className='product-offer-price'>
                          {discount > 0 && <span className='product-regular-price'>₹{item.product.mrp.toFixed(2)}</span>}
                          <span className='product-discount-price'>₹{item.product.discount_amt.toFixed(2)}</span>
                        </div>
                        <div className='add-to-cart-quantity'>
                          <button onClick={() => updateCartCount(item.product.id, -1)}>-</button>
                          <span>{cartState[item.product.id]?.cartCount || 0}</span>
                          <button onClick={() => updateCartCount(item.product.id, 1)}>+</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>


              <div className='cart-info-payment'>

              </div>

            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
