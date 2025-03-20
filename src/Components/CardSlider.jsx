import React, { useState, useEffect, useRef } from 'react';
import './CardSlider.css';
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from 'react-icons/bs';
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

const imageMap = importAll(require.context("../assets/Subcategory", false, /\.(png|jpeg|svg|jpg|JPEG)$/));

const CardSlider = () => {
    const direction = useRef("normal");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [cardData, setCardData] = useState([]);
    const naviagate = useNavigate();
    const {setLoading} = useLoading();

    const fetchCardDatas = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:9000/subcategories');

            if (response.status === 200) {
                setCardData(response.data);
            }
        } catch (error) {
            console.error("Error fetching card data:", error);
        }finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCardDatas();
    }, []);

    const handleNext = () => {
        direction.current = "normal";
        setCurrentIndex((prevIndex) => (prevIndex + 1) % (cardData.length - 7));
    };

    const handlePrev = () => {
        direction.current = "reverse";
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? cardData.length - 8 : prevIndex - 1
        );
    };

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
        <div
            {...swipeHandlers}
            className="card-slider-container1"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="card-slider-arrow">
                <BsArrowLeftCircleFill
                    className="arrow1 arrow-left"
                    onClick={handlePrev}
                />
            </div>
            <div
                className="card-slider-wrapper"
                style={{
                    animation: direction.current === "normal"
                        ? "slideIn 0.5s ease-in-out"
                        : "slideInReverse 0.5s ease-in-out"
                }}
            >
                {cardData.slice(currentIndex, currentIndex + 8).map((d) => {
                    const imageSrc = imageMap[d.image_url] || `http://localhost:9000/uploads/${d.image_url}` || imageMap["default.jpg"];

                    return (
                        <div
                            className='card'
                            key={d.id}
                            onClick={() => {
                                naviagate(`/ecommerce/sub-category/${d.slug_title}`);
                                // window.location.reload();
                            }}>
                            <div className='card-image-container'>
                                <img src={imageSrc} alt={d.name} loading='lazy' />
                            </div>
                            <div className='card-content'>
                                <p>{d.name}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className='card-slider-arrow'>
                <BsArrowRightCircleFill
                    className="arrow1 arrow-right"
                    onClick={handleNext}
                />
            </div>
        </div>
    );
};

export default CardSlider;
