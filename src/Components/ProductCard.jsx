import React, { useState, useRef } from 'react';
import './ProductCard.css';
import  products  from './Products';
import { MdOutlineStarPurple500 } from "react-icons/md";
import { MdOutlineShoppingCart } from "react-icons/md";
import { MdRemoveShoppingCart } from "react-icons/md";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

export const ProductCard = () => {
  const navigate = useNavigate();
  const direction = useRef("normal");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedProducts, setLikedProducts] = useState({});
  const [cartState, setCartState] = useState({});

  const handleNext = () => {
    direction.current = "normal";
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (productList.length - 7));
  };

  const handlePrev = () => {
    direction.current = "reverse";
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? productList.length - 7 : prevIndex - 1
    );
  };

  const toggleLike = (index) => {
    setLikedProducts((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleCartState = (index) => {
    setCartState((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        cartBtnClicked: !prev[index]?.cartBtnClicked,
        cartCount: prev[index]?.cartCount || 1,
      },
    }));
  };

  const updateCartCount = (index, increment) => {
    setCartState((prev) => {
      const updatedCartState = {
        ...prev,
        [index]: {
          ...prev[index],
          cartCount: Math.max((prev[index]?.cartCount || 0) + increment, 0),
        },
      };

      if (updatedCartState[index]?.cartCount === 0) {
        updatedCartState[index].cartBtnClicked = false;
      }

      return updatedCartState;
    });
  };

  const navigateToProductPage = (productId) => () => {
    // alert(`Navigating to product page with id: ${productId}`);
    navigate(`/ecommerce/product/${productId}`);
  }

  const vegetableAndFruits = products[0]["Vegetables & Fruits"];

  const productList = [];
  for (const category in vegetableAndFruits) {
    for (const item in vegetableAndFruits[category]) {
      const product = vegetableAndFruits[category][item];
      for (const size in product.category) {
        productList.push({
          id: product.category[size].id,
          name: `${item} - ${size}`,
          image: product.image,
          discount: product.category[size].discount,
          rating: product.category[size].rating,
          totalRaters: product.category[size]["total raters"],
          price: product.category[size].price,
          available: product.category[size].available,
          new: product.category[size].new,
        });
      }
    }
  }

  return (
    <>
      <section className='card-container'>
        <div className='card-section-header'>
          <h5>Best Of Veg. & Fruits</h5>
          <button>View All</button>
        </div>
        <div className="product-slider-arrow">
          <BsArrowLeftCircleFill
            className="arrow2 arrow-left"
            onClick={handlePrev}
          />
        </div>
        <div className='card-section-lower'>
          {productList.slice(currentIndex, currentIndex + 7).map((product, index) => {
            const cartData = cartState[index] || {};
            return (
              <div className='product' key={index}>
                <div className='product-header'>
                  {product.discount > 0 && (
                    <span className='product-discount'>{product.discount}% OFF</span>
                  )}
                  <span
                    className='like-icon'
                    onClick={() => toggleLike(index)}
                  >
                    {likedProducts[index] ? (
                      <FaHeart color='red' />
                    ) : (
                      <FaRegHeart color='grey' />
                    )}
                  </span>
                  <a href=''>
                    <img
                      className='product-image'
                      src={product.image}
                      alt={product.name}
                      onClick={navigateToProductPage(product.id)}
                      loading='lazy'
                    />
                  </a>
                </div>
                <div className='product-body'>
                  <h5 className='product-text'>{product.name}</h5>
                </div>
                <div className='product-rating-main'>
                  {product.rating > 0 ? (
                    <>
                      <div className='product-rating-avg'>
                        <span className='rating'>
                          {product.rating} <MdOutlineStarPurple500 color='gold' />
                        </span>
                      </div>
                      <div className='product-rating-total'>
                        <p>{product.totalRaters} Rating</p>
                      </div>
                    </>
                  ) : (
                    <p className='no-rating'>No Rating Yet</p>
                  )}
                </div>
                <div className='product-footer'>
                  <div className='product-offer-price'>
                    {product.discount > 0 && (
                      <span className='product-regular-price'>
                        ₹{product.price}
                      </span>
                    )}
                    <span className='product-discount-price'>
                      ₹
                      {(
                        product.price -
                        (product.price * product.discount) / 100
                      ).toFixed(2)}
                    </span>
                  </div>
                  {cartData.cartBtnClicked ? (
                    <div className='add-to-cart-quantity'>
                      <button onClick={() => updateCartCount(index, -1)}>
                        -
                      </button>
                      <span>{cartData.cartCount || 0}</span>
                      <button onClick={() => updateCartCount(index, 1)}>
                        +
                      </button>
                    </div>
                  ) : (
                    <>
                      {product.available > 0 ? (
                        <button
                          className='add-to-cart'
                          onClick={() => toggleCartState(index)}
                        >
                          <MdOutlineShoppingCart /> Add To Cart
                        </button>
                      ) : (
                        <button className='out-of-stock'>
                          <MdRemoveShoppingCart /> Out Of Stock
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className='product-slider-arrow'>
          <BsArrowRightCircleFill
            className="arrow2 arrow-right"
            onClick={handleNext}
          />
        </div>
      </section>
    </>
  );
};
