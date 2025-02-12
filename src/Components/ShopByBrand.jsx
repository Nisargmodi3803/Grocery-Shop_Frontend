import React, { useEffect,useState } from 'react'
import './ShopByBrand.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const importAll = (r) => {
    let images = {};
    r.keys().forEach((item) => {
        images[item.replace("./", "")] = r(item);
    });
    return images;
};

const imageMap = importAll(require.context("../assets/Brand", false, /\.(png|jpe?g|svg|jpg)$/));

export const ShopByBrand = () => {
    const [brands, setBrands] = useState([]);
    const navigate = useNavigate();
    const fetchBrands = async () => {
        try {
            const response = await axios.get('http://localhost:9000/brand');
            if (response.status === 200) {
                setBrands(response.data);
            }
        } catch (error) {
            if (error.response.status === 404) {
                console.log("No Brands Found");
                alert("No Brands Found");
            } else {
                console.error(error);
                alert("Something went wrong. Please try again");
            }
        }
    }

    useEffect(() => {
        fetchBrands();
    },[])
    return (
        <section className='shop-by-brand'>
            <section className='container-title'>
                <h1>Shop By Brand</h1>
            </section>
            <section className='brand-container'>
                <div className='brand-grid'>
                    {brands.map((brand) => {
                        const imageSrc = imageMap[brand.image_url] || imageMap["default.png"];

                        return (
                            <div 
                            key={brand.id} 
                            className='brand-card'
                            onClick={() => navigate(`/ecommerce/brand/${brand.slug_title}`)}>
                                <img src={imageSrc} alt={brand.name} loading="lazy" />
                                <h6>{brand.name}</h6>
                            </div>
                        );
                    })}
                </div>
            </section>
        </section>
    )
}
