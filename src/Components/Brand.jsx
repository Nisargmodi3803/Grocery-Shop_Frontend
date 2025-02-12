import React, { useEffect, useState } from 'react';
import './Brand.css';
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

export const Brand = () => {
    const greater = '>';
    const navigate = useNavigate();
    const { brandSlugTitle } = useParams();
    const [products, setProducts] = useState([]);
    const [likedProducts, setLikedProducts] = useState({});
    const [cartState, setCartState] = useState({});
    const [discountMap, setDiscountMap] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [inquiryProductId, setInquiryProductId] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        setIsAuthenticated(sessionStorage.getItem("isAuthenticated") === "true");
    }, []);

    const fetchProductsByBrand = async () => {
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
        }
    };

    useEffect(() => {
        fetchProductsByBrand();
    }, []);

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
                        <a onClick={() => navigate(`/ecommerce/shop-by-brand`)}>Brand</a>
                        <span> {greater} </span>
                        <a>Loading...</a>
                    </span>
                </section>
                <h1 style={{color:"#133365"}}>No Products Found...</h1>
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
                    <a onClick={() => navigate(`/ecommerce/shop-by-brand`)}>Brand</a>
                    <span> {greater} </span>
                    <a>{products[0]?.brand?.name || "Loading..."}</a>
                </span>
            </section>
            <div className='card-section-lower1'>
                {products.map((product) => {
                    const imageSrc = imageMap[product.image_url] || imageMap["default.jpg"];
                    const discount = discountMap[product.id] || 0;
                    const rating = product.average_rating ? parseFloat(product.average_rating).toFixed(1) : 0;
                    const mrp = product.mrp ? `₹${product.mrp.toFixed(2)}` : "N/A";
                    const discountAmt = product.discount_amt ? `₹${product.discount_amt.toFixed(2)}` : "N/A";

                    return (
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
                    );
                })}
            </div>
            {showModal && <InquiryNow closeModal={closeModal} productId={inquiryProductId} brandSlugTitle={brandSlugTitle} flag={3} />}

            {showLoginModal && <LoginSignUpModal closeModal={() => setShowLoginModal(false)} flag={3} brandSlugTitle={brandSlugTitle} />}
        </div>
    );
};
