import React, { useEffect, useState } from 'react';
import './Home.css';
import image1 from '../assets/Slider/0111220539460308220712141(2).png';
import image2 from '../assets/Slider/0308220712242.png';
import image3 from '../assets/Slider/030822070802Untitleddesign(25).png';
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from "react-icons/bs";
import CardSlider from './CardSlider';
import { Link, useNavigate } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import axios from 'axios';
import { BrandCardSlider } from './BrandCardSlider';
import { useLoading } from '../Context/LoadingContext';
import { NewYearProductCard } from './NewYearProductCard';

const Slides =
    [
        {
            "src": image1,
            "alt": "Image-1"
        },
        {
            "src": image2,
            "alt": "Image-2"
        },
        {
            "src": image3,
            "alt": "Image-3"
        }
    ];
    
const importAll = (r) => {
    let images = {};
    r.keys().forEach((item) => {
        images[item.replace("./", "")] = r(item);
    });
    return images;
};

// Load images from 'src/assets/Category/'
const imageMap = importAll(require.context("../assets/Category", false, /\.(png|jpe?g|svg)$/));

export const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [transitionDirection, setTransitionDirection] = useState('forward');
    const [isPaused, setIsPaused] = useState(false);
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubCategories] = useState([]);
    const { setLoading } = useLoading();


    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:9000/categories');
            if (response.status === 200) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleLeft = () => {
        setTransitionDirection('backward');
        setCurrentSlide((prev) => (prev - 1 + Slides.length) % Slides.length);
    };

    const handleRight = () => {
        setTransitionDirection('forward');
        setCurrentSlide((prev) => (prev + 1) % Slides.length);
    };

    const goToSlide = (index) => {
        setTransitionDirection(index > currentSlide ? 'forward' : 'backward');
        setCurrentSlide(index);
        setIsPaused(true);
    };

    useEffect(() => {
        if (!isPaused) {
            const timer = setTimeout(() => {
                handleRight();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [currentSlide, isPaused]);

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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 1000);

        return () => clearTimeout(timer);
    }, [setLoading]);

    return (
        <>
            <div className='Home'>
                <div
                    className={`slider-container ${transitionDirection}`}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <BsArrowLeftCircleFill className='arrow arrow-left' onClick={handleLeft} />
                    <Link to={"/ecommerce/demo"}>
                        <img
                            src={Slides[currentSlide].src}
                            alt={Slides[currentSlide].alt}
                            className='slider-image'
                            loading='lazy'
                        />
                    </Link>
                    <BsArrowRightCircleFill className='arrow arrow-right' onClick={handleRight} />

                    <div className='indicators'>
                        {Slides.map((_, index) => (
                            <div
                                key={index}
                                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => goToSlide(index)}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>

            <div className='card-slider-container'>
                <CardSlider />
            </div>

            <section className='shop-by-category-home'>
                <div className='top-section'>
                    <h5>Shop By Category</h5>
                    <button onClick={() => {
                        navigate('/ecommerce/shop-by-category');
                        window.location.reload();
                    }}>View All</button>
                </div>
                <div className='bottom-section'>
                    {categories.map((category) => {
                        const imageSrc = imageMap[category.image_url] || imageMap["default.png"];

                        return (
                            <div
                                key={category.id}
                                className='category-card'
                                onClick={() => handleCategoryClick(category.slug_title)}>
                                <img
                                    src={imageSrc}
                                    alt={category.name}
                                    loading='lazy'
                                />
                                <h6>{category.name}</h6>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section>
                <ProductCard />
            </section>
            <section>
                <NewYearProductCard />
            </section>
            <section>
                <BrandCardSlider />
            </section>
        </>
    );
};
