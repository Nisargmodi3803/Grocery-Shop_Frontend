import React, { useEffect, useState } from 'react';
import './MyProfile.css';
import axios from 'axios';
import { ImageModal } from './ImageModal';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const importAll = (r) => {
    let images = {};
    r.keys().forEach((item) => {
        images[item.replace("./", "")] = r(item);
    });
    return images;
};

const imageMap = importAll(require.context("../assets/Customer", false, /\.(png|jpeg|svg|jpg|JPEG|JPG)$/));

export const MyProfile = () => {
    const [customer, setCustomer] = useState({});
    const [image, setImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [hovered, setHovered] = useState(false); // For handling hover state
    const [file, setFile] = useState(null); // To hold the selected file
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const fetchCustomerDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:9000/profile/${sessionStorage.getItem("customerEmail")}`);
            if (response.status === 200) {
                setCustomer(response.data);
                setImage(response.data.customerImage || 'default.png');
            }
        } catch (error) {
            if (error.response.status === 404) {
                console.log("Customer not found");
            } else {
                console.error("Error fetching customer details:", error);
                alert("Something went wrong in fetching Customer Details. Please try again!");
            }
        }
    };

    useEffect(() => {
        fetchCustomerDetails();
    }, []);

    const handleImageChange = async (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setImage(URL.createObjectURL(selectedFile)); // Set the preview
            setIsEditing(true);

            // Create FormData and append the file with the correct key "file"
            const formData = new FormData();
            formData.append('file', selectedFile);  // <-- Key should be "file" (matches backend)

            try {
                const response = await axios.patch(
                    `http://localhost:9000/change-profile-image/${sessionStorage.getItem("customerEmail")}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );

                if (response.status === 200) {
                    console.log('Image uploaded successfully:', response.data);
                    setImage(response.data.profileImage);  // Update the image if successful
                } else {
                    console.error('Error uploading image:', response);
                    alert("Error uploading image. Please try again!");
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                alert("Something went wrong with image upload.");
            }
        }
    };


    const handleMouseEnter = () => setHovered(true);
    const handleMouseLeave = () => setHovered(false);

    const handleViewClick = () => {
        if (image !== 'default.png') {
            // Open the image in a new tab for viewing
            // window.open(`http://localhost:9000/uploads/${image}`, '_blank');
            setShowModal(true);
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleEditClick = () => {
        document.getElementById("file-input").click(); // Trigger the file input on edit click
        window.location.reload();
    };

    return (
        <div className='my-profile'>
            <div className='profile-section'>
                <div className='profile-nav-section'>
                    <div className='profile-info'>
                        <div
                            className='profile-image'
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <img
                                src={image && image !== 'default.png' ? `http://localhost:9000/uploads/${image}` : imageMap[image] || image}
                                alt="Profile"
                            />
                            {hovered && (
                                <div className="image-options">
                                    <button
                                        className={`view-btn ${image === 'default.png' ? 'disabled' : ''}`}
                                        onClick={handleViewClick}
                                        disabled={image === 'default.png'}
                                    >
                                        View
                                    </button>
                                    <button className="edit-btn" onClick={handleEditClick}>
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>
                        <h3><b>Hello</b> {customer.customerName}</h3>
                        <p>{customer.customerMobile}</p>
                        <p className='ecommerce-points'>
                            Ecommerce Points: <span>{customer.customerPoints ? customer.customerPoints.toFixed(2) : '0.00'}</span>
                        </p>
                    </div>
                    <ul className='nav-list'>
                        <li className='active'
                            onClick={() => {
                                navigate('/ecommerce/my-profile');
                                window.location.reload();
                            }}>My Profile</li>
                        <li onClick={() => {
                            navigate('/ecommerce/change-password');
                            window.location.reload();
                        }}>Change Password</li>
                        <li onClick={() => {
                            navigate('/ecommerce/my-wishlist');
                            window.location.reload();
                        }}>My Wishlist</li>
                        <li onClick={() => {
                            navigate('/ecommerce/my-orders');
                            window.location.reload();
                        }}>Order List</li>
                        <li onClick={() => {
                            navigate('/ecommerce/refer-and-earn');
                            window.location.reload();
                        }}>Refer & Earn</li>
                        <li onClick={() => {
                            navigate('/ecommerce/coupon-code');
                            window.location.reload();
                        }}>Coupon Code</li>
                        <li onClick={() => {
                            navigate('/ecommerce/my-ecommerce');
                            window.location.reload();
                        }}>My Ecommerce</li>
                        <li>Logout</li>
                    </ul>
                </div>

                <div className='my-profile-section'>
                    {/* Profile information can go here */}
                    <input
                        id="file-input"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                        accept="image/*"
                    />
                </div>
            </div>
            {showModal && <ImageModal image={image} closeModal={closeModal} />}
        </div>
    );
};
