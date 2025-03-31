import React, { useEffect, useRef, useState } from 'react';
import './SubCategory.css'
import { IoMdHome } from "react-icons/io";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { MdOutlineStarPurple500, MdOutlineShoppingCart, MdRemoveShoppingCart } from "react-icons/md";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { MdAccessTime, MdOutlineChatBubbleOutline } from "react-icons/md";
import { InquiryNow } from './InquiryNow';
import { LoginSignUpModal } from './LoginSignUpModal';
import { useLoading } from '../Context/LoadingContext';

const importAll = (r) => {
    let images = {};
    r.keys().forEach((item) => {
        images[item.replace("./", "")] = r(item);
    });
    return images;
};

const imageMap = importAll(require.context("../assets/Product", false, /\.(png|jpeg|svg|jpg|JPEG)$/));

export const OffersNewYear = () => {
    const greater = '>';
    const navigate = useNavigate();
    const { subcategorySlugTitle } = useParams();
    const [products, setProducts] = useState([]);
    const [likedProducts, setLikedProducts] = useState({});
    const [discountMap, setDiscountMap] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [inquiryProductId, setInquiryProductId] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [subcategoryName, setsubCategoryName] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [sortOption, setSortOption] = useState("");
    const [subcategories, setSubCategories] = useState([]);
    const [productsIds, setProductsIds] = useState([]);
    const { setLoading } = useLoading();
    const [cartState, setCartState] = useState(() => {
        const storedCart = sessionStorage.getItem("cartState");
        return storedCart ? JSON.parse(storedCart) : {};
    });

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 1000);

        return () => clearTimeout(timer);
    }, [setLoading]);

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    useEffect(() => {
        setIsAuthenticated(sessionStorage.getItem("isAuthenticated") === "true");
    });

    const fetchSubCategoriesIds = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:9000/offer-slug-title/new-year");

            if (response.status === 200 && response.data?.offerProductIds) {
                const productIds = response.data.offerProductIds;
                const ids = productIds.split(",").map((id) => Number(id.trim())).filter((id) => !isNaN(id));
                setProductsIds(ids);
            } else {
                setProductsIds([]);
            }
        } catch (error) {
            setProductsIds([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async (ids) => {
        if (!Array.isArray(ids) || ids.length === 0) return;

        setLoading(true);
        try {
            const productRequests = ids.map((id) => axios.get(`http://localhost:9000/product/${id}`));
            const responses = await Promise.all(productRequests);
            const allProducts = responses.flatMap((res) => res.data);

            setProducts(allProducts);
        } catch (error) {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubCategoriesIds();
    }, []);

    useEffect(() => {
        if (productsIds?.length) {
            fetchProducts(productsIds);
        }
    }, [productsIds]);

    const fetchSortedProducts = async () => {
        let api = "";

        switch (sortOption) {
            case "Sort by: Recommended":
                api = `http://localhost:9000/products-subcategory-title/${subcategorySlugTitle}`;
                break;
            case "Sort by: Price (Low to High)":
                api = `http://localhost:9000/product-ascending-sub-mrp/${subcategorySlugTitle}`;
                break;
            case "Sort by: Price (High to Low)":
                api = `http://localhost:9000/product-descending-sub-mrp/${subcategorySlugTitle}`;
                break;
            case "Sort by: Discount (High to Low)":
                api = `http://localhost:9000/product-descending-sub-discount/${subcategorySlugTitle}`;
                break;
            case "Sort by: Discount (Low to High)":
                api = `http://localhost:9000/product-ascending-sub-discount/${subcategorySlugTitle}`;
                break;
            case "Sort by: Name (A to Z)":
                api = `http://localhost:9000/product-ascending-sub-name/${subcategorySlugTitle}`;
                break;
            case "Sort by: Name (Z to A)":
                api = `http://localhost:9000/product-descending-sub-name/${subcategorySlugTitle}`;
                break;
            default:
                api = `http://localhost:9000/products-subcategory-title/${subcategorySlugTitle}`;
                break;
        }
        setLoading(true);
        try {
            const response = await axios.get(api);
            if (response.status === 200) {
                setProducts(response.data);
            } else {
                setProducts([]);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("No Product Found");
            } else {
                console.error("Error fetching product:", error);
                setProducts([]);
                alert("Something went wrong. Please try again!");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (sortOption) {
            fetchSortedProducts();
        } else {
            fetchProducts();
        }
    }, [sortOption]);


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
    };;

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
                            // window.location.reload();
                        }}
                        >Offers</a>
                        <span> {greater} </span>
                        <a onClick={() => { window.location.reload() }}>New Year</a>
                    </span>
                    <section className='brand-main'>
                        <h1>No Products Found!</h1>
                    </section>
                </section>
            </div>
        );
    }

    return (
        <div className='subcategory'>
            <section className='product-navigate-section'>
                <span className='navigate'>
                    <a onClick={() => navigate('/ecommerce/')}>
                        <b><IoMdHome /> Home</b>
                    </a>
                    <span> {greater} </span>
                    <a onClick={() => {
                        // window.location.reload();
                    }}
                    >Offers</a>
                    <span> {greater} </span>
                    <a onClick={() => { window.location.reload() }}>Best Of Veg. & Fruits</a>
                </span>
            </section>

            <section className='brand-main'>
                <div className='brand-header'>
                    <span class="brand-name">New Year</span>
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
                        const imageSrc = imageMap[product.image_url] || `http://localhost:9000/uploads/${product.image_url}` || imageMap["default.jpg"];
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
                                        <h5 className='product-text'>{product.name} - {product.variantName}</h5>
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
            {showModal && <InquiryNow closeModal={closeModal} productId={inquiryProductId} subcategorySlugTitle={subcategorySlugTitle} />}

            {showLoginModal && <LoginSignUpModal closeModal={() => setShowLoginModal(false)} subcategorySlugTitle={subcategorySlugTitle} />}
        </div>
    )
}