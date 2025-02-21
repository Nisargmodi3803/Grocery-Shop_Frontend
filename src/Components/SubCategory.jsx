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

export const SubCategory = () => {
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
    }, []);

    const fetchProductsBySubCategory = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:9000/products-subcategory-title/${subcategorySlugTitle}`);

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
            } else {
                setProducts([]);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("No Product Found");
                // alert("No Product Found");
            } else {
                console.error("Error fetching product:", error);
                setProducts([]);
                alert("Something went wrong. Please try again!");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchSubcategoryName = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:9000/subcategory-title/${subcategorySlugTitle}`);
            if (response.status === 200) {
                setsubCategoryName(response.data.name);
                const categorySlugTitle = response.data.category.slug_title;
                fetchAllSubcategoriesByCategory(categorySlugTitle);
                // window.location.reload();
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("No Subcategory Found");
            } else {
                console.error("Error fetching product:", error);
                alert("Something went wrong. Please try again!");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAllSubcategoriesByCategory = async (categorySlugTitle) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:9000/subcategories-category-title/${categorySlugTitle}`);
            if (response.status === 200) {
                setSubCategories(response.data);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("No Category Found");
            } else {
                console.error("Error fetching product:", error);
                alert("Something went wrong. Please try again!");
            }
        } finally {
            setLoading(false);
        }
    }

    const fetchCategoryName = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:9000/subcategory-title/${subcategorySlugTitle}`);
            if (response.status === 200) {
                setCategoryName(response.data.category.name);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("No Category Found");
            } else {
                console.error("Error fetching product:", error);
                alert("Something went wrong. Please try again!");
            }
        } finally {
            setLoading(false);
        }
    }

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
        fetchSubcategoryName();
        fetchCategoryName();
    }, []);

    useEffect(() => {
        if (sortOption) {
            fetchSortedProducts();
        } else {
            fetchProductsBySubCategory();
        }
    }, [sortOption]);


    useEffect(() => {
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
                            navigate(`/ecommerce/shop-by-category`);
                            window.location.reload();
                        }}
                        >Category</a>
                        <span> {greater} </span>
                        <a onClick={() => { window.location.reload() }}>{categoryName || "Loading..."}</a>
                        <span> {greater} </span>
                        <a onClick={() => {
                            {
                                navigate(`/ecommerce/subcategory/${subcategorySlugTitle}`);
                                window.location.reload();
                            }
                        }}>{subcategoryName || "Loading..."}</a>
                    </span>
                    <section className='brand-main'>
                        <div className="subcategory-menu">
                            {subcategories.map((subcategory, index) => (
                                <div
                                    key={index}
                                    className={`subcategory-item ${subcategory.slug_title === subcategorySlugTitle ? "active" : ""}`}
                                    onClick={() => {
                                        navigate(`/ecommerce/sub-category/${subcategorySlugTitle}`);
                                        window.location.reload();
                                    }}
                                >
                                    {subcategory.name}
                                </div>
                            ))}
                        </div>
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
                        navigate(`/ecommerce/shop-by-category`);
                        window.location.reload();
                    }}
                    >Category</a>
                    <span> {greater} </span>
                    <a onClick={() => { window.location.reload() }}>{categoryName || "Loading..."}</a>
                    <span> {greater} </span>
                    <a onClick={() => {
                        {
                            navigate(`/ecommerce/sub-category/${subcategorySlugTitle}`);
                            window.location.reload();
                        }
                    }}>{subcategoryName || "Loading..."}</a>
                </span>
            </section>

            <section className='brand-main'>
                <div className="subcategory-menu">
                    {subcategories.map((subcategory, index) => (
                        <div
                            key={index}
                            className={`subcategory-item ${subcategory.slug_title === subcategorySlugTitle ? "active" : ""}`}
                            onClick={() => {
                                navigate(`/ecommerce/sub-category/${subcategory.slug_title}`,);
                                window.location.reload();
                            }}
                        >
                            {subcategory.name}
                        </div>
                    ))}
                </div>

                <div className='brand-header'>
                    <span class="brand-name">{categoryName}</span>
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
            {showModal && <InquiryNow closeModal={closeModal} productId={inquiryProductId} subcategorySlugTitle={subcategorySlugTitle} />}

            {showLoginModal && <LoginSignUpModal closeModal={() => setShowLoginModal(false)} subcategorySlugTitle={subcategorySlugTitle} />}
        </div>
    )
}