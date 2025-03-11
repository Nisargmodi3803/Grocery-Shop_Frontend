import React, { useEffect, useRef, useState } from 'react';
import './Brand.css';
import { IoMdHome } from "react-icons/io";
import { useNavigate, useParams } from 'react-router-dom';
import { MdOutlineStarPurple500, MdOutlineShoppingCart, MdRemoveShoppingCart } from "react-icons/md";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import axios from 'axios';
import { MdAccessTime, MdOutlineChatBubbleOutline } from "react-icons/md";
import { InquiryNow } from './InquiryNow';
import { LoginSignUpModal } from './LoginSignUpModal';
import BrandSelector from './BrandSelector';
import { useLoading } from '../Context/LoadingContext';

const importAll = (r) => {
    let images = {};
    r.keys().forEach((item) => {
        images[item.replace("./", "")] = r(item);
    });
    return images;
};

const imageMap = importAll(require.context("../assets/Product", false, /\.(png|jpeg|svg|jpg|JPEG)$/));
const imageMap1 = importAll(require.context("../assets/Brand", false, /\.(png|jpeg|svg|jpg|JPEG)$/));

export const Brand = () => {
    const greater = '>';
    const navigate = useNavigate();
    const { brandSlugTitle } = useParams();
    const [products, setProducts] = useState([]);
    const [likedProducts, setLikedProducts] = useState({});
    const [discountMap, setDiscountMap] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [inquiryProductId, setInquiryProductId] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [brandName, setBrandName] = useState('');
    const [brands, setBrands] = useState([]);
    const [sortOption, setSortOption] = useState("");
    const { setLoading } = useLoading();
    const [cartState, setCartState] = useState(() => {
        const storedCart = sessionStorage.getItem("cartState");
        return storedCart ? JSON.parse(storedCart) : {};
    });

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    useEffect(() => {
        setIsAuthenticated(sessionStorage.getItem("isAuthenticated") === "true");
    },);

    const fetchProductsByBrand = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:9000/products-brand-title/${brandSlugTitle}`);

            if (response.status === 200) {
                const productData = response.data;
                setProducts(productData);

                // Calculate discounts
                const discountData = {};
                productData.forEach((product) => {
                    const mrp = product.mrp || 0;
                    const discountAmt = product.discount_amt || 0;
                    discountData[product.id] = mrp > 0 ? Math.round(((mrp - discountAmt) * 100) / mrp) : 0;
                });
                setDiscountMap(discountData);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("No Product Found");
                // alert("No Product Found");
            } else {
                console.error("Error fetching product:", error);
                alert("Something went wrong. Please try again!");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchBrandName = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:9000/brand-slug/${brandSlugTitle}`);
            if (response.status === 200) {
                setBrandName(response.data.name);
                // window.location.reload();
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("No Brand Found");
            } else {
                console.error("Error fetching product:", error);
                alert("Something went wrong. Please try again!");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:9000/brand');
            if (response.status === 200) {
                setBrands(response.data);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("No Brands Found");
            } else {
                console.error(error);
                alert("Something went wrong. Please try again!");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchSortedProducts = async () => {
        let api = "";

        switch (sortOption) {
            case "Sort by: Recommended":
                api = `http://localhost:9000/products-brand-title/${brandSlugTitle}`;
                break;
            case "Sort by: Price (Low to High)":
                api = `http://localhost:9000/product-ascending-brand-mrp/${brandSlugTitle}`;
                break;
            case "Sort by: Price (High to Low)":
                api = `http://localhost:9000/product-descending-brand-mrp/${brandSlugTitle}`;
                break;
            case "Sort by: Discount (High to Low)":
                api = `http://localhost:9000/product-descending-brand-discount/${brandSlugTitle}`;
                break;
            case "Sort by: Discount (Low to High)":
                api = `http://localhost:9000/product-ascending-brand-discount/${brandSlugTitle}`;
                break;
            case "Sort by: Name (A to Z)":
                api = `http://localhost:9000/product-ascending-brand-name/${brandSlugTitle}`;
                break;
            case "Sort by: Name (Z to A)":
                api = `http://localhost:9000/product-descending-brand-name/${brandSlugTitle}`;
                break;
            default:
                api = `http://localhost:9000/products-brand-title/${brandSlugTitle}`;
                break;
        }
        setLoading(true);
        try {
            const response = await axios.get(api);
            if (response.status === 200) {
                setProducts(response.data);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("No Product Found");
            } else {
                console.error("Error fetching product:", error);
                alert("Something went wrong. Please try again!");
            }
        } finally {
            setLoading(false);
        }
    };


    const brandScrollRef = useRef(null);

    const scrollToSelectedBrand = () => {
        if (brandScrollRef.current) {
            const selectedBrand = brandScrollRef.current.querySelector(".selected");
            if (selectedBrand) {
                selectedBrand.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            }
        }
    };

    useEffect(() => {
        fetchBrandName();
        fetchBrands();
        setTimeout(scrollToSelectedBrand, 300);
    }, []);

    useEffect(() => {
        if (sortOption) {
            fetchSortedProducts();
        } else {
            fetchProductsByBrand();
        }
    }, [sortOption]);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 1000);

        return () => clearTimeout(timer);
    }, [setLoading]);


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
            if (error.response?.status === 404) {
                console.log("Customer not found");
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
        fetchCart();
        fetchLikedProducts();
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
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setInquiryProductId(null);
    };

    if (products.length === 0) {
        return (
            <div className='product-page'>
                <section className='product-navigate-section'>
                    <span className='navigate'>
                        <a onClick={() => navigate('/ecommerce/')}>
                            <b><IoMdHome /> Home</b>
                        </a>
                        <span> {greater} </span>
                        <a onClick={() => {
                            navigate(`/ecommerce/shop-by-brand`);
                            // window.location.reload();
                        }}
                        >Brand</a>
                        <span> {greater} </span>
                        <a onClick={() => {  }}>{brandName || "Loading..."}</a>
                    </span>
                </section>
                <section className='brand-main'>
                    <div className="brand-selector-container">
                        <div className="brand-scroll" ref={brandScrollRef}>
                            {brands.map((brand) => {
                                const imageSrc = imageMap1[brand.image_url] || imageMap["default.jpg"];
                                return (
                                    <div
                                        key={brand.id}
                                        className={`brand-item ${brand.slug_title === brandSlugTitle ? "selected" : ""}`}
                                        onClick={() => {
                                            navigate(`/ecommerce/brand/${brand.slug_title}`);
                                            // window.location.reload();
                                        }}
                                    >
                                        <img src={imageSrc} alt={brand.name} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className='brand-header'>
                        <span className="brand-name">{brandName}</span>
                        <select className="sort-dropdown" onChange={handleSortChange}>
                            <option>Sort by: Recommended</option>
                            <option>Sort by: Price (Low to High)</option>
                            <option>Sort by: Price (High to Low)</option>
                            <option>Sort by: Discount (High to Low)</option>
                            <option>Sort by: Discount (Low to High)</option>
                            <option>Sort by: Name (A to Z)</option>
                            <option>Sort by: Name (Z to A)</option>
                        </select>
                    </div>
                    <h1>No Products Found!</h1>
                </section>
            </div>
        );
    }

    return (
        <div className='brand'>
            <section className='product-navigate-section'>
                <span className='navigate'>
                    <a onClick={() => navigate('/ecommerce/')}>
                        <b><IoMdHome /> Home</b>
                    </a>
                    <span> {greater} </span>
                    <a onClick={() => {
                        navigate(`/ecommerce/shop-by-brand`);
                        // window.location.reload();
                    }}
                    >Brand</a>
                    <span> {greater} </span>
                    <a onClick={() => {  }}>{brandName || "Loading..."}</a>
                </span>
            </section>

            <section className='brand-main'>

                <div className="brand-selector-container">
                    <div className="brand-scroll" ref={brandScrollRef}>
                        {brands.map((brand) => {
                            const imageSrc = imageMap1[brand.image_url] || imageMap["default.jpg"];
                            return (
                                <div
                                    key={brand.id}
                                    className={`brand-item ${brand.slug_title === brandSlugTitle ? "selected" : ""}`}
                                    onClick={() => {
                                        navigate(`/ecommerce/brand/${brand.slug_title}`);
                                        // window.location.reload();
                                    }}
                                >
                                    <img src={imageSrc} alt={brand.name} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className='brand-header'>
                    <span class="brand-name">{brandName}</span>
                    <select class="sort-dropdown" onChange={handleSortChange}>
                        <option>Sort by: Recommended</option>
                        <option>Sort by: Price (Low to High)</option>
                        <option>Sort by: Price (High to Low)</option>
                        <option>Sort by: Discount (High to Low)</option>
                        <option>Sort by: Discount (Low to High)</option>
                        <option>Sort by: Name (A to Z)</option>
                        <option>Sort by: Name (Z to A)</option>
                    </select>
                </div>

                <div className='card-section-lower1'>
                    {products.map((product) => {
                        const imageSrc = imageMap[product.image_url] || imageMap["default.jpg"];
                        const discount = discountMap[product.id] || 0;
                        const rating = product.average_rating ? parseFloat(product.average_rating).toFixed(1) : 0;
                        const mrp = product.mrp ? `₹${product.mrp.toFixed(2)}` : "N/A";
                        const discountAmt = product.discount_amt ? `₹${product.discount_amt.toFixed(2)}` : "N/A";

                        return (
                            <>
                                <div className='product1' key={product.id}>
                                    <div className='product-header1'>
                                        {discount > 0 && (
                                            <span className='product-discount1' onClick={navigateToProductPage(product.slug_title)}>
                                                {discount}% OFF
                                            </span>
                                        )}
                                        <span className='like-icon1' onClick={() => toggleLike(product.id)}>
                                            {likedProducts[product.id] ? <FaHeart color='red' /> : <FaRegHeart color='grey' />}
                                        </span>
                                        <div onClick={navigateToProductPage(product.slug_title)}>
                                            <img className='product-image1' src={imageSrc} alt={product.name} loading='lazy' />
                                        </div>
                                    </div>
                                    <div className='product-body1'>
                                        <h5 className='product-text1'>{product.name}</h5>
                                    </div>
                                    <div className='product-rating-main1'>
                                        {rating > 0 ? (
                                            <>
                                                <div className='product-rating-avg1'>
                                                    <span className='rating1'>{rating} <MdOutlineStarPurple500 color='gold' /></span>
                                                </div>
                                                <div className='product-rating-total1'>
                                                    <p>{product.no_of_rating} Ratings</p>
                                                </div>
                                            </>
                                        ) : (
                                            <p className='no-rating1'>No Rating Yet</p>
                                        )}
                                    </div>
                                    <div className='product-footer1'>
                                        <div className='product-offer-price1'>
                                            {discount > 0 && <span className='product-regular-price1'>{mrp}</span>}
                                            <span className='product-discount-price1'>{discountAmt}</span>
                                        </div>
                                    </div>
                                    {cartState[product.id]?.cartBtnClicked ? (
                                        <div className='add-to-cart-quantity1'>
                                            <button onClick={() => updateCartCount(product.id, -1)}>-</button>
                                            <span>{cartState[product.id]?.cartCount || 0}</span>
                                            <button onClick={() => updateCartCount(product.id, 1)}>+</button>
                                        </div>
                                    ) : (
                                        product.productIsActive === 1 ? (
                                            <button className='add-to-cart1' onClick={() => toggleCartState(product.id)}>
                                                <MdOutlineShoppingCart /> Add To Cart
                                            </button>
                                        ) : (
                                            product.productIsActive === 2 ? (
                                                <button className='out-of-stock1'><MdRemoveShoppingCart /> Out Of Stock</button>
                                            ) : (
                                                product.productIsActive === 3 ? (
                                                    <button className='coming-soon1'><MdAccessTime /> Coming Soon</button>
                                                ) : (
                                                    product.productIsActive === 4 ? (
                                                        <span className='inquiry-now1'
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
            </section>
            {showModal && <InquiryNow closeModal={closeModal} productId={inquiryProductId} brandSlugTitle={brandSlugTitle} />}

            {showLoginModal && <LoginSignUpModal closeModal={() => setShowLoginModal(false)} brandSlugTitle={brandSlugTitle} />}
        </div>
    );
};

