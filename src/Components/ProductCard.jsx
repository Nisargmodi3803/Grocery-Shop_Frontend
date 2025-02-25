import React, { useState, useRef, useEffect } from 'react';
import './ProductCard.css';
import { MdOutlineStarPurple500, MdOutlineShoppingCart, MdRemoveShoppingCart } from "react-icons/md";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MdAccessTime } from "react-icons/md";
import { MdOutlineChatBubbleOutline } from "react-icons/md";
import { InquiryNow } from './InquiryNow';
import { LoginSignUpModal } from './LoginSignUpModal';
import { useLoading } from '../Context/LoadingContext';

export const ProductCard = () => {
  const navigate = useNavigate();
  const direction = useRef("normal");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedProducts, setLikedProducts] = useState({});
  const [productList, setProductList] = useState([]);
  const [discountMap, setDiscountMap] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [inquiryProductId, setInquiryProductId] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { setLoading } = useLoading();
  const [cartCount, setCartCount] = useState(0);
  const [cartState, setCartState] = useState(() => {
    const storedCart = sessionStorage.getItem("cartState");
    return storedCart ? JSON.parse(storedCart) : {};
  });


  useEffect(() => {
    setIsAuthenticated(sessionStorage.getItem("isAuthenticated") === "true");
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);

    return () => clearTimeout(timer);
  }, [setLoading]);

  const importAll = (r) => {
    let images = {};
    r.keys().forEach((item) => {
      images[item.replace("./", "")] = r(item);
    });
    return images;
  };

  const imageMap = importAll(require.context("../assets/Product", false, /\.(png|jpeg|svg|jpg|JPEG)$/));

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [vegetablesResponse, fruitsResponse] = await Promise.all([
        axios.get('http://localhost:9000/products-subcategory-title/vegetables'),
        axios.get('http://localhost:9000/products-subcategory-title/fruits')
      ]);

      if (vegetablesResponse.status === 200 || fruitsResponse.status === 200) {
        const allProducts = [
          ...(Array.isArray(vegetablesResponse.data) ? vegetablesResponse.data : []),
          ...(Array.isArray(fruitsResponse.data) ? fruitsResponse.data : [])
        ];

        setProductList(allProducts);
      } else {
        console.log("No Products Found");
        setProductList([]);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("No Products Found");
        setProductList([]);
      } else {
        console.error("Error fetching products:", error);
        alert('Something went wrong. Please try again!');
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProducts();
  }, []);

  const calculateDiscountPercentage = (mrp, discountAmt) => {
    return mrp > 0 ? Math.round(((mrp - discountAmt) * 100) / mrp) : 0;
  };

  useEffect(() => {
    if (Array.isArray(productList)) {
      const discountData = {};
      productList.forEach((product) => {
        discountData[product.id] = calculateDiscountPercentage(product.mrp, product.discount_amt);
      });
      setDiscountMap(discountData);
    }
  }, [productList]);

  const handleNext = () => {
    direction.current = "normal";
    setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.max(1, productList.length - 7));
  };

  const handlePrev = () => {
    direction.current = "reverse";
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? Math.max(0, productList.length - 7) : prevIndex - 1
    );
  };

  const fetchLikedProducts = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await axios.get(`http://localhost:9000/wishlist/${sessionStorage.getItem("customerEmail")}`);

      if (response.status === 200) {
        const likedIds = response.data.map(item => item.product.id);
        const likedState = likedIds.reduce((acc, id) => {
          acc[id] = true;
          return acc;
        }, {});
        setLikedProducts(likedState);
      }
    } catch (error) {
      if (error.response.status === 404) {
        // console.log("Customer not found");
      } else {
        console.error("Error fetching liked products:", error);
        alert("Something went wrong in fetching Liked Products. Please try again!");
      }
    }
  };

  const fetchCart = async () => {
    const customerEmail = sessionStorage.getItem("customerEmail");
    if (!customerEmail) return;

    try {
      const response = await axios.get(`http://localhost:9000/cart/${customerEmail}`);
      if (response.status === 200) {
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



  useEffect(() => {
    fetchLikedProducts();
    fetchCart();
  }, [isAuthenticated]);

  const toggleLike = async (productId) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const isLiked = likedProducts[productId]; // Check if the product is already liked

    try {
      let response;

      if (isLiked) {
        response = await axios.patch(`http://localhost:9000/remove-wishlist?customerEmail=${sessionStorage.getItem("customerEmail")}&productId=${productId}`);
      } else {
        response = await axios.post(`http://localhost:9000/add-wishlist?customerEmail=${sessionStorage.getItem("customerEmail")}&productId=${productId}`);
      }

      if (response.status === 200) {
        console.log(`Product ${isLiked ? "disliked" : "liked"} successfully`);
        setLikedProducts((prev) => ({
          ...prev,
          [productId]: !isLiked,
        }));
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("Customer not found");
      } else {
        console.error(`Error ${isLiked ? "disliking" : "liking"} product:`, error);
        alert(`Something went wrong in ${isLiked ? "disliking" : "liking"} the product. Please try again!`);
      }
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const storedCart = sessionStorage.getItem("cartState");
      setCartState(storedCart ? JSON.parse(storedCart) : {});
    };

    window.addEventListener("cartUpdated", handleStorageChange);
    return () => window.removeEventListener("cartUpdated", handleStorageChange);

  }, []);

  const toggleCartState = async (productId) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    try {
      const response = await axios.post(`http://localhost:9000/add-cart?customerEmail=${sessionStorage.getItem("customerEmail")}&productId=${productId}`);
      if (response.status === 200) {
        console.log("Product added to cart successfully");
      }
    } catch (error) {
      if (error.response.status === 404) {
        console.log("Customer or Product not found");
      } else {
        console.error("Error adding product to cart:", error);
        alert("Something went wrong in adding product to cart. Please try again!");
      }
    }

    setCartState((prev) => {
      const isCurrentlyInCart = prev[productId]?.cartBtnClicked || false;
      const newCartState = {
        ...prev,
        [productId]: {
          ...prev[productId],
          cartBtnClicked: !isCurrentlyInCart,
          cartCount: isCurrentlyInCart ? 0 : (prev[productId]?.cartCount || 1),
        },
      };

      // ✅ Update sessionStorage with full cart state & total count
      sessionStorage.setItem("cartState", JSON.stringify(newCartState));
      const totalCount = Object.values(newCartState).reduce((sum, item) => sum + (item.cartCount || 0), 0);
      sessionStorage.setItem("cartCount", totalCount.toString());

      window.dispatchEvent(new Event("cartUpdated")); // 🔥 Dispatch event

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
        const newCount = Math.max(prevCount + increment, 0); // Ensure count doesn't go negative
  
        if (newCount === 0) {
          delete newCartState[productId]; // Remove product when quantity is 0
        } else {
          newCartState[productId] = {
            ...prev[productId],
            cartCount: newCount,
            cartBtnClicked: true,
          };
        }
  
        // ✅ Count only unique products, NOT quantities
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
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setInquiryProductId(productId);
    setShowModal(true); // Open Modal

  };

  const closeModal = () => {
    setShowModal(false);
    setInquiryProductId(null); // Reset selected product
  };


  return (
    <>
      <section className='card-container'>
        <div className='card-section-header'>
          <h5>Best Of Veg. & Fruits</h5>
          <button>View All</button>
        </div>
        <div className="product-slider-arrow">
          <BsArrowLeftCircleFill className="arrow2 arrow-left" onClick={handlePrev} />
        </div>
        <div className='card-section-lower'>
          {productList.length > 0 &&
            productList.slice(currentIndex, currentIndex + 7).map((product) => {
              const imageSrc = imageMap[product.image_url] || imageMap["default.jpg"];
              const discount = discountMap[product.id] || 0;
              const rating = product.average_rating ? parseFloat(product.average_rating).toFixed(1) : 0;

              return (
                <div className='product' key={product.id}>
                  <div className='product-header'>
                    {discount > 0 && <span className='product-discount'
                      onClick={navigateToProductPage(product.slug_title)}>
                      {discount}% OFF
                    </span>}
                    <span className='like-icon' onClick={() => toggleLike(product.id)}>
                      {likedProducts[product.id] ? <FaHeart color='red' /> : <FaRegHeart color='grey' />}
                    </span>

                    <div onClick={navigateToProductPage(product.slug_title)}>
                      <img className='product-image'
                        src={imageSrc}
                        alt={product.name}
                        loading='lazy' />
                    </div>
                  </div>
                  <div className='product-body'>
                    <h5 className='product-text'>{product.name}</h5>
                  </div>
                  <div className='product-rating-main'>
                    {rating > 0 ? (
                      <>
                        <div className='product-rating-avg'>
                          <span className='rating'>{rating} <MdOutlineStarPurple500 color='gold' /></span>
                        </div>
                        <div className='product-rating-total'>
                          <p>{product.no_of_rating} Ratings</p>
                        </div>
                      </>
                    ) : (
                      <p className='no-rating'>No Rating Yet</p>
                    )}
                  </div>
                  <div className='product-footer'>
                    <div className='product-offer-price'>
                      {discount > 0 && <span className='product-regular-price'>₹{product.mrp.toFixed(2)}</span>}
                      <span className='product-discount-price'>₹{product.discount_amt.toFixed(2)}</span>
                    </div>

                    {cartState[product.id]?.cartBtnClicked ? (
                      <div className='add-to-cart-quantity'>
                        <button onClick={() => updateCartCount(product.id, -1)}>-</button>
                        <span>{cartState[product.id]?.cartCount || 0}</span>
                        <button onClick={() => updateCartCount(product.id, 1)}>+</button>
                      </div>
                    ) : (
                      product.productIsActive === 1 ? (
                        <button className='add-to-cart' onClick={() => toggleCartState(product.id)}>
                          <MdOutlineShoppingCart /> Add To Cart
                        </button>
                      ) : (
                        product.productIsActive === 2 ? (
                          <button className='out-of-stock'><MdRemoveShoppingCart /> Out Of Stock</button>
                        ) : (
                          product.productIsActive === 3 ? (
                            <button className='coming-soon'><MdAccessTime /> Coming Soon</button>
                          ) : (
                            product.productIsActive === 4 ? (
                              <span className='inquiry-now'
                                onClick={() => handleInquiryClick(product.id)}><MdOutlineChatBubbleOutline /> Inquiry Now</span>
                            ) : null)
                        )
                      )
                    )}

                  </div>
                </div>
              );
            })}
        </div>
        <div className='product-slider-arrow'>
          <BsArrowRightCircleFill className="arrow2 arrow-right" onClick={handleNext} />
        </div>
      </section>
      {showModal && <InquiryNow closeModal={closeModal} productId={inquiryProductId} />}
      {showLoginModal && <LoginSignUpModal closeModal={() => setShowLoginModal(false)} />}
    </>
  );
};
