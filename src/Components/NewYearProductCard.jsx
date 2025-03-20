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

export const NewYearProductCard = () => {
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
  const [productsIds, setProductsIds] = useState([]);
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

  // Fetch Subcategory IDs
  const fetchSubCategoriesIds = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:9000/offer-slug-title/new-year");
      if (response.status === 200) {
        const productIds = response.data.offerProductIds;
        const ids = productIds.split(",").map(Number);
        setProductsIds(ids);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("No Products Found");
      } else {
        console.error("Error fetching subcategories:", error);
        alert("Something went wrong. Please try again!");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch Products (after subcategoriesIds updates)
  const fetchProducts = async (ids) => {
    setLoading(true);
    try {
      const productRequests = ids.map((id) =>
        axios.get(`http://localhost:9000/product/${id}`)
      );

      const responses = await Promise.all(productRequests);
      const allProducts = responses.flatMap((res) => res.data);
      setProductList(allProducts);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("No Products Found");
      } else {
        console.error("Error fetching products:", error);
        alert("Something went wrong. Please try again!");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch subcategories on mount
  useEffect(() => {
    fetchSubCategoriesIds();
  }, []);

  // Fetch products only when subcategoriesIds are updated
  useEffect(() => {
    if (productsIds.length > 0) {
      fetchProducts(productsIds);
    }
  }, [productsIds]);

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
          <h5>New Year</h5>
          <button onClick={()=>navigate("/ecommerce/offers/new-year")}>View All</button>
        </div>
        <div className="product-slider-arrow">
          <BsArrowLeftCircleFill className="arrow2 arrow-left" onClick={handlePrev} />
        </div>
        <div className='card-section-lower'>
          {productList.length > 0 &&
            productList.slice(currentIndex, currentIndex + 7).map((product) => {
              const imageSrc = imageMap[product.image_url] || `http://localhost:9000/uploads/${product.image_url}` || imageMap["default.jpg"];
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
