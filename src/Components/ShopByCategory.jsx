import React from 'react';
import './ShopByCategory.css';

export const ShopByCategory = () => {
  const categories = [
    { name: 'Vegetables & Fruits', img: 'https://bitsinfotech.in/ecommerce/fmcg_upload/category/040822105930.png' },
    { name: 'Dairy, Bread & Eggs', img: 'https://bitsinfotech.in/ecommerce/fmcg_upload/category/030822024035.png' },
    { name: 'Cold Drinks & Juices', img: 'https://bitsinfotech.in/ecommerce/fmcg_upload/category/030822022302.png' },
    { name: 'Tea, Coffee & Health Drinks', img: 'https://bitsinfotech.in/ecommerce/fmcg_upload/category/030822032437.png' },
    { name: 'Atta, Rice & Dal', img: 'https://bitsinfotech.in/ecommerce/fmcg_upload/category/030822020431.png' },
    { name: 'Sweet Tooth', img: 'https://bitsinfotech.in/ecommerce/fmcg_upload/category/030822040938.png' },
  ];

  return (
    <>
      <div className='shop-by-category'>
        <section className='container-title'>
          <h1>Shop By Category</h1>
        </section>
        <section className='categories-container'>
          <div className='categories-grid'>
            {categories.map((category, index) => (
              <div key={index} className='category-card'>
                <a href=''>
                  <img src={category.img} alt={category.name} />
                </a>
                <a href=''>
                  <h6>{category.name}</h6>
                </a>
              </div>
            ))}

          </div>
        </section>
      </div>
    </>
  );
};
