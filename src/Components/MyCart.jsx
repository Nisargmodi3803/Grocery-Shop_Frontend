import React, { useEffect, useState } from 'react'
import './MyCart.css'
import { IoMdHome } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLoading } from '../Context/LoadingContext';
import { HiMiniMinusSmall } from "react-icons/hi2";
import { FaRegEdit } from "react-icons/fa";
import { ImCancelCircle } from "react-icons/im";

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

  const [cities, setCities] = useState([]);
  const [deliveryTime, setDeliveryTime] = useState([]);
  const [editMode, setEditMode] = useState({
    name: false,
    mobile: false,
    city: false,
    pincode: false,
    address: false,
    instructions: false,
    deliveryTime: false,
  });

  const [updateDelivery, setUpdateDelivery] = useState({
    customerName: "Shubham Bhatt",
    customerMobile: "8320099260",
    customerEmail: "shubham@bitsinfotech.in",
    customerCity: "1",
    customerPincode: "380051",
    customerAddress: "A-605, Siddhi Vinayak Towers, Ahmedabad",
    specialInstructions: "",
    deliveryTime: "",
  });

  const handleEditClick = (field) => {
    setEditMode({ ...editMode, [field]: true });
  };

  const handleCancelClick = (field) => {
    setEditMode({ ...editMode, [field]: false });
  };




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

  useEffect(() => {
    fetchCart();
  }, [cartState, cartItems]);

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
        console.log("Product removed from cart:", productId);
        delete newCartState[productId]; // ✅ Remove product from cartState when count is 0
      } else {
        newCartState[productId] = {
          ...prev[productId],
          cartCount: newCount,
          cartBtnClicked: true,
        };
      }

      // ✅ Update sessionStorage
      setTimeout(() => {
        sessionStorage.setItem("cartState", JSON.stringify(newCartState));

        const totalCount = Object.values(newCartState).reduce(
          (sum, item) => sum + (item.cartCount || 0),
          0
        );

        if (totalCount === 0) {
          sessionStorage.removeItem("cartState");
          sessionStorage.setItem("cartCount", "0");
          window.dispatchEvent(new Event("cartUpdated"));
          navigate('/ecommerce/');
          window.location.reload();
        } else {
          sessionStorage.setItem("cartCount", totalCount.toString());
          window.dispatchEvent(new Event("cartUpdated"));
        }
      }, 100); // Small delay to ensure state updates first

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

  const calculateTotalMrp = () => {
    const totalMrp = cartItems.reduce((acc, item) => acc + item.product.mrp * item.productQuantity, 0);
    return totalMrp;
  }

  const calculateDiscount = () => {
    const totalDiscount = cartItems.reduce((acc, item) => acc + item.product.discount_amt * item.productQuantity, 0);
    const discount = calculateTotalMrp() - totalDiscount;
    return discount;
  }

  const calculateNetAmount = () => {
    const netAmount = calculateTotalMrp() - calculateDiscount();
    return netAmount;
  }

  const calculateTotalPointsAmt = () => {
    const totalPoints = Math.floor(customer.customerPoint * 0.1);
    const netAmount = calculateNetAmount() - totalPoints;
    return netAmount;
  }

  const deliveryCharge = () => {
    if (calculateTotalPointsAmt() < 500) {
      return 15;
    } else {
      return 0;
    }
  }

  const calculateTotalPayable = () => {
    const Charge = deliveryCharge();
    return calculateTotalPointsAmt() + Charge;
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

  useEffect(() => {
    const handleCartUpdate = () => {
      setCartState(JSON.parse(sessionStorage.getItem("cartState")) || {});
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const fetchCities = async () => {
    try {
      const response = await axios.get(`http://localhost:9000/cities`);

      if (response.status === 200) {
        setCities(response.data);
      }

    } catch (error) {
      if (error.response.status === 404) {
        console.log("Cities not found");
      } else {
        console.error("Error fetching cities:", error);
        alert("Something went wrong in fetching Cities. Please try again!");
      }
    }
  }

  const fetchDeliveryTimes = () => {
    try {
      const response = axios.get(`http://localhost:9000/time-slot`);

      if (response.status === 200) {
        setDeliveryTime(response.data);
      }
    } catch (error) {
      if (error.response.status === 404) {
        console.log("Delivery Times not found");
      } else {
        console.error("Error fetching delivery times:", error);
        alert("Something went wrong in fetching Delivery Times. Please try again!");
      }
    }
  }

  useEffect(() => {
    fetchCities();
    fetchDeliveryTimes();
  }, []);

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
                        <div className='product-offer-price3'>
                          {discount > 0 && <span className='product-regular-price3'>₹{item.product.mrp.toFixed(2)}</span>}
                          <span className='product-discount-price3'>₹{item.product.discount_amt.toFixed(2)}</span>
                        </div>
                        {cartState[item.product.id] ? (
                          <div className='add-to-cart-quantity3'>
                            <button onClick={() => updateCartCount(item.product.id, -1)}>-</button>
                            <span>{cartState[item.product.id]?.cartCount || 0}</span>
                            <button onClick={() => updateCartCount(item.product.id, 1)}>+</button>
                          </div>
                        ) : (
                          null // ✅ Item removed when count is 0
                        )}

                      </div>
                    </div>
                  )
                })}
              </div>

              <div className='cart-info-payment'>
                <div className='cart-info-payment-discount'>
                  <div className='cart-info-payment-discount-code'>
                    <input
                      type='text'
                      placeholder='Enter Discount Code'
                    />
                    <button>Apply</button>
                  </div>

                  <div className='cart-info-payment-show-offer'>
                    <span>SHOW OFFERS</span>
                  </div>
                </div>

                <div className='cart-info-payment-bill'>
                  <div className='cart-info-payment-bill-total'>
                    <div className='cart-mrp-total'>
                      <span>MRP TOTAL</span>
                      <p>₹{calculateTotalMrp()}</p>
                    </div>
                    <div className='cart-discount-total'>
                      <span>DISCOUNT</span>
                      <p><HiMiniMinusSmall />₹{calculateDiscount()}</p>
                    </div>
                  </div>

                  <div className='cart-info-payment-bill-points'>
                    <div className='cart-net-total'>
                      <p>NET AMOUNT (For Offer) </p>
                      <span>₹{calculateNetAmount()}</span>
                    </div>

                    <div className='cart-points-used'>
                      <p>POINTS USED</p>
                      <span><HiMiniMinusSmall />{customer.customerPoint}</span>
                    </div>

                    <div className='cart-delivery-charge'>
                      <p>DELIVERY CHARGE</p>
                      <span> +₹{deliveryCharge()}</span>
                    </div>
                  </div>

                  <div className='cart-info-payment-bill-total-payable'>
                    <h3>TOTAL PAYABLE</h3>
                    <span>₹{calculateTotalPayable()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="my-delivery-section">
            <div className="my-delivery-section-header">
              <span>1</span>
              <h1>DELIVERY ADDRESS</h1>
            </div>
            <div className="my-delivery-section-body">
              <div className="delivery-detail">
                {/* Full Name */}
                <h3>👤 FULL NAME</h3>
                {editMode.name ? (
                  <div className="edit-part1">
                    <input
                      type="text"
                      value={updateDelivery.customerName}
                      onChange={(e) =>
                        setUpdateDelivery({ ...updateDelivery, customerName: e.target.value })
                      }
                    />
                    <span className="delete1" onClick={() => handleCancelClick("name")}>
                      <ImCancelCircle />
                    </span>
                  </div>
                ) : (
                  <p>
                    {updateDelivery.customerName}
                    <span className="edit1" onClick={() => handleEditClick("name")}>
                      <FaRegEdit />
                    </span>
                  </p>
                )}

                {/* Mobile Number */}
                <h3>📞 PHONE</h3>
                {editMode.mobile ? (
                  <div className="edit-part1">
                    <input
                      type="text"
                      value={updateDelivery.customerMobile}
                      onChange={(e) =>
                        setUpdateDelivery({ ...updateDelivery, customerMobile: e.target.value })
                      }
                    />
                    <span className="delete1" onClick={() => handleCancelClick("mobile")}>
                      <ImCancelCircle />
                    </span>
                  </div>
                ) : (
                  <p>
                    {updateDelivery.customerMobile}
                    <span className="edit1" onClick={() => handleEditClick("mobile")}>
                      <FaRegEdit />
                    </span>
                  </p>
                )}

                {/* Email Address (Non-Editable) */}
                <h3>✉️ EMAIL ADDRESS</h3>
                <p>{updateDelivery.customerEmail}</p>

                {/* City Selection */}
                <h3>🏙️ CITY</h3>
                {editMode.city ? (
                  <div className="edit-part1">
                    <select
                      className="sort-dropdown"
                      value={updateDelivery.customerCity}
                      onChange={(e) => setUpdateDelivery({ ...updateDelivery, customerCity: e.target.value })}
                    >
                      <option value="0">Select City</option>
                      {
                        cities.map((city) => (
                          <option key={city.id} value={city.id}>{city.cityName}</option>
                        ))
                      }
                    </select>
                    <span className="delete1" onClick={() => handleCancelClick("city")}>
                      <ImCancelCircle />
                    </span>
                  </div>
                ) : (
                  <p>
                    Not Selected
                    <span className="edit1" onClick={() => handleEditClick("city")}>
                      <FaRegEdit />
                    </span>
                  </p>
                )}

                {/* Pincode */}
                <h3>🔢 PINCODE</h3>
                {editMode.pincode ? (
                  <div className="edit-part1">
                    <input
                      type="text"
                      value={updateDelivery.customerPincode}
                      onChange={(e) =>
                        setUpdateDelivery({ ...updateDelivery, customerPincode: e.target.value })
                      }
                    />
                    <span className="delete1" onClick={() => handleCancelClick("pincode")}>
                      <ImCancelCircle />
                    </span>
                  </div>
                ) : (
                  <p>
                    {updateDelivery.customerPincode}
                    <span className="edit1" onClick={() => handleEditClick("pincode")}>
                      <FaRegEdit />
                    </span>
                  </p>
                )}

                {/* Address */}
                <h3>📍 SHIPPING ADDRESS</h3>
                {editMode.address ? (
                  <div className="edit-part1">
                    <input
                      type="text"
                      value={updateDelivery.customerAddress}
                      onChange={(e) =>
                        setUpdateDelivery({ ...updateDelivery, customerAddress: e.target.value })
                      }
                    />
                    <span className="delete1" onClick={() => handleCancelClick("address")}>
                      <ImCancelCircle />
                    </span>
                  </div>
                ) : (
                  <p>
                    {updateDelivery.customerAddress || "Not Specified Yet"}
                    <span className="edit1" onClick={() => handleEditClick("address")}>
                      <FaRegEdit />
                    </span>
                  </p>
                )}

                {/* Special Instructions */}
                <h3>📝 SPECIAL INSTRUCTIONS</h3>
                {editMode.instructions ? (
                  <div className="edit-part1">
                    <textarea
                      value={updateDelivery.specialInstructions}
                      onChange={(e) =>
                        setUpdateDelivery({ ...updateDelivery, specialInstructions: e.target.value })
                      }
                    ></textarea>
                    <span className="delete1" onClick={() => handleCancelClick("instructions")}>
                      <ImCancelCircle />
                    </span>
                  </div>
                ) : (
                  <p>
                    {updateDelivery.specialInstructions || "No Special Instructions"}
                    <span className="edit1" onClick={() => handleEditClick("instructions")}>
                      <FaRegEdit />
                    </span>
                  </p>
                )}

                {/* Delivery Time Slot */}
                <h3>⏰ SELECT DELIVERY TIME</h3>
                {editMode.deliveryTime ? (
                  <div className="edit-part1">
                    <select
                      className="sort-dropdown"
                      value={updateDelivery.deliveryTime}
                      onChange={(e) => setUpdateDelivery({ ...updateDelivery, deliveryTime: e.target.value })}
                    >
                      <option value="">Select Time Slot</option>
                      {deliveryTime.map((time) => (
                        <option key={time.deliveryTimeSlotId} value={time.deliveryTime}>{time.deliveryTime}</option>
                      ))}
                    </select>
                    <span className="delete1" onClick={() => handleCancelClick("deliveryTime")}>
                      <ImCancelCircle />
                    </span>
                  </div>
                ) : (
                  <p>
                    {updateDelivery.deliveryTime || "Not Selected"}
                    <span className="edit1" onClick={() => handleEditClick("deliveryTime")}>
                      <FaRegEdit />
                    </span>
                  </p>
                )}
              </div>
            </div>
            {/* <div className='my-cart-header'>
              
              <h3></h3>
            </div>

            <div className='my-cart-header'>
              <span>2</span>
              <h3>PAYMENT</h3>
            </div> */}

          </div>
        </div>

      </div>

    </div>
  )
}
