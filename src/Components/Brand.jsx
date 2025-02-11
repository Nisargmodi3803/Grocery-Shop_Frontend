import React from 'react'
import { IoMdHome } from 'react-icons/io5';

export const Brand = () => {
    const greater = '>';
    return (
        <div>
            <section className='product-navigate-section'>
                <span className='navigate'>
                    <a onClick={() => navigate('/ecommerce/')}>
                        <b><IoMdHome /> Home</b>
                    </a>
                    <span> {greater} </span>
                    <a href=''>{product.cat?.name || "Category"}</a>
                    <span> {greater} </span>
                    <a href=''>{product.subcat?.name || "Subcategory"}</a>
                </span>
            </section>
        </div>
    )
}
