import { React, useState, useEffect } from 'react';
import './Product.css';
import { useParams } from 'react-router-dom';
import { IoMdHome } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { FaHeart } from "react-icons/fa";
import { MdOutlineStarPurple500 } from "react-icons/md";
import { MdOutlineShoppingCart } from "react-icons/md";
import { MdRemoveShoppingCart } from "react-icons/md";
import { BsTag } from "react-icons/bs";
import { MdVerified } from "react-icons/md";
import axios from 'axios';
import DOMPurify from 'dompurify';
import { MdAccessTime } from "react-icons/md";
import { MdOutlineChatBubbleOutline } from "react-icons/md";
import { LoginSignUpModal } from './LoginSignUpModal';
import { InquiryNow } from './InquiryNow';
import { useLoading } from '../Context/LoadingContext';

export default function Product() {
    const [product, setProduct] = useState(null);
    const [likedProduct, setLikedProduct] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [relatedCategories, setRelatedCategories] = useState([]);
    const { productSlugTitle } = useParams();
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [inquiryProductId, setInquiryProductId] = useState(null);
    const [inquiryProductSlugTitle, setInquiryProductSlugTitle] = useState(null);
    const greater = '>';
    const { setLoading } = useLoading();
    const [cartState, setCartState] = useState(() => {
        const storedCart = sessionStorage.getItem("cartState");
        return storedCart ? JSON.parse(storedCart) : {};
    });

    useEffect(() => {
        const authStatus = sessionStorage.getItem("isAuthenticated") === "true";
        setIsAuthenticated(authStatus);
    });

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
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                console.log("Fetching product:", productSlugTitle);
                const response = await axios.get(`http://localhost:9000/product-title/${productSlugTitle}`);
                if (response.status === 200) {
                    setProduct(response.data);
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    console.log("No Product Found");
                    alert("No Product Found");
                } else {
                    console.error("Error fetching product:", error);
                    alert("Something went wrong. Please try again!");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productSlugTitle]);


    // Fetch Related Variants
    useEffect(() => {
        if (!product) return;

        const fetchRelatedCategories = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:9000/product-variants?name=${product.name}`);
                if (response.status === 200) {
                    const variants = response.data;
                    setRelatedCategories(variants);
                }
            } catch (error) {
                console.error("Error fetching related categories:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRelatedCategories();
    }, [product]);

    const handleInquiryClick = (productId) => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
            setInquiryProductSlugTitle(productSlugTitle);
            return;
        }

        setInquiryProductId(productId);
        setShowModal(true); // Open Modal

    };

    const closeModal = () => {
        setShowModal(false);
        setInquiryProductId(null);
        setInquiryProductSlugTitle(null);
    };

    useEffect(() => {
        const fetchLikedStatus = async () => {
            if (!isAuthenticated) return;

            try {
                const response = await axios.get(`http://localhost:9000/wishlist/${sessionStorage.getItem("customerEmail")}`);

                if (response.status === 200) {
                    const likedIds = response.data.map(item => item.product.id);
                    setLikedProduct(likedIds.find(id => id === product.id));
                }
            } catch (error) {
                console.error("Error fetching liked product status:", error);
            }
        };

        fetchLikedStatus();
    }, [isAuthenticated, product]);

    const toggleLike = async (productId) => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }

        try {
            let response;
            if (likedProduct) {
                response = await axios.patch(`http://localhost:9000/remove-wishlist?customerEmail=${sessionStorage.getItem("customerEmail")}&productId=${productId}`);
            } else {
                response = await axios.post(`http://localhost:9000/add-wishlist?customerEmail=${sessionStorage.getItem("customerEmail")}&productId=${productId}`);
            }

            if (response.status === 200) {
                console.log(`Product ${likedProduct ? "disliked" : "liked"} successfully`);
                setLikedProduct(!likedProduct); // Toggle state
            }
        } catch (error) {
            console.error(`Error ${likedProduct ? "disliking" : "liking"} product:`, error);
            alert(`Something went wrong in ${likedProduct ? "disliking" : "liking"} the product. Please try again!`);
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


    if (!product) {
        return (
            <div className='product-page'>
                <section className='product-navigate-section'>
                    <span className='navigate'>
                        <a onClick={() => navigate('/ecommerce/')}>
                            <b><IoMdHome /> Home</b>
                        </a>
                        <span> {greater} </span>
                        <a href=''>Loading...</a>
                        <span> {greater} </span>
                        <a href=''>Loading...</a>
                    </span>
                </section>
                <h1 style={{ color: "#133365" }}>No Products Found...</h1>
            </div>
        );
    }
    const imageSrc = imageMap[product.image_url] || `http://localhost:9000/uploads/${product.image_url}` || imageMap["default.jpg"];

    const calculateDiscountPercentage = (mrp, discountAmt) => {
        return mrp > 0 ? Math.round(((mrp - discountAmt) * 100) / mrp) : 0;
    };
    const discount = calculateDiscountPercentage(product.mrp, product.discount_amt);

    const rating = product.average_rating ? parseFloat(product.average_rating).toFixed(1) : 0;
    const noOfRatings = product.no_of_rating || 0;

    return (
        <div className='product-page'>
            <section className='product-navigate-section'>
                <span className='navigate'>
                    <a onClick={() => navigate('/ecommerce/')}>
                        <b><IoMdHome /> Home</b>
                    </a>
                    <span> {greater} </span>
                    <a onClick={() => {
                        navigate(`/ecommerce/shop-by-category`);
                    }}>{product.cat?.name || "Category"}</a>
                    <span> {greater} </span>
                    <a onClick={() => {
                        navigate(`/ecommerce/sub-category/${product.subcat?.slug_title}`);
                    }}>{product.subcat?.name || "Subcategory"}</a>
                </span>
            </section>

            <section className='product-content-section'>
                <div className='product-content-image-section'>
                    <img src={imageSrc} alt={product.name} loading='lazy' />
                    <span className='product-content-likebtn' onClick={() => toggleLike(product.id)}>
                        {likedProduct ? <FaHeart color='red' /> : <FaHeart color='grey' />}
                    </span>

                </div>

                <div className='product-content-details-section'>
                    <div className='product-content-details-header'>
                        {discount > 0 && <span className='product-content-discount'>{discount}% OFF</span>}
                        <div className='product-content-rating'>
                            {rating > 0 ? (
                                <>
                                    <div className='product-content-rating-avg'>
                                        <span className='product-content-rating'>
                                            {rating} <MdOutlineStarPurple500 color='gold' />
                                        </span>
                                    </div>
                                    <div className='product-content-rating-total'>
                                        <p>{noOfRatings} Ratings</p>
                                    </div>
                                </>
                            ) : (
                                <div className='product-content-no-rating'>
                                    <p>No Rating Yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className='product-content-name'>
                        <p>{product.name}</p>
                    </div>

                    <div className='product-content-category'>
                        <span>
                            <strong>
                                <MdVerified /> {product.subcat.name}
                            </strong>
                        </span>
                    </div>
                    <div className='product-content-price'>
                        {discount > 0 && (
                            <span className='product-content-regular-price'>
                                <BsTag /> Price: ₹{product.mrp.toFixed(2)}
                            </span>
                        )}
                        <div className='product-content-discount-price'>
                            <span className='discount'>Discount Price:</span>
                            <p>
                                <strong className='price'>₹{product.discount_amt.toFixed(2)}</strong>
                            </p>
                        </div>
                    </div>
                    <div className="product-content-category-options">
                        {relatedCategories.map((category) => {
                            const isSelected = category.id === product.id;
                            const discountPercentage = category.mrp > 0 ? Math.round(((category.mrp - category.discount_amt) / category.mrp) * 100) : 0;

                            return (
                                <div
                                    key={category.id}
                                    className={isSelected ? "selected-category-option-container" : "category-option-container"}
                                    onChange={(e) => { navigate(`/ecommerce/product/${category.slug_title}`);  
                                }}
                                >
                                    <div className="radio-button-section"
                                        onChange={(e) => { navigate(`/ecommerce/product/${category.slug_title}`);  }}>
                                        <input
                                            type="radio"
                                            name="category-option"
                                            id={`category-${category.id}`}
                                            checked={isSelected}
                                            onChange={(e) => { navigate(`/ecommerce/product/${category.slug_title}`);  }}
                                        />
                                        <label htmlFor={`category-${category.id}`} className="category-size">
                                            {category.variantName}
                                        </label>

                                        <div htmlFor={`category-${category.id}`} className="category-price">
                                            <span className='category-regular-price'>
                                                <p>₹{category.mrp.toFixed(2)}</p>
                                            </span>
                                            <span className='category-discount-price'>
                                                <p>₹{category.discount_amt.toFixed(2)}</p>
                                            </span>
                                        </div>
                                    </div>

                                    {isSelected && discountPercentage > 0 && (
                                        <div className="discount-section-main">
                                            <span>{discountPercentage}% OFF</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>



                    {cartState[product.id]?.cartBtnClicked ? (
                        <div className='product-content-add-to-cart-quantity'>
                            <button onClick={() => updateCartCount(product.id, -1)}>-</button>
                            <span>{cartState[product.id]?.cartCount || 0}</span>
                            <button onClick={() => updateCartCount(product.id, 1)}>+</button>
                        </div>
                    ) : (
                        <>
                            {product.productIsActive === 1 ? (
                                <button
                                    className='product-content-add-to-cart'
                                    onClick={() => toggleCartState(product.id)}
                                >
                                    <MdOutlineShoppingCart /> ADD TO CART
                                </button>
                            ) : product.productIsActive === 2 ? (
                                <button className='product-content-out-of-stock'>
                                    <MdRemoveShoppingCart /> OUT OF STOCK
                                </button>
                            ) : product.productIsActive === 3 ? (
                                <button className='product-content-coming-soon'>
                                    <MdAccessTime /> COMING SOON
                                </button>
                            ) : product.productIsActive === 4 ? (
                                <button className='product-content-inquiry-now'
                                    onClick={() => handleInquiryClick(product.id)}>
                                    <MdOutlineChatBubbleOutline /> INQUIRY NOW
                                </button>
                            ) : null}
                        </>
                    )}
                    <div className='product-content-highlights'>
                        <h1 className='highlights-title'>Highlights</h1>
                        <p className='highlights-text'>{product.description}</p>
                    </div>
                </div>
            </section>
            <section className='product-overview-section'>
                <h1>Quick Overview</h1>
                <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.long_description) }}></p>
            </section>
            {showLoginModal && <LoginSignUpModal closeModal={() => setShowLoginModal(false)} productSlugTitle={inquiryProductSlugTitle} />}
            {showModal && <InquiryNow closeModal={closeModal} productId={inquiryProductId} flag={2} />}
        </div>

    );
}
