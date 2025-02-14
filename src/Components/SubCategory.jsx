import React, { useEffect, useRef, useState } from 'react';
import './SubCategory.css'
import { IoMdHome } from "react-icons/io";
import { useNavigate, useParams } from 'react-router-dom';
import { MdOutlineStarPurple500, MdOutlineShoppingCart, MdRemoveShoppingCart } from "react-icons/md";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import axios from 'axios';
import { MdAccessTime, MdOutlineChatBubbleOutline } from "react-icons/md";
import { InquiryNow } from './InquiryNow';
import { LoginSignUpModal } from './LoginSignUpModal';

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
    const [cartState, setCartState] = useState({});
    const [discountMap, setDiscountMap] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [inquiryProductId, setInquiryProductId] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [subcategoryName, setsubCategoryName] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [sortOption, setSortOption] = useState("");
    const [subcategories, setSubCategories] = useState([]);

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    useEffect(() => {
        setIsAuthenticated(sessionStorage.getItem("isAuthenticated") === "true");
    }, []);

    const fetchProductsBySubCategory = async () => {
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
        }
    };

    const fetchSubcategoryName = async () => {
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
        }
    };

    const fetchAllSubcategoriesByCategory = async (categorySlugTitle) => {
        // console.log("Fetching subcategories by category:", categorySlugTitle);
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
        }
    }

    const fetchCategoryName = async () => {
        try {
            const response = await axios.get(`http://localhost:9000/subcategory-title/${subcategorySlugTitle}`);
            if (response.status === 200) {
                setCategoryName(response.data.name);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("No Category Found");
            } else {
                console.error("Error fetching product:", error);
                alert("Something went wrong. Please try again!");
            }
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


    const toggleLike = (productId) => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }
        setLikedProducts((prev) => ({
            ...prev,
            [productId]: !prev[productId],
        }));
    };

    const toggleCartState = (productId) => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }
        setCartState((prev) => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                cartBtnClicked: !prev[productId]?.cartBtnClicked,
                cartCount: prev[productId]?.cartCount || 1,
            },
        }));
    };

    const updateCartCount = (productId, increment) => {
        setCartState((prev) => {
            const updatedCartState = {
                ...prev,
                [productId]: {
                    ...prev[productId],
                    cartCount: Math.max((prev[productId]?.cartCount || 0) + increment, 0),
                },
            };

            if (updatedCartState[productId]?.cartCount === 0) {
                updatedCartState[productId].cartBtnClicked = false;
            }

            return updatedCartState;
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