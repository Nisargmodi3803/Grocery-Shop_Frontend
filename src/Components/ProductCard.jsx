import React, { useState, useRef, useEffect } from 'react';
import './ProductCard.css';
import { MdOutlineStarPurple500, MdOutlineShoppingCart, MdRemoveShoppingCart } from "react-icons/md";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const ProductCard = () => {
  const navigate = useNavigate();
  const direction = useRef("normal");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedProducts, setLikedProducts] = useState({});
  const [cartState, setCartState] = useState({});
  const [productList, setProductList] = useState([]);
  const [discountMap, setDiscountMap] = useState({});

  const importAll = (r) => {
    let images = {};
    r.keys().forEach((item) => {
      images[item.replace("./", "")] = r(item);
    });
    return images;
  };

  const imageMap = importAll(require.context("../assets/Product", false, /\.(png|jpeg|svg|jpg|JPEG)$/));

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:9000/products-category-title/vegetables---fruits');
      if (response.status === 200) {
        console.log('Products:', response.data);
        setProductList(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      if (error.response.status === 404) {
        console.log("No Products Found");
      }
      else {
        console.error("Error fetching products:", error);
        alert('Something went wrong. Please try again!');
      }
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

  const toggleLike = (productId) => {
    setLikedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const toggleCartState = (productId) => {
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
                    <span className='like-icon'
                      onClick={() => toggleLike(product.id)}>
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
                        <button className='out-of-stock'><MdRemoveShoppingCart /> Out Of Stock</button>
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
    </>
  );
};
