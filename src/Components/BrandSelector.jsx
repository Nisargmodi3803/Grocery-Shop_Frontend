import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./BrandSelector.css";

const BrandSelector = () => {
    const [brands, setBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch brands from API
        const fetchBrands = async () => {
            try {
                const response = await axios.get("http://localhost:9000/brands");
                setBrands(response.data);
                setSelectedBrand(response.data[0]); // Set first brand as default
            } catch (error) {
                console.error("Error fetching brands:", error);
            }
        };
        fetchBrands();
    }, []);


    const handleBrandClick = (brand) => {
        setSelectedBrand(brand);
        navigate(`/ecommerce/brand/${brand.slug}`);
    };

    return (
        <div className="brand-selector-container">
            <div className="brand-scroll">
                {brands.map((brand) => (
                    <div
                        key={brand.id}
                        className={`brand-item ${selectedBrand?.id === brand.id ? "selected" : ""}`}
                        onClick={() => handleBrandClick(brand)}
                    >
                        <img src={brand.logo} alt={brand.name} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BrandSelector;
