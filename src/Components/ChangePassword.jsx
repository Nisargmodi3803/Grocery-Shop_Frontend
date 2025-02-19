import './ChangePassword.css'
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
import { MdOutlineMail } from "react-icons/md";
import { PiPasswordBold } from "react-icons/pi";
import { TbPasswordMobilePhone } from "react-icons/tb";
import { GiConfirmed } from "react-icons/gi";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import Swal from 'sweetalert2';

const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => {
    images[item.replace("./", "")] = r(item);
  });
  return images;
};

const imageMap = importAll(require.context("../assets/Customer", false, /\.(png|jpeg|svg|jpg|JPEG|JPG)$/));


export const ChangePassword = () => {
  const [customer, setCustomer] = useState({});
  const [image, setImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hovered, setHovered] = useState(false); // For handling hover state
  const [file, setFile] = useState(null); // To hold the selected file
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const [showPassword, setShowPassword] = useState(false);
  const [changePassword, setChangePassword] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [success, setSuccess] = useState();
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setChangePassword((prevData) => ({
      ...prevData,
      [name]: value
    }));

    verifyChange(name, value);
  }

  const verifyChange = (name, value) => {
    const validationErrors = { ...errors };

    if (name === "newPassword") {
      if (changePassword.oldPassword) {
        if (value.length < 4 || value.length > 15) {
          validationErrors.password = "Password must be between 4 to 15 characters";
        } else {
          delete validationErrors.password;
        }
        if (changePassword.confirmPassword && value !== changePassword.confirmPassword) {
          validationErrors.confirmPassword = "Passwords do not match";
        } else {
          delete validationErrors.confirmPassword;
        }
        if (changePassword.oldPassword && value === changePassword.oldPassword) {
          validationErrors.oldPassword = "New Password cannot be same as Old Password";
        } else {
          delete validationErrors.oldPassword;
        }
      } else {
        validationErrors.oldPassword = "Old Password is required";
      }
    }

    if (name === "confirmPassword") {
      if (value !== changePassword.newPassword) {
        validationErrors.confirmPassword = "Passwords do not match";
      } else {
        delete validationErrors.confirmPassword;
      }
    }

    setErrors(validationErrors);
  }

  const handeChangePassword = async () => {
    try {
      const response = await axios.patch(`http://localhost:9000/change-password/${sessionStorage.getItem("customerEmail")}`, {
        oldPassword: changePassword.oldPassword,
        newPassword: changePassword.newPassword
      });

      if (response.status === 200) {
        setSuccess(true);
        setMessage("Password Changed Successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      if (error.response.status === 401) {
        setSuccess(false);
        setMessage("Old Password is incorrect!");
      } else if (error.response.status === 404) {
        setSuccess(false);
        setMessage("Customer not found!");
      } else {
        console.error("Error changing password:", error);
        alert("Something went wrong in changing Password. Please try again!");
      }
    }
  }

  return (
    <div className='my-wishlist'>
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
                      window.location.reload();
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
          </div>
          <ul className='nav-list'>
            <li onClick={() => {
              navigate('/ecommerce/my-profile');
              window.location.reload();
            }}><IoPersonOutline /> My Profile</li>

            <li className='active' onClick={() => {
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

        <div className='my-profile-section'>
          <div className="my-profile-section-header">
            <h1>CHANGE PASSWORD</h1>
          </div>
          <div className='my-profile-section-body'>
            <div className='profile-detail'>
              <h3><MdOutlineMail /> EMAIL ADDRESS</h3>
              <p>{customer.customerEmail}</p>

              <h3><PiPasswordBold /> OLD PASSWORD</h3>
              <div className='password-container'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder='ENTER YOUR OLD PASSWORD'
                  className='input-field'
                  name='oldPassword'
                  onChange={(e) => handleInputChange(e)}
                />
                <button type="button" className="toggle-btn" onClick={togglePasswordVisibility}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.oldPassword && <span className='error'>{errors.oldPassword}</span>}

              <h3><TbPasswordMobilePhone /> NEW PASSWORD</h3>
              <div className='password-container'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder='ENTER YOUR NEW PASSWORD'
                  className='input-field'
                  name='newPassword'
                  onChange={(e) => handleInputChange(e)}
                />
                <button type="button" className="toggle-btn" onClick={togglePasswordVisibility}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <span className='error'>{errors.password}</span>}


              <h3><GiConfirmed /> CONFIRM PASSWORD</h3>
              <div className='password-container'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder='CONFIRM PASSWORD'
                  className='input-field'
                  name='confirmPassword'
                  onChange={(e) => handleInputChange(e)}
                />
                <button type="button" className="toggle-btn" onClick={togglePasswordVisibility}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && <span className='error'>{errors.confirmPassword}</span>}

              {changePassword.oldPassword && changePassword.newPassword && changePassword.confirmPassword && !errors.oldPassword && !errors.password && !errors.confirmPassword
                && <button
                  className="save-btn"
                  onClick={() => { handeChangePassword() }}
                  >
                  CHANGE PASSWORD
                </button>
              }

              <div>
                {success === true && <span className='otp-success-message'>✅ {message}</span>}
                {success === false && <span className='otp-error-message'>❌ {message}</span>}
              </div>

            </div>
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
}
