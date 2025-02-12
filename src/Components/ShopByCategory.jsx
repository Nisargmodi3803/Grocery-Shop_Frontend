import React, { useState, useEffect } from 'react';
import './ShopByCategory.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const importAll = (r) => {
    let images = {};
    r.keys().forEach((item) => {
        images[item.replace("./", "")] = r(item);
    });
    return images;
};

const imageMap = importAll(require.context("../assets/Category", false, /\.(png|jpeg|svg|jpg|JPEG)$/));

export const ShopByCategory = () => {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:9000/categories');
            if (response.status === 200) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div className='shop-by-category'>
            <section className='container-title'>
                <h1>Shop By Category</h1>
            </section>
            <section className='categories-container'>
                <div className='categories-grid'>
                    {categories.map((category) => {
                        const imageSrc = imageMap[category.image_url] || imageMap["default.png"];

                        return (
                            <div 
                                key={category.id} 
                                className='category-card'
                                onClick={()=>navigate(`/ecommerce/category/${category.slug_title}`)}>
                                <img src={imageSrc} alt={category.name} loading="lazy" />
                                <h6>{category.name}</h6>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};
