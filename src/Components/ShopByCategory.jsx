import React, { useState, useEffect } from 'react';
import './ShopByCategory.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../Context/LoadingContext';

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
    const [subcategories, setSubCategories] = useState([]);
    const { setLoading } = useLoading();

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 1000);

        return () => clearTimeout(timer);
    }, [setLoading]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:9000/categories');
            if (response.status === 200) {
                setCategories(response.data);
            }
        } catch (error) {
            if (error.response.status === 404) {
                console.log("No Categories Found");
            } else {
                console.error("Error fetching categories:", error);
                alert("Something went wrong. Please try again!");
            }
        }finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCategoryClick = async (categorySlugTitle) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:9000/subcategories-category-title/${categorySlugTitle}`);

            if (response.status === 200) {
                setSubCategories(response.data);

                if (response.data.length > 0) {
                    navigate(`/ecommerce/sub-category/${response.data[0].slug_title}`);
                    window.location.reload();
                } else {
                    console.log("No Subcategories Found");
                }
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    console.log("No Subcategories Found");
                } else {
                    console.error("Error fetching subcategories:", error);
                    alert("Something went wrong. Please try again!");
                }
            } else {
                console.error("Network Error or Server Down:", error);
                alert("Server is unreachable. Check your internet connection or backend server.");
            }
        }finally{
            setLoading(false);
        }
    };


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
                                onClick={() => handleCategoryClick(category.slug_title)}>
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
