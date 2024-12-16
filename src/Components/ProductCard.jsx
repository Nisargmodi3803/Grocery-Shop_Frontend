import React from 'react';
import './ProductCard.css';
import { products } from './Products';

export const ProductCard = () => {
  const vegetableAndFruits = products[0]["Vegetables & Fruits"]; // Rename the local variable

  const productList = [];
  for (const category in vegetableAndFruits) {
    for (const item in vegetableAndFruits[category]) {
      const product = vegetableAndFruits[category][item];
      for (const size in product.category) {
        productList.push({
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
        <div className='card-section-lower'>
          {productList.map((product, index) => (
            <div className='product' key={index}>
              <div className='product-header'>
                {product.discount > 0 && (
                  <span className='product-discount'>{product.discount}% OFF</span>
                )}
                <img
                  className='product-image'
                  src={product.image}
                  alt={product.name}
                />
              </div>
              <div className='product-body'>
                <h5 className='product-text'>{product.name}</h5>
              </div>
              <div className='product-rating-main'>
                {product.rating > 0 ? (
                  <>
                    <div className='product-rating-avg'>
                      <span className='rating'>{product.rating}</span>
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
                {product.available > 0 ? (
                  <button className='add-to-cart'>Add To Cart</button>
                ) : (
                  <button className='out-of-stock'>Out Of Stock</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};
