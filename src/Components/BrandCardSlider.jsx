import React, { useState, useEffect, useRef } from 'react';
import './BrandCardSlider.css';
import { useSwipeable } from "react-swipeable";
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

const imageMap = importAll(require.context("../assets/Brand", false, /\.(png|jpeg|svg|jpg|JPEG)$/));

export const BrandCardSlider = () => {
    const direction = useRef("normal");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [brand, setBrand] = useState([]);
    const navigate = useNavigate();
    const {setLoading} = useLoading();

    const handleNext = () => {
        direction.current = "normal";
        setCurrentIndex((prevIndex) => (prevIndex + 1) % (brand.length - 7));
    };

    const handlePrev = () => {
        direction.current = "reverse";
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? brand.length - 8 : prevIndex - 1
        );
    };

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:9000/brand');
            if (response.status === 200) {
                setBrand(response.data);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("No Brands Found");
            } else {
                console.error(error);
                alert("Something went wrong. Please try again!");
            }
        }finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    useEffect(() => {
        if (!isPaused) {
            const timer = setTimeout(() => {
                handleNext();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, isPaused]);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 1000);
    
        return () => clearTimeout(timer);
      }, [setLoading]);

    const swipeHandlers = useSwipeable({
        onSwipedLeft: handleNext,
        onSwipedRight: handlePrev,
        preventScrollOnSwipe: true,
        trackMouse: true,
    });

    return (
        <section className='brand-card-slider'>
            <div
                {...swipeHandlers}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div className='card-section-header'>
                    <h5>Shop by Brand</h5>
                    <button onClick={() => {
                        navigate("/ecommerce/shop-by-brand");
                        // window.location.reload();
                    }}>View All</button>
                </div>
                <div
                    className="brand-slider-wrapper"
                    style={{
                        animation: direction.current === "normal"
                            ? "slideIn 0.5s ease-in-out"
                            : "slideInReverse 0.5s ease-in-out"
                    }}
                >
                    {brand.slice(currentIndex, currentIndex + 12).map((d) => {
                        const imageSrc = imageMap[d.image_url] || `http://localhost:9000/uploads/${d.image_url}` || imageMap["default.jpg"] ;

                        return (
                            <div className='card'
                                key={d.id}
                                onClick={() => {
                                    navigate(`/ecommerce/brand/${d.slug_title}`);
                                    // window.location.reload();
                                }}>
                                <div className='brand-image-container'>
                                    <img src={imageSrc} alt={d.name} loading='lazy' />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
