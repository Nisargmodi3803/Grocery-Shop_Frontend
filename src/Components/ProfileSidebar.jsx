import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ImageModal } from './ImageModal';
import { useNavigate } from 'react-router-dom';
import { FaUserEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useLoading } from "../Context/LoadingContext";
import { IoPersonOutline } from "react-icons/io5";
import { TbPasswordUser } from "react-icons/tb";
import { CiCircleList } from "react-icons/ci";
import { FaRegHeart } from "react-icons/fa6";
import { MdCurrencyRupee } from "react-icons/md";
import { RiCouponLine } from "react-icons/ri";
import { BsCreditCard2Back } from "react-icons/bs";
import { MdLock } from "react-icons/md";
import { NavLink } from "react-router-dom";

const importAll = (r) => {
    let images = {};
    r.keys().forEach((item) => {
        images[item.replace("./", "")] = r(item);
    });
    return images;
};

const imageMap = importAll(require.context("../assets/Customer", false, /\.(png|jpeg|svg|jpg|JPEG|JPG)$/));


export const ProfileSidebar = () => {
    const [customer, setCustomer] = useState({});
    const [image, setImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [hovered, setHovered] = useState(false); // For handling hover state
    const [file, setFile] = useState(null); // To hold the selected file
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const { setLoading } = useLoading();

    const fetchCustomerDetails = async () => {
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomerDetails();
    }, []);

    const handleImageChange = async (event) => {
        const selectedFile = event.target.files[0];
        console.log("Handle Image Change Call");
        // setLoading(true);
        if (selectedFile) {
            setFile(selectedFile);
            setImage(URL.createObjectURL(selectedFile)); // Set the preview
            setIsEditing(true);

            // Create FormData and append the file with the correct key "file"
            const formData = new FormData();
            formData.append('file', selectedFile);  // <-- Key should be "file" (matches backend)

            try {
                console.log("API CALL")
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
                    setImage(customer.customerImage);  // Update the image if successful
                    // window.location.reload();
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
            setShowModal(true);
        }
    };

    const handleDeleteClick = async () => {
        // setLoading(true);
        console.log("Handle Delete Click Call");
        if (image !== 'default.png') {
            try {
                const response = await axios.patch(`http://localhost:9000/delete-profile-image/${sessionStorage.getItem("customerEmail")}`);
                if (response.status === 200) {
                    console.log('Image deleted successfully:', response.data);
                    setImage('default.png');  // Update the image if successful
                }
            } catch (error) {
                if (error.response.status === 404) {
                    console.log("Customer not found");
                } else {
                    console.error('Error deleting image:', error);
                    alert("Something went wrong with image deletion. Please try again!");
                }
            }
        }
    };


    const handleEditClick = () => {
        document.getElementById("file-input").click(); // Trigger the file input on edit click
    };

    const handleLogout = () => {
        sessionStorage.removeItem("isAuthenticated");
        sessionStorage.removeItem("customerEmail");
        sessionStorage.removeItem("cartCount");
        sessionStorage.removeItem("customerData");
        navigate("/ecommerce/");
        // window.location.reload();
    };

    const closeModal = () => {
        setShowModal(false);
    };
    return (
        <>
            <div
                className='profile-image'
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <img
                    src={image && image !== 'default.png' ? `http://localhost:9000/uploads/${image}` : imageMap[image] || image}
                    alt="Profile"
                    onClick={() => {
                        handleViewClick();
                    }}
                    disabled={image === 'default.png'}
                />
                {hovered && (
                    <div className="image-options">
                        <button className="edit-btn" onClick={() => {
                            handleEditClick();
                            // window.location.reload();
                        }}>
                            {/* <FaUserEdit/> Edit */}
                            <FaUserEdit />
                        </button>
                        <button
                            className={`view-btn ${image === 'default.png' ? 'disabled' : ''}`}
                            onClick={() => {
                                handleDeleteClick();
                                // window.location.reload();
                            }}
                            disabled={image === 'default.png'}
                        >
                            {/* <MdDelete/> Delete */}
                            <MdDelete />
                        </button>
                    </div>
                )}
            </div>
            <h3><b>Hello</b> {customer.customerName}</h3>
            <p>{customer.customerMobile}</p>
            <p className='ecommerce-points'>
                Ecommerce Points: <span>{customer.customerPoints ? customer.customerPoints.toFixed(2) : '0.00'}</span>
            </p>
            <ul className='nav-list'>
                <li>
                    <NavLink to="/ecommerce/my-profile" activeClassName="active">
                        <IoPersonOutline /> My Profile
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/ecommerce/change-password" activeClassName="active">
                        <TbPasswordUser /> Change Password
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/ecommerce/my-wishlist" activeClassName="active">
                        <FaRegHeart /> My Wishlist
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/ecommerce/my-orders" activeClassName="active">
                        <CiCircleList /> Order List
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/ecommerce/refer-and-earn" activeClassName="active">
                        <MdCurrencyRupee /> Refer & Earn
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/ecommerce/coupon-code" activeClassName="active">
                        <RiCouponLine /> Coupon Code
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/ecommerce/my-ecommerce" activeClassName="active">
                        <BsCreditCard2Back /> My Ecommerce
                    </NavLink>
                </li>
                <li>
                    <button onClick={handleLogout} className="logout-btn">
                        <MdLock /> Logout
                    </button>
                </li>
            </ul>

            <input
                id="file-input"
                type="file"
                style={{ display: 'none' }}
                onChange={handleImageChange}
                accept="image/*"
            />
            {showModal && <ImageModal image={image} closeModal={closeModal} />}
        </>
    );
}
