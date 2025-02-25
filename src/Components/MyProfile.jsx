import './MyProfile.css';
import React, { useEffect, useRef, useState } from 'react';
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
import { RiShieldUserLine } from "react-icons/ri";
import { MdPhoneAndroid } from "react-icons/md";
import { MdOutlineMail } from "react-icons/md";
import { BiMaleFemale } from "react-icons/bi";
import { FaMale } from "react-icons/fa";
import { FaFemale } from "react-icons/fa";
import { IoHomeOutline } from "react-icons/io5";
import { BsCalendarDate } from "react-icons/bs";
import { FaRegEdit } from "react-icons/fa";
import { ImCancelCircle } from "react-icons/im";
import { format, parseISO } from 'date-fns';
import Swal from 'sweetalert2';

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
    const { setLoading } = useLoading();

    const [editMode, setEditMode] = useState({
        name: false,
        mobile: false,
        gender: false,
        dob: false,
        address: false,
    });

    const [updateCustomer, setUpdateCustomer] = useState({
        customerName: '',
        customerMobile: '',
        customerGender: 0,
        customerDob: '',
        customerAddress: '',
    });

    useEffect(() => {
        if (customer) {
            setUpdateCustomer({
                customerName: customer.customerName || '',
                customerMobile: customer.customerMobile || '',
                customerGender: customer.customerGender || 0,
                customerDob: customer.customerDob || '',
                customerAddress: customer.customerAddress || ''
            });
        }
    }, [customer]);

    // Create refs for inputs
    const nameRef = useRef(null);
    const mobileRef = useRef(null);
    const addressRef = useRef(null);
    const dobRef = useRef(null);

    useEffect(() => {
        if (editMode.name && nameRef.current) {
            nameRef.current.focus();
        }
        if (editMode.mobile && mobileRef.current) {
            mobileRef.current.focus();
        }
        if (editMode.address && addressRef.current) {
            addressRef.current.focus();
        }

        if (editMode.dob && dobRef.current) {
            dobRef.current.focus();
        }

    }, [editMode]); // Runs whenever `editMode` changes

    useEffect(() => {
        if (!sessionStorage.getItem("isAuthenticated")) {
            navigate("/ecommerce/");
        }
    }, []);


    // Toggle edit mode for the specific field
    const handleEditProfileClick = (field) => {
        setEditMode((prevState) => ({
            ...prevState,
            [field]: !prevState[field],
        }));
    };

    const handleCancelProfileClick = (field) => {
        setEditMode((prevMode) => ({
            ...prevMode,
            [field]: false, // Set the corresponding field edit mode to false
        }));
    };

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

    const handleSaveProfileClick = async () => {
        try {
            // Prepare the updateDTO with the updated data
            const updateDTO = {
                customerName: updateCustomer.customerName,
                customerMobile: updateCustomer.customerMobile,
                customerGender: updateCustomer.customerGender,
                customerDob: updateCustomer.customerDob ? updateCustomer.customerDob.toString() : "",
                customerAddress: updateCustomer.customerAddress,
            };

            const response = await axios.patch(`http://localhost:9000/update-profile/${sessionStorage.getItem("customerEmail")}`, updateDTO);

            if (response.status === 200) {
                setEditMode({
                    name: false,
                    mobile: false,
                    gender: false,
                    dob: false,
                    address: false,
                });
                window.location.reload();
            }
        } catch (error) {
            if (error.response.status === 400) {
                console.log("Bad Request");
            } else {
                console.error('Error updating profile:', error);
                alert('There was an error updating the profile');
            }
        }
    };

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
                    window.location.reload();
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

    const deleteProfileImageAlert = async () => {
        return await Swal.fire({
            title: "Are you sure you want to delete this Profile Image?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            confirmButtonColor: "green",
            cancelButtonColor: "red",
        });
    };

    const handleDeleteClick = async () => {
        const result = await deleteProfileImageAlert(); // Await the user's response

        if (result.isConfirmed) {
            if (image !== 'default.png') {
                try {
                    const response = await axios.patch(`http://localhost:9000/delete-profile-image/${sessionStorage.getItem("customerEmail")}`);
                    if (response.status === 200) {
                        console.log('Image deleted successfully:', response.data);
                        setImage('default.png'); // Update the image after deletion
                        Swal.fire("Deleted!", "Your profile image has been deleted.", "success");
                    }
                } catch (error) {
                    if (error.response?.status === 404) {
                        console.log("Customer not found");
                        Swal.fire("Error", "Customer not found.", "error");
                    } else {
                        console.error('Error deleting image:', error);
                        Swal.fire("Error", "Something went wrong. Please try again!", "error");
                    }
                }
            }
        }
    };


    const handleEditClick = () => {
        document.getElementById("file-input").click(); // Trigger the file input on edit click
    };


    const logoutAlert = async () => {
        return await Swal.fire({
            title: "Are you sure you want to Logout?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            confirmButtonColor: "green",
            cancelButtonColor: "red",
        });
    };

    const handleLogout = async () => {
        const result = await logoutAlert();
        if (result.isConfirmed) {
            sessionStorage.removeItem("isAuthenticated");
            sessionStorage.removeItem("customerEmail");
            sessionStorage.removeItem("cartCount");
            sessionStorage.removeItem("customerData");
            await Swal.fire("Logged Out!", "You have been logged out.", "success");
            navigate("/ecommerce/");
            window.location.reload();
        }
    };

const closeModal = () => {
    setShowModal(false);
};

// Formate Date Function. Formate YYYY-MM-DD to DD-MM-YYYY
function formatDate(dateStr) {
    if (!dateStr) return "Not Specified Yet"; // Handle null or empty values

    try {
        const date = parseISO(dateStr); // Convert 'YYYY-MM-DD' string to Date object
        return format(date, "dd-MM-yyyy"); // Format to 'DD-MM-YYYY'
    } catch (error) {
        return "Invalid Date"; // Handle unexpected errors
    }
}
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
                    <h3>Hello {customer.customerName}</h3>
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
                        }}><IoPersonOutline /> My Profile</li>

                    <li onClick={() => {
                        navigate('/ecommerce/change-password');
                        window.location.reload();
                    }}><TbPasswordUser /> Change Password</li>

                    <li onClick={() => {
                        navigate('/ecommerce/my-wishlist');
                        window.location.reload();
                    }}><FaRegHeart /> My Wishlist</li>

                    <li onClick={() => {
                        navigate('/ecommerce/my-orders');
                        window.location.reload();
                    }}><CiCircleList /> Order List</li>

                    <li onClick={() => {
                        navigate('/ecommerce/refer-and-earn');
                        window.location.reload();
                    }}><MdCurrencyRupee /> Refer & Earn</li>

                    <li onClick={() => {
                        navigate('/ecommerce/coupon-code');
                        window.location.reload();
                    }}><RiCouponLine /> Coupon Code</li>

                    <li onClick={() => {
                        navigate('/ecommerce/my-ecommerce');
                        window.location.reload();
                    }}><BsCreditCard2Back /> My Ecommerce</li>

                    <li onClick={handleLogout}><MdLock /> Logout</li>
                </ul>
            </div>

            <div className="my-profile-section">
                <div className="my-profile-section-header">
                    <h1>MY PROFILE</h1>
                </div>
                <div className="my-profile-section-body">
                    <div className="profile-detail">
                        <h3><RiShieldUserLine /> FULL NAME</h3>
                        {editMode.name ? (
                            <div className='edit-part'>
                                <input
                                    type="text"
                                    value={updateCustomer.customerName}
                                    ref={nameRef}
                                    onChange={(e) => setUpdateCustomer({ ...updateCustomer, customerName: e.target.value })}
                                ></input>
                                <span className="delete" onClick={() => handleCancelProfileClick('name')}>
                                    <ImCancelCircle />
                                </span>
                            </div>
                        ) : (
                            <p>
                                <>
                                    {customer.customerName}
                                    <span className="edit" onClick={() => handleEditProfileClick('name')}>
                                        <FaRegEdit />
                                    </span>
                                </>
                            </p>
                        )}

                        <h3><MdPhoneAndroid /> MOBILE NUMBER</h3>
                        {editMode.mobile ? (
                            <div className='edit-part'>
                                <input
                                    type="text"
                                    ref={mobileRef}
                                    value={updateCustomer.customerMobile}
                                    onChange={(e) => setUpdateCustomer({ ...updateCustomer, customerMobile: e.target.value })}
                                />
                                <span className="delete" onClick={() => handleCancelProfileClick('mobile')}>
                                    <ImCancelCircle />
                                </span>
                            </div>
                        ) : (
                            <p>
                                <>
                                    {customer.customerMobile}
                                    <span className="edit" onClick={() => handleEditProfileClick('mobile')}>
                                        <FaRegEdit />
                                    </span>
                                </>
                            </p>
                        )}

                        {/* Email Address don't edit */}
                        <h3><MdOutlineMail /> EMAIL ADDRESS</h3>
                        <p>{customer.customerEmail}</p>

                        <h3><BiMaleFemale /> GENDER</h3>
                        {editMode.gender ? (
                            <p>
                                <div className="gender-container">
                                    <input
                                        type="radio"
                                        id="male"
                                        name="gender"
                                        value="1"
                                        onChange={(e) => setUpdateCustomer({ ...updateCustomer, customerGender: e.target.value })}
                                    />
                                    <label htmlFor="male">
                                        <FaMale /> Male
                                    </label>

                                    <input
                                        type="radio"
                                        id="female"
                                        name="gender"
                                        value="2"
                                        onChange={(e) => setUpdateCustomer({ ...updateCustomer, customerGender: e.target.value })}
                                    />
                                    <label htmlFor="female">
                                        <FaFemale /> Female
                                    </label>
                                </div>
                                <span className="delete" onClick={() => handleCancelProfileClick('gender')}>
                                    <ImCancelCircle />
                                </span>
                            </p>
                        ) : (
                            <p>
                                {customer.customerGender === 1 ? (
                                    <>
                                        <label><FaMale /> Male</label>
                                    </>
                                ) : customer.customerGender === 2 ? (
                                    <>
                                        <label><FaFemale /> Female</label>
                                    </>
                                ) : (
                                    "Not Specified Yet"
                                )}
                                <span className="edit" onClick={() => handleEditProfileClick('gender')}>
                                    <FaRegEdit />
                                </span>
                            </p>
                        )}

                        {/* Date of Birth */}
                        <h3><BsCalendarDate /> DATE OF BIRTH</h3>
                        {editMode.dob ? (
                            <div className='edit-part'>
                                <input
                                    type="date"
                                    value={updateCustomer.customerDob || ''}
                                    onChange={(e) => setUpdateCustomer({ ...updateCustomer, customerDob: e.target.value })}
                                    useRef={dobRef}
                                />
                                <span className="delete" onClick={() => handleCancelProfileClick('dob')}>
                                    <ImCancelCircle />
                                </span>
                            </div>
                        ) : (
                            <p>
                                <>
                                    {formatDate(customer.customerDob)}
                                    <span className="edit" onClick={() => handleEditProfileClick('dob')}>
                                        <FaRegEdit />
                                    </span>
                                </>
                            </p>
                        )}

                        <h3><IoHomeOutline /> ADDRESS</h3>
                        {editMode.address ? (
                            <div className='edit-part'>
                                <input
                                    type="text"
                                    value={updateCustomer.customerAddress}
                                    onChange={(e) => setUpdateCustomer({ ...updateCustomer, customerAddress: e.target.value })}
                                    ref={addressRef}
                                />
                                <span className="delete" onClick={() => handleCancelProfileClick('address')}>
                                    <ImCancelCircle />
                                </span>
                            </div>
                        ) : (
                            <p>
                                <>
                                    {customer.customerAddress || "Not Specified Yet"}
                                    <span className="edit" onClick={() => handleEditProfileClick('address')}>
                                        <FaRegEdit />
                                    </span>
                                </>
                            </p>
                        )}
                    </div>
                    {(editMode.name || editMode.mobile || editMode.gender || editMode.dob || editMode.address) && (
                        <button className="save-btn" onClick={handleSaveProfileClick}>
                            UPDATE
                        </button>
                    )}
                </div>
            </div>


            <input
                id="file-input"
                type="file"
                style={{ display: 'none' }}
                onChange={handleImageChange}
                accept="image/*"
            />
        </div>
        {showModal && <ImageModal image={image} closeModal={closeModal} />}
    </div>
);
};
