import './MyWishlist.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ImageModal } from './ImageModal';
import { useNavigate } from 'react-router-dom';
import { FaUserEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useLoading } from "../Context/LoadingContext";
import { IoPersonOutline } from "react-icons/io5";
import { TbPasswordUser } from "react-icons/tb";
import { CiCircleList } from "react-icons/ci";
import { MdCurrencyRupee } from "react-icons/md";
import { RiCouponLine } from "react-icons/ri";
import { BsCreditCard2Back } from "react-icons/bs";
import { MdLock } from "react-icons/md";
import Swal from 'sweetalert2';
import { MdOutlineStarPurple500, MdOutlineShoppingCart, MdRemoveShoppingCart } from "react-icons/md";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { MdAccessTime, MdOutlineChatBubbleOutline } from "react-icons/md";
import { MdCancelPresentation } from "react-icons/md";
import { InquiryNow } from './InquiryNow';
import { use } from 'react';

const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => {
    images[item.replace("./", "")] = r(item);
  });
  return images;
};

const imageMap = importAll(require.context("../assets/Customer", false, /\.(png|jpeg|svg|jpg|JPEG|JPG)$/));
const productMap = importAll(require.context("../assets/Product", false, /\.(png|jpeg|svg|jpg|JPEG)$/));


export const MyWishList = () => {
  const [customer, setCustomer] = useState({});
  const [image, setImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hovered, setHovered] = useState(false); // For handling hover state
  const [file, setFile] = useState(null); // To hold the selected file
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const [products, setProducts] = useState([]);
  const [discountMap, setDiscountMap] = useState([]);
  const [inquiryProductId, setInquiryProductId] = useState(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [cartState, setCartState] = useState(() => {
    const storedCart = sessionStorage.getItem("cartState");
    return storedCart ? JSON.parse(storedCart) : {};
  });
  const [productNotFound, setProductNotFound] = useState(false);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:9000/profile/${sessionStorage.getItem("customerEmail")}`);
      if (response.status === 200) {
        setCustomer(response.data);
        setImage(response.data.customerImage || 'default.png');
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
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, []);

  const handleImageChange = async (event) => {
    const selectedFile = event.target.files[0];
    console.log("Handle Image Change Call");
    // setLoading(true);
    if (selectedFile) {
      setFile(selectedFile);
      setImage(URL.createObjectURL(selectedFile)); // Set the preview
      setIsEditing(true);

      // Create FormData and append the file with the correct key "file"
      const formData = new FormData();
      formData.append('file', selectedFile);  // <-- Key should be "file" (matches backend)

      try {
        console.log("API CALL")
        const response = await axios.patch(
          `http://localhost:9000/change-profile-image/${sessionStorage.getItem("customerEmail")}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.status === 200) {
          console.log('Image uploaded successfully:', response.data);
          setImage(customer.customerImage);  // Update the image if successful
          window.location.reload();
        } else {
          console.error('Error uploading image:', response);
          alert("Error uploading image. Please try again!");
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert("Something went wrong with image upload.");
      }
    }
  };


  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => setHovered(false);

  const handleViewClick = () => {
    if (image !== 'default.png') {
      setShowModal(true);
    }
  };

  const deleteProfileImageAlert = async () => {
    return await Swal.fire({
      title: "Are you sure you want to delete this Profile Image?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });
  };

  const handleDeleteClick = async () => {
    setLoading(true);
    const result = await deleteProfileImageAlert(); // Await the user's response

    if (result.isConfirmed) {
      if (image !== 'default.png') {
        try {
          const response = await axios.patch(`http://localhost:9000/delete-profile-image/${sessionStorage.getItem("customerEmail")}`);
          if (response.status === 200) {
            console.log('Image deleted successfully:', response.data);
            setImage('default.png'); // Update the image after deletion
            Swal.fire("Deleted!", "Your profile image has been deleted.", "success");
          }
        } catch (error) {
          if (error.response?.status === 404) {
            console.log("Customer not found");
            Swal.fire("Error", "Customer not found.", "error");
          } else {
            console.error('Error deleting image:', error);
            Swal.fire("Error", "Something went wrong. Please try again!", "error");
          }
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleEditClick = () => {
    document.getElementById("file-input").click(); // Trigger the file input on edit click
  };

  const logoutAlert = async () => {
    return await Swal.fire({
      title: "Are you sure you want to Logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });
  };

  const handleLogout = async () => {
    const result = await logoutAlert();
    if (result.isConfirmed) {
      sessionStorage.removeItem("isAuthenticated");
      sessionStorage.removeItem("customerEmail");
      sessionStorage.removeItem("cartCount");
      sessionStorage.removeItem("customerData");
      sessionStorage.removeItem("cartState");
      await Swal.fire("Logged Out!", "You have been logged out.", "success");
      navigate("/ecommerce/");
      window.location.reload();
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const fetchWishListProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:9000/wishlist/${sessionStorage.getItem("customerEmail")}`);
      if (response.status === 200) {
        setProducts(response.data.map(item => item.product));
      }
    } catch (error) {
      if (error.response.status === 404) {
        console.log("Customer not found");
      } else {
        console.error("Error fetching wish list:", error);
      }
    } finally {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }

  useEffect(() => {
    fetchWishListProducts();
  }, []);

  useEffect(() => {
    if (!sessionStorage.getItem("isAuthenticated")) {
      navigate("/ecommerce/");
    }
  }, []);

  const calculateDiscountPercentage = (mrp, discountAmt) => {
    return mrp > 0 ? Math.round(((mrp - discountAmt) * 100) / mrp) : 0;
  };

  useEffect(() => {
    if (Array.isArray(products)) {
      const discountData = {};
      products.forEach((product) => {
        discountData[product.id] = calculateDiscountPercentage(product.mrp, product.discount_amt);
      });
      setDiscountMap(discountData);
    }
  }, [products]);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedCart = sessionStorage.getItem("cartState");
      setCartState(storedCart ? JSON.parse(storedCart) : {});
    };

    window.addEventListener("cartUpdated", handleStorageChange);
    return () => window.removeEventListener("cartUpdated", handleStorageChange);
  }, []);

  const toggleCartState = async (productId) => {
    try {
      const response = await axios.post(
        `http://localhost:9000/add-cart?customerEmail=${sessionStorage.getItem("customerEmail")}&productId=${productId}`
      );

      if (response.status === 200) {
        console.log("Product added to cart successfully");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("Customer or Product not found");
      } else {
        console.error("Error adding product to cart:", error);
        alert("Something went wrong in adding product to cart. Please try again!");
      }
    }

    setCartState((prev) => {
      const isCurrentlyInCart = prev[productId]?.cartBtnClicked || false;
      let newCartState = { ...prev };

      if (!isCurrentlyInCart) {
        // ✅ If product is newly added, set quantity to 1
        newCartState[productId] = {
          cartBtnClicked: true,
          cartCount: 1,
        };
      } else {
        // ✅ If product is removed, delete from cart
        delete newCartState[productId];
      }

      // ✅ Count only unique products
      const uniqueItemCount = Object.keys(newCartState).length;

      // ✅ Update sessionStorage
      sessionStorage.setItem("cartState", JSON.stringify(newCartState));
      sessionStorage.setItem("cartCount", uniqueItemCount.toString());

      window.dispatchEvent(new Event("cartUpdated")); // 🔥 Notify other components

      return newCartState;
    });
  };



  const updateCartCount = async (productId, increment) => {
    try {
      const customerEmail = sessionStorage.getItem("customerEmail");
      const apiUrl =
        increment === 1
          ? `http://localhost:9000/cart-increment?customerEmail=${customerEmail}&productId=${productId}`
          : `http://localhost:9000/cart-decrement?customerEmail=${customerEmail}&productId=${productId}`;

      const response = await axios.patch(apiUrl);
      if (response.status !== 200) {
        console.log("Customer or Product not found");
        return;
      }

      setCartState((prev) => {
        let newCartState = { ...prev };
        const prevCount = prev[productId]?.cartCount || 0;
        const newCount = Math.max(prevCount + increment, 0); // Ensure no negative quantity

        if (newCount === 0) {
          delete newCartState[productId]; // ✅ Remove item when quantity reaches 0
        } else {
          newCartState[productId] = {
            cartBtnClicked: true,
            cartCount: newCount,
          };
        }

        // ✅ Count only unique products
        const uniqueItemCount = Object.keys(newCartState).length;

        // ✅ Update sessionStorage
        sessionStorage.setItem("cartState", JSON.stringify(newCartState));
        sessionStorage.setItem("cartCount", uniqueItemCount.toString());

        window.dispatchEvent(new Event("cartUpdated")); // 🔥 Notify other components

        return newCartState;
      });
    } catch (error) {
      console.error("Error updating product in cart:", error);
      alert("Something went wrong. Please try again!");
    }
  };


  const navigateToProductPage = (productSlugTitle) => () => {
    navigate(`/ecommerce/product/${productSlugTitle}`);
  };

  const handleInquiryClick = (productId) => {
    setInquiryProductId(productId);
    setInquiryModalOpen(true);
  };

  const closeInquiryModal = () => {
    setInquiryModalOpen(false);
    setInquiryProductId(null);
  };

  const toggleDislike = async (productId) => {
    setLoading(true);
    try {
      const response = await axios.patch(`http://localhost:9000/remove-wishlist?customerEmail=${sessionStorage.getItem("customerEmail")}&productId=${productId}`);

      if (response.status === 200) {
        console.log(`Product disliked successfully`);
        window.location.reload();
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("Customer not found");
      } else {
        console.error(`Error disliking product:`, error);
        alert("Something went wrong in disliking the product. Please try again!");
      }
    } finally {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }

  const fetchCart = async () => {
    const customerEmail = sessionStorage.getItem("customerEmail");
    if (!customerEmail) return;

    try {
      const response = await axios.get(`http://localhost:9000/cart/${customerEmail}`);
      if (response.status === 200) {
        const cartData = response.data || []; // Ensure array

        // ✅ Get current cart state from sessionStorage
        const storedCartState = JSON.parse(sessionStorage.getItem("cartState") || "{}");

        const updatedCartState = cartData.reduce((acc, item) => {
          const productId = item.product?.id;
          if (!productId) return acc;

          acc[productId] = {
            cartBtnClicked: true,
            cartCount: item.productQuantity, // Assuming API returns `productQuantity`
          };

          return acc;
        }, {}); // Reset previous cart state

        // ✅ Update state & sessionStorage
        setCartState(updatedCartState);
        sessionStorage.setItem("cartState", JSON.stringify(updatedCartState));

        // ✅ Calculate unique product count
        const uniqueItemCount = Object.keys(updatedCartState).length;
        const previousCartCount = parseInt(sessionStorage.getItem("cartCount"), 10) || 0;

        if (uniqueItemCount !== previousCartCount) {
          sessionStorage.setItem("cartCount", uniqueItemCount.toString());
          window.dispatchEvent(new Event("cartUpdated")); // 🔥 Notify only if count changed
        }
      }
    } catch (error) {
      console.error("Error fetching cart details:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [])

  return (
    <div className='my-wishlist'>
      <div className='profile-section'>
        <div className='profile-nav-section'>
          <div className='profile-info'>
            <div
              className='profile-image'
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={image && image !== 'default.png' ? `http://localhost:9000/uploads/${image}` : imageMap[image] || image}
                alt="Profile"
                onClick={() => {
                  handleViewClick();
                }}
                disabled={image === 'default.png'}
              />
              {hovered && (
                <div className="image-options">
                  <button className="edit-btn" onClick={() => {
                    handleEditClick();
                    // window.location.reload();
                  }}>
                    {/* <FaUserEdit/> Edit */}
                    <FaUserEdit />
                  </button>
                  <button
                    className={`view-btn ${image === 'default.png' ? 'disabled' : ''}`}
                    onClick={() => {
                      handleDeleteClick();
                      window.location.reload();
                    }}
                    disabled={image === 'default.png'}
                  >
                    {/* <MdDelete/> Delete */}
                    <MdDelete />
                  </button>
                </div>
              )}
            </div>
            <h3><b>Hello</b> {customer.customerName}</h3>
            <p>{customer.customerMobile}</p>
            <p className='ecommerce-points'>
              Ecommerce Points: <span>{customer.customerPoints ? customer.customerPoints.toFixed(2) : '0.00'}</span>
            </p>
          </div>
          <ul className='nav-list'>
            <li onClick={() => {
              navigate('/ecommerce/my-profile');
              window.location.reload();
            }}><IoPersonOutline /> My Profile</li>

            <li onClick={() => {
              navigate('/ecommerce/change-password');
              window.location.reload();
            }}><TbPasswordUser /> Change Password</li>

            <li className='active' onClick={() => {
              navigate('/ecommerce/my-wishlist');
              window.location.reload();
            }}><FaRegHeart /> My Wishlist</li>

            <li onClick={() => {
              navigate('/ecommerce/my-orders');
              window.location.reload();
            }}><CiCircleList /> Order List</li>

            <li onClick={() => {
              navigate('/ecommerce/refer-and-earn');
              window.location.reload();
            }}><MdCurrencyRupee /> Refer & Earn</li>

            <li onClick={() => {
              navigate('/ecommerce/coupon-code');
              window.location.reload();
            }}><RiCouponLine /> Coupon Code</li>

            <li onClick={() => {
              navigate('/ecommerce/my-ecommerce');
              window.location.reload();
            }}><BsCreditCard2Back /> My Ecommerce</li>

            <li onClick={handleLogout}><MdLock /> Logout</li>

          </ul>
        </div>

        <div className='my-profile-section'>
          <div className="my-profile-section-header">
            <h1>WISHLIST</h1>
          </div>
          <div className="my-profile-section-body">
            <div className='profile-detail'>
              {products.length > 0 ? (
                <div className='card-section-lower2'>
                  {products.map((product) => {
                    const imageSrc = productMap[product.image_url] || productMap["default.jpg"];
                    const discount = discountMap[product.id] || 0;
                    const rating = product.average_rating ? parseFloat(product.average_rating).toFixed(1) : 0;
                    const mrp = product.mrp ? `₹${product.mrp.toFixed(2)}` : "N/A";
                    const discountAmt = product.discount_amt ? `₹${product.discount_amt.toFixed(2)}` : "N/A";

                    return (
                      <>
                        <div className='product2' key={product.id}>
                          <div className='product-header2'>
                            {discount > 0 && (
                              <span className='product-discount2' onClick={navigateToProductPage(product.slug_title)}>
                                {discount}% OFF
                              </span>
                            )}
                            <span className='like-icon2' onClick={() => toggleDislike(product.id)}>
                              <MdCancelPresentation />
                            </span>
                            <div onClick={navigateToProductPage(product.slug_title)}>
                              <img className='product-image2' src={imageSrc} alt={product.name} loading='lazy' />
                            </div>
                          </div>
                          <div className='product-body2'>
                            <h5 className='product-text2'>{product.name}</h5>
                          </div>
                          <div className='product-rating-main2'>
                            {rating > 0 ? (
                              <>
                                <div className='product-rating-avg2'>
                                  <span className='rating2'>{rating} <MdOutlineStarPurple500 color='gold' /></span>
                                </div>
                                <div className='product-rating-total2'>
                                  <span>{product.no_of_rating} Ratings</span>
                                </div>
                              </>
                            ) : (
                              <span className='no-rating2'>No Rating Yet</span>
                            )}
                          </div>
                          <div className='product-footer2'>
                            <div className='product-offer-price2'>
                              {discount > 0 && <span className='product-regular-price2'>{mrp}</span>}
                              <span className='product-discount-price2'>{discountAmt}</span>
                            </div>
                          </div>
                          {cartState[product.id]?.cartBtnClicked ? (
                            <div className='add-to-cart-quantity2'>
                              <button onClick={() => updateCartCount(product.id, -1)}>-</button>
                              <span>{cartState[product.id]?.cartCount || 0}</span>
                              <button onClick={() => updateCartCount(product.id, 1)}>+</button>
                            </div>
                          ) : (
                            product.productIsActive === 1 ? (
                              <button className='add-to-cart2' onClick={() => toggleCartState(product.id)}>
                                <MdOutlineShoppingCart /> Add To Cart
                              </button>
                            ) : (
                              product.productIsActive === 2 ? (
                                <button className='out-of-stock2'><MdRemoveShoppingCart /> Out Of Stock</button>
                              ) : (
                                product.productIsActive === 3 ? (
                                  <button className='coming-soon2'><MdAccessTime /> Coming Soon</button>
                                ) : (
                                  product.productIsActive === 4 ? (
                                    <span className='inquiry-now2'
                                      onClick={() => handleInquiryClick(product.id)}><MdOutlineChatBubbleOutline /> Inquiry Now</span>
                                  ) : null)
                              )
                            )
                          )}
                        </div>
                      </>
                    );
                  })}
                </div>
              ) : (
                { productNotFound } ? (
                  <h1 style={{ fontSize: '1.5rem', color: 'red' }}>
                    NO PRODUCT AVAILABLE ON YOUR WISHLIST!
                  </h1>
                ) : null
              )}
            </div>
          </div>
          <input
            id="file-input"
            type="file"
            style={{ display: 'none' }}
            onChange={handleImageChange}
            accept="image/*"
          />
        </div>
        {showModal && <ImageModal image={image} closeModal={closeModal} />}

        {inquiryModalOpen && <InquiryNow closeModal={closeInquiryModal} productId={inquiryProductId} />}
      </div>
    </div>
  );
}
