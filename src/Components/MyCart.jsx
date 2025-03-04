import React, { useEffect, useState } from 'react'
import './MyCart.css'
import { IoMdHome } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLoading } from '../Context/LoadingContext';
import { HiMiniMinusSmall } from "react-icons/hi2";
import { FaRegEdit } from "react-icons/fa";
import { ImCancelCircle } from "react-icons/im";
import { FaArrowRightLong } from "react-icons/fa6";
import { MdCancelPresentation } from "react-icons/md";
import Swal from 'sweetalert2';
import { FaUser, FaPhone, FaEnvelope, FaCity, FaMapMarkerAlt, FaClipboardList, FaClock } from "react-icons/fa";
import { FaPhoneAlt } from "react-icons/fa";

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
  const [showDeliveryAddress, setDeliveryAddress] = useState(true);
  const [showPaymentMethod, setPaymentMethod] = useState(true);

  const [couponCode, setCouponCode] = useState({}); // For Coupon Code

  const [updateDelivery, setUpdateDelivery] = useState({
    customerName: "",
    customerMobile: "",
    customerEmail: "",
    customerCity: 0,
    customerPincode: "",
    customerAddress: "",
    specialInstructions: "",
    customerPoints: 0,
    deliveryTime: 0,
    paymentMethod: 1
  });

  // Use useEffect to update state when customer data is available
  useEffect(() => {
    if (customer) {
      setUpdateDelivery((prev) => ({
        ...prev,
        customerName: customer.customerName || "",
        customerMobile: customer.customerMobile || "",
        customerEmail: customer.customerEmail || "",
        customerAddress: customer.customerAddress || "",
        customerPincode: customer.customerPincode || "",
        customerCity: customer.customerCity?.cityId || 0,
        customerPoints: customer.customerPoints || 0
      }));
    }
  }, [customer]);

  const [errors, setErrors] = useState({});

  // Validation function
  const validateField = (name, value) => {
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };

      if (name === "customerName") {
        if (!value.trim()) updatedErrors.customerName = "Full Name is required!";
        else delete updatedErrors.customerName; // ✅ Remove key instead of setting empty string
      }
      if (name === "customerMobile") {
        if (!value.trim()) updatedErrors.customerMobile = "Phone number is required!";
        else if (!/^\d{10}$/.test(value)) updatedErrors.customerMobile = "Invalid phone number! Must be 10 digits.";
        else delete updatedErrors.customerMobile;
      }
      if (name === "customerCity") {
        if (!value || value === 0) updatedErrors.customerCity = "Please select a city!";
        else delete updatedErrors.customerCity;
      }
      if (name === "customerAddress") {
        if (!value.trim()) updatedErrors.customerAddress = "Address is required!";
        else delete updatedErrors.customerAddress;
      }
      if (name === "customerPincode") {
        if (!value.trim()) updatedErrors.customerPincode = "Pincode is required!";
        else if (!/^\d{6}$/.test(String(value))) updatedErrors.customerPincode = "Invalid Pincode! Must be 6 digits.";
        else delete updatedErrors.customerPincode;
      }
      if (name === "deliveryTime") {
        if (!value || value === 0) updatedErrors.deliveryTime = "Please select a delivery time!";
        else delete updatedErrors.deliveryTime;
      }

      return updatedErrors; // ✅ Return the new updated object
    });
  };


  // Handle change in input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdateDelivery((prev) => ({ ...prev, [name]: value }));

    validateField(name, value);
  };

  const handleCheckBoxOption = (e) => {
    const { name, value } = e.target;
    setUpdateDelivery((prev) => ({ ...prev, [name]: Number(value) }));
    validateField(name, Number(value));
  };


  const placeOrder = async (paymentId = null) => {
    try {
      const response = await axios.post(
        `http://localhost:9000/add-order/${sessionStorage.getItem("customerEmail")}`,
        {
          name: updateDelivery.customerName,
          mobile: updateDelivery.customerMobile,
          email: updateDelivery.customerEmail,
          cityId: updateDelivery.customerCity,
          address: updateDelivery.customerAddress,
          pincode: updateDelivery.customerPincode,
          specialInstructions: updateDelivery.specialInstructions,
          paymentMode: updateDelivery.paymentMethod,
          totalAmount: calculateTotalPayable(),
          deliveryTimeSlotId: updateDelivery.deliveryTime,
          carts: cartItems
        }
      );

      if (response.status === 200) {
        if(updateDelivery.paymentMethod === 1) {
          await Swal.fire({
            title: "Order",
            text: "Order Placed Successfully!",
            icon: "success",
            confirmButtonText: "OK",
          });
        }
        return response.data;
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setLoading(false);
      Swal.fire({
        title: "Order",
        text: "Order Placement Failed!",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
    return null;
  };

  // Function to update customer details
  const updateCustomer = async () => {
    try {
      const customerData = {
        cityId: updateDelivery.customerCity,
        pincode: updateDelivery.customerPincode,
      };

      if (customer.customerPoint > 0) {
        customerData.points = customer.customerPoint;
      }

      const response = await axios.patch(
        `http://localhost:9000/customer-update/${sessionStorage.getItem("customerEmail")}`,
        customerData
      );

      if (response.status === 200) {
        console.log("Customer Updated Successfully!");
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Something went wrong in updating customer. Please try again!");
    }
  };

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => console.log("Razorpay SDK loaded successfully");
      script.onerror = () => console.error("Failed to load Razorpay SDK");
      document.body.appendChild(script);
    }
  }, []);

  // Function to handle online payment
  const handleOnlinePayment = async () => {
    try {
      console.log("Placing order to generate invoiceNum...");

      // Step 1: Call `addOrder` to generate `invoiceNum`
      const orderResponse = await axios.post(
        `http://localhost:9000/add-order/${sessionStorage.getItem("customerEmail")}`,
        {
          name: updateDelivery.customerName,
          mobile: updateDelivery.customerMobile,
          email: updateDelivery.customerEmail,
          cityId: updateDelivery.customerCity,
          address: updateDelivery.customerAddress,
          pincode: updateDelivery.customerPincode,
          specialInstructions: updateDelivery.specialInstructions,
          paymentMode: 2, // 2 = Online Payment
          totalAmount: calculateTotalPayable(),
          deliveryTimeSlotId: updateDelivery.deliveryTime,
          carts: cartItems,
        }
      );

      // const orderResponse = await placeOrder();

      if (!orderResponse.data || !orderResponse.data.invoiceNum) {
        throw new Error("Failed to generate invoice number.");
      }

      const invoiceNum = orderResponse.data.invoiceNum;
      console.log("Generated Invoice Number:", invoiceNum);

      // Step 2: Create Razorpay Order using invoiceNum
      console.log("Initiating Razorpay Payment...");
      const paymentResponse = await axios.post("http://localhost:9000/create-order", {
        amount: calculateTotalPayable(),
        currency: "INR",
      });

      console.log("Razorpay Order Response:", paymentResponse.data);

      if (!paymentResponse.data || !paymentResponse.data.id) {
        Swal.fire({
          title: "Payment Error",
          text: "Invalid response from payment gateway. Please try again later!",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      const { id: orderId, amount, currency } = paymentResponse.data;

      if (!window.Razorpay) {
        Swal.fire({
          title: "Payment Error",
          text: "Razorpay SDK failed to load. Please refresh the page!",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      // Step 3: Configure Razorpay Checkout
      const options = {
        key: "rzp_test_pWCWqEM13KbeBP",
        amount: amount,
        currency: currency,
        name: "Bits Infotech",
        description: "Transaction",
        order_id: orderId,
        handler: async function (response) {
          console.log("Payment Success:", response);

          try {
            // Step 4: Verify Payment
            const verifyResponse = await axios.post("http://localhost:9000/verify-payment", {
              invoiceNum: invoiceNum,  // ✅ Ensure this is not undefined
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            console.log("Payment Verification Response:", verifyResponse.data);

            if (verifyResponse.status === 200) {
              await updateCustomer();
              await Swal.fire({
                title: "Order Confirmed!",
                text: "Payment Successful & Order Confirmed!",
                icon: "success",
                confirmButtonText: "OK",
              });
              sessionStorage.removeItem("cartState");
              sessionStorage.removeItem("cartCount");
              window.dispatchEvent(new Event("cartUpdated"));
              navigate(`/ecommerce/view-order/${invoiceNum}`);
              window.location.reload();
            } else {
              Swal.fire({
                title: "Payment Error",
                text: "Payment verification failed. Please contact support.",
                icon: "error",
                confirmButtonText: "OK",
              });
            }
          } catch (error) {
            console.error("Payment Verification Error:", error);
            Swal.fire({
              title: "Payment Error",
              text: "Payment verification failed. Please try again.",
              icon: "error",
              confirmButtonText: "OK",
            });
          }
        },
        prefill: {
          name: updateDelivery.customerName,
          email: updateDelivery.customerEmail,
          contact: updateDelivery.customerMobile,
        },
        theme: { color: "#3399cc" },
      };

      console.log("Opening Razorpay Checkout...");
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay Error:", error);
      Swal.fire({
        title: "Payment",
        text: "Failed to initiate online payment!",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };


  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (updateDelivery.paymentMethod === 1) {
      try {
        const {invoiceNum} = await placeOrder();
        console.log("Generated Invoice Number:", invoiceNum);
        await updateCustomer();

        sessionStorage.removeItem("cartState");
        sessionStorage.removeItem("cartCount");
        window.dispatchEvent(new Event("cartUpdated"));

        navigate(`/ecommerce/view-order/${invoiceNum}`);
        window.location.reload();
      } catch (error) {
        console.error("Error during order placement process:", error);
      }
    }
    else if (updateDelivery.paymentMethod === 2) {
      handleOnlinePayment();
    }
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
          const productId = item.product?.id;
          if (!productId) return acc;

          acc[productId] = {
            cartBtnClicked: true,
            cartCount: item.productQuantity, // Use API `productQuantity`
          };

          return acc;
        }, {}); // Do NOT merge with storedCartState

        // ✅ Update state & sessionStorage
        setCartState(updatedCartState);
        sessionStorage.setItem("cartState", JSON.stringify(updatedCartState));

        // ✅ Count unique products, NOT total quantity
        const uniqueItemCount = Object.keys(updatedCartState).length;
        const previousCartCount = parseInt(sessionStorage.getItem("cartCount"), 10) || 0;

        if (uniqueItemCount !== previousCartCount) {
          sessionStorage.setItem("cartCount", uniqueItemCount.toString());
          window.dispatchEvent(new Event("cartUpdated")); // 🔥 Notify only if cartCount changed
        }
      }
    } catch (error) {
      console.error("Error fetching cart details:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [cartState, cartItems]);

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      const response = await axios.patch(`http://localhost:9000/remove-cart?customerEmail=${sessionStorage.getItem("customerEmail")}&productId=${productId}`);

      if (response.status === 200) {
        setCartState((prev) => {
          let newCartState = { ...prev };
          delete newCartState[productId]; // Remove item

          sessionStorage.setItem("cartState", JSON.stringify(newCartState));

          // ✅ Update total cart count
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

          return newCartState;
        });
      }
    } catch (error) {
      console.error("Error removing product from cart:", error);
      alert("Something went wrong in removing product from cart. Please try again!");
    } finally {
      setLoading(false);
    }
  }

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
      const prevCount = prev[productId]?.cartCount || 0; // Previous quantity
      const newCount = Math.max(prevCount + increment, 0); // Updated quantity

      let cartCount = parseInt(sessionStorage.getItem("cartCount") || "0", 10);

      if (newCount === 0) {
        console.log("Product removed from cart:", productId);
        delete newCartState[productId]; // ✅ Remove from cartState
        cartCount -= 1; // ✅ Remove 1 unique item from cart count
      } else {
        newCartState[productId] = {
          ...prev[productId],
          cartCount: newCount,
          cartBtnClicked: true,
        };

        // if (prevCount === 0) {
        //   cartCount += 1; // ✅ Add 1 to cart count when a new item is added
        // }
      }

      // ✅ Ensure cartCount is never negative
      cartCount = Math.max(cartCount, 0);

      setTimeout(() => {
        sessionStorage.setItem("cartState", JSON.stringify(newCartState));

        if (cartCount === 0) {
          sessionStorage.removeItem("cartState");
          sessionStorage.setItem("cartCount", "0");
          window.dispatchEvent(new Event("cartUpdated"));
          navigate('/ecommerce/');
          window.location.reload();
        } else {
          sessionStorage.setItem("cartCount", cartCount.toString());
          window.dispatchEvent(new Event("cartUpdated"));
        }
      }, 100);

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
    if (!sessionStorage.getItem("isAuthenticated")) {
      navigate('/ecommerce/');
    }

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

  const fetchDeliveryTimes = async () => {
    try {
      const response = await axios.get(`http://localhost:9000/time-slot`);

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
                      <div className='like-icon3' onClick={() => removeFromCart(item.product.id)}>
                        <MdCancelPresentation />
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
                  {calculateNetAmount() < 500 && <span style={{ color: '#133365', display: 'flex' }}>Shop for ₹{500 - calculateNetAmount()} more for free shipping.</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="my-delivery-section"
            onClick={(e) => {
              e.stopPropagation();
              setDeliveryAddress(!showDeliveryAddress);
            }}>
            <div className="my-delivery-section-header">
              <div className={showDeliveryAddress ? "orange" : "green"}>1</div>
              <h1>DELIVERY ADDRESS</h1>
            </div>
            {showDeliveryAddress && <div className="my-delivery-section-body"
              onClick={(e) => e.stopPropagation()}>
              <div className="delivery-form">
                <div className="form-group">
                  <h3><FaUser /> FULL NAME *</h3>
                  <input
                    type="text"
                    name='customerName'
                    value={updateDelivery.customerName || ""}
                    onChange={handleChange}
                  />
                  {errors.customerName && <span className="error">{errors.customerName}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <h3><FaPhoneAlt /> PHONE *</h3>
                    <input
                      type="text"
                      name='customerMobile'
                      value={updateDelivery.customerMobile || ""}
                      onChange={handleChange}
                      style={{ width: "95%" }}
                      disabled
                    />
                    {errors.customerMobile && <span className="error">{errors.customerMobile}</span>}
                  </div>

                  <div className="form-group" style={{ marginLeft: "10px" }}>
                    <h3><FaEnvelope /> EMAIL ADDRESS</h3>
                    <input type="text" value={updateDelivery.customerEmail || ""} disabled />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <h3><FaCity /> CITY *</h3>
                    <select
                      value={updateDelivery.customerCity || ""}
                      onChange={handleCheckBoxOption}
                      name='customerCity'
                      required
                    >
                      <option value={0}>Select City</option>
                      {cities.map((city) => (
                        <option key={city.cityId} value={city.cityId}>
                          {city.cityName}
                        </option>
                      ))}
                    </select>
                    {errors.customerCity && <span className="error">{errors.customerCity}</span>}
                  </div>

                  <div className="form-group">
                    <h3><FaMapMarkerAlt /> PINCODE *</h3>
                    <input
                      type="text"
                      name='customerPincode'
                      value={updateDelivery.customerPincode || ""}
                      onChange={handleChange}
                      required
                    />
                    {errors.customerPincode && <span className="error">{errors.customerPincode}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <h3><FaMapMarkerAlt /> SHIPPING ADDRESS *</h3>
                  <textarea
                    value={updateDelivery.customerAddress || ""}
                    onChange={handleChange}
                    name='customerAddress'
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <h3><FaClipboardList /> SPECIAL INSTRUCTIONS</h3>
                  <textarea
                    value={updateDelivery.specialInstructions || ""}
                    onChange={handleChange}
                    name='specialInstructions'
                  ></textarea>
                </div>

                <div className="form-group">
                  <h3><FaClock /> SELECT DELIVERY TIME *</h3>
                  <select
                    value={updateDelivery.deliveryTime || ""}
                    onChange={handleCheckBoxOption}
                    style={{ width: "50%" }}
                    name='deliveryTime'
                    required
                  >
                    <option value={0}>Select Delivery Time</option>
                    {deliveryTime.map((time) => (
                      <option key={time.deliveryTimeSlotId} value={time.deliveryTimeSlotId}>
                        {time.deliveryTime}
                      </option>
                    ))}
                  </select>
                  {errors.deliveryTime && <span className="error">{errors.deliveryTime}</span>}
                </div>
              </div>
            </div>}


            <div className="my-delivery-section-header"
              onClick={(e) => {
                e.stopPropagation();
                setPaymentMethod(!showPaymentMethod);
              }}>
              <div className={showPaymentMethod ? "orange" : "green"}>2</div>
              <h1>PAYMENT</h1>
            </div>
            {showPaymentMethod && <div className='my-delivery-section-body'
              onClick={(e) => e.stopPropagation()}>
              <div className="my-payment-section">
                <input
                  type="radio"
                  id="cash"
                  name="paymentMethod"
                  value={1}
                  checked={updateDelivery.paymentMethod === 1}
                  onChange={handleCheckBoxOption}
                />
                <label htmlFor="cash">CASH ON DELIVERY</label>

                <input
                  type="radio"
                  id="online"
                  name="paymentMethod"
                  value={2}
                  checked={updateDelivery.paymentMethod === 2}
                  onChange={handleCheckBoxOption}
                />
                <label htmlFor="online">PAY ONLINE</label>

              </div>

              <div className='my-payment-section-button'>
                {Object.keys(errors).length === 0 && // ✅ Proper check for an empty object
                  updateDelivery.customerName &&
                  updateDelivery.customerMobile &&
                  updateDelivery.customerCity !== 0 &&
                  updateDelivery.customerPincode &&
                  updateDelivery.customerAddress &&
                  updateDelivery.deliveryTime !== 0 &&
                  (updateDelivery.paymentMethod === 1 ? (
                    <button className="btn-otp" onClick={handlePlaceOrder}>
                      PLACE ORDER <FaArrowRightLong />
                    </button>
                  ) : updateDelivery.paymentMethod === 2 ? (
                    <button className="btn-otp" onClick={handlePlaceOrder}>
                      PROCEED TO PAY <FaArrowRightLong />
                    </button>
                  ) : null)}
              </div>


            </div>}


          </div>
        </div>

      </div>

    </div>
  )
}