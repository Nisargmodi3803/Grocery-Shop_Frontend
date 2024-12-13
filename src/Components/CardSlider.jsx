import React, { useState, useEffect, useRef } from 'react';
import './CardSlider.css';
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from 'react-icons/bs';
import { useSwipeable } from "react-swipeable";

const cardData = [
    { id: 1, title: "Cold Drink", img: "https://bitsinfotech.in/ecommerce/fmcg_upload/sub_category/030822032712Nest(34).png" },
    { id: 2, title: "Chocolates", img: "https://bitsinfotech.in/ecommerce/fmcg_upload/sub_category/030822021820Nest(7).png" },
    { id: 3, title: "Milk", img: "https://bitsinfotech.in/ecommerce/fmcg_upload/sub_category/030822030953Nest(26).png" },
    { id: 4, title: "Bread", img: "https://bitsinfotech.in/ecommerce/fmcg_upload/sub_category/030822020906Nest(2).png" },
    { id: 5, title: "Tea", img: "https://bitsinfotech.in/ecommerce/fmcg_upload/sub_category/030822033026Nest(36).png" },
    { id: 6, title: "Panner & Kofu", img: "https://bitsinfotech.in/ecommerce/fmcg_upload/sub_category/030822034510Nest(44).png" },
    { id: 7, title: "Rice", img: "https://bitsinfotech.in/ecommerce/fmcg_upload/sub_category/030822033503Nest(29).png" },
    { id: 8, title: "Atta", img: "https://bitsinfotech.in/ecommerce/fmcg_upload/sub_category/030822034201Nest(43).png" },
    { id: 9, title: "Juice", img: "https://bitsinfotech.in/ecommerce/fmcg_upload/sub_category/030822032631Nest(33).png" },
    { id: 10, title: "Energy Drink", img: "https://bitsinfotech.in/ecommerce/fmcg_upload/sub_category/030822023952Nest(12).png" },
    { id: 11, title: "Ice Cream", img: "https://bitsinfotech.in/ecommerce/fmcg_upload/sub_category/030822034121Nest(42).png" },
    { id: 12, title: "Candy", img: "https://bitsinfotech.in/ecommerce/fmcg_upload/sub_category/030822021719Nest(5).png" },
];

const CardSlider = () => {
    const direction = useRef("normal");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

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
            <div className="card-slider-wrapper">
                {cardData.slice(currentIndex, currentIndex + 8).map((d) => (
                    <div className='card' key={d.id}>
                        <div className='card-image-container'>
                            <img src={d.img} alt={d.title} />
                        </div>
                        <div className='card-content'>
                            <p>{d.title}</p>
                        </div>
                    </div>
                ))}
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
