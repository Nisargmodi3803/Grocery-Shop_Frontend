import React, { useState, useEffect } from 'react';
import './ShopByCategory.css';
import axios from 'axios';

// 🔥 Import all images dynamically from the Category folder
const importAll = (r) => {
    let images = {};
    r.keys().forEach((item) => {
        images[item.replace("./", "")] = r(item);
    });
    return images;
};

// Load images from 'src/assets/Category/'
const imageMap = importAll(require.context("../assets/Category", false, /\.(png|jpe?g|svg)$/));

export const ShopByCategory = () => {
    const [categories, setCategories] = useState([]);

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
                        // 🔥 Get image from imageMap, fallback to 'default.png' if missing
                        const imageSrc = imageMap[category.image_url] || imageMap["default.png"];

                        return (
                            <div key={category.id} className='category-card'>
                                <a href='#'>
                                    <img src={imageSrc} alt={category.name} loading="lazy" />
                                </a>
                                <a href='#'>
                                    <h6>{category.name}</h6>
                                </a>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};
