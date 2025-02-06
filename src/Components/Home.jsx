import React, { useEffect, useState } from 'react';
import './Home.css';
import Slides from './Slides';
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from "react-icons/bs";
import CardSlider from './CardSlider';
import { Link, useNavigate } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import axios from 'axios';

export const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState('forward');
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate()

  const categories1 = [
    { name: 'Vegetables & Fruits', img: 'https://bitsinfotech.in/ecommerce/fmcg_upload/category/040822105930.png' },
    { name: 'Dairy, Bread & Eggs', img: 'https://bitsinfotech.in/ecommerce/fmcg_upload/category/030822024035.png' },
    { name: 'Cold Drinks & Juices', img: 'https://bitsinfotech.in/ecommerce/fmcg_upload/category/030822022302.png' },
    { name: 'Tea, Coffee & Health Drinks', img: 'https://bitsinfotech.in/ecommerce/fmcg_upload/category/030822032437.png' },
    { name: 'Atta, Rice & Dal', img: 'https://bitsinfotech.in/ecommerce/fmcg_upload/category/030822020431.png' },
    { name: 'Sweet Tooth', img: 'https://bitsinfotech.in/ecommerce/fmcg_upload/category/030822040938.png' },
  ];

  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:9000/categories');
      setCategories(response.data);
    }
    catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  useEffect(() => {
    fetchCategories();
  },[])

  const handleLeft = () => {
    setTransitionDirection('backward');
    setCurrentSlide((prev) => (prev - 1 + Slides.length) % Slides.length);
    // setIsPaused(true);
  };

  const handleRight = () => {
    setTransitionDirection('forward');
    setCurrentSlide((prev) => (prev + 1) % Slides.length);
    // setIsPaused(true);
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

  return (
    <>
      <div className='Home'>
        <div
          className={`slider-container ${transitionDirection}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <BsArrowLeftCircleFill
            className='arrow arrow-left'
            onClick={handleLeft}
          />
          <Link to={"/ecommerce/demo"}>
            <img
              src={Slides[currentSlide].src}
              alt={Slides[currentSlide].alt}
              className='slider-image'
              loading='lazy'

            />
          </Link>

          <BsArrowRightCircleFill
            className='arrow arrow-right'
            onClick={handleRight}
          />

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
          <button onClick={() => { navigate('/ecommerce/shopbycategory') }}>View All</button>
        </div>
        <div className='bottom-section'>
          {categories.map((category, index) => (
            <div key={category.id} className='category-card'>
              <a href=''>
                <img
                  src={category.image_url}
                  alt={category.name}
                  loading='lazy' />
              </a>
              <a href=''>
                <h6>{category.name}</h6>
              </a>
            </div>
          ))}

        </div>
      </section>
      <section>
        <ProductCard />
      </section>
    </>

  );
};
