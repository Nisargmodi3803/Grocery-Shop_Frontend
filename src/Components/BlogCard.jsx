import React from 'react'
import { FaCalendarDay } from "react-icons/fa";
import './BlogCard.css'

export default function BlogCard() {
    return (
        <div className='blog-container'>
            <div className='blog-card'>
                <div className='blog-image'>
                    <img
                        src='https://bitsinfotech.in/ecommerce/fmcg_upload/blog/040822102959.jpg'
                        loading='lazy'
                    />
                </div>
                <div className='blog-content'>
                    <div className='blog-title'>
                        <h3>Easy Homemade Flatbread Crackers</h3>
                    </div>
                    <div className='blog-date'>
                        <span><FaCalendarDay /> July 18, 2022</span>
                    </div>
                    <div className='blog-description'>
                        <p>I love how simple this recipe was, and super easy to make double! I paired it with a baked brie for a holiday party!</p>
                    </div>
                    <div className='blog-readmore'>
                        <span>READ MORE {'>'}</span>
                    </div>
                </div>
            </div>

            <div className='blog-card'>
                <div className='blog-image'>
                    <img
                        src='https://bitsinfotech.in/ecommerce/fmcg_upload/blog/040822102959.jpg'
                        loading='lazy'
                    />
                </div>
                <div className='blog-content'>
                    <div className='blog-title'>
                        <h3>Easy Homemade Flatbread Crackers</h3>
                    </div>
                    <div className='blog-date'>
                        <span><FaCalendarDay /> July 18, 2022</span>
                    </div>
                    <div className='blog-description'>
                        <p>I love how simple this recipe was, and super easy to make double! I paired it with a baked brie for a holiday party!</p>
                    </div>
                    <div className='blog-readmore'>
                        <span>READ MORE {'>'}</span>
                    </div>
                </div>
            </div>
            
            <div className='blog-card'>
                <div className='blog-image'>
                    <img
                        src='https://bitsinfotech.in/ecommerce/fmcg_upload/blog/040822102959.jpg'
                        loading='lazy'
                    />
                </div>
                <div className='blog-content'>
                    <div className='blog-title'>
                        <h3>Easy Homemade Flatbread Crackers</h3>
                    </div>
                    <div className='blog-date'>
                        <span><FaCalendarDay /> July 18, 2022</span>
                    </div>
                    <div className='blog-description'>
                        <p>I love how simple this recipe was, and super easy to make double! I paired it with a baked brie for a holiday party!</p>
                    </div>
                    <div className='blog-readmore'>
                        <span>READ MORE {'>'}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
