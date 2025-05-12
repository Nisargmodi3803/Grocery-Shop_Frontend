import './MyPoints.css'
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
import Swal from 'sweetalert2';

const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => {
    images[item.replace("./", "")] = r(item);
  });
  return images;
};

const imageMap = importAll(require.context("../assets/Customer", false, /\.(png|jpeg|svg|jpg|JPEG|JPG)$/));


export const MyPoints = () => {
  const [customer, setCustomer] = useState({});
  const [image, setImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hovered, setHovered] = useState(false); // For handling hover state
  const [file, setFile] = useState(null); // To hold the selected file
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const [points, setPoints] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const totalPages = Math.ceil(points.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedPoints = points.slice(startIndex, endIndex);
  const maxPageNumbersToShow = 4;
  const startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);
  const [showResult, setShowResult] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [Count, setCount] = useState(0);

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const fetchPoints = async () => {
    try {
      const response = await axios.get(`http://localhost:9000/points/${sessionStorage.getItem("customerEmail")}`);
      if (response.status === 200) {
        setPoints(response.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("No Points Found");
      } else {
        console.error(error);
        alert("Something went wrong. Please try again!");
      }
    }
  };


  const formatDateOnly = (dateTimeString) => {
    if (!dateTimeString) return "Invalid Date";
    const date = new Date(dateTimeString);

    if (isNaN(date.getTime())) return "Invalid Date";

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" }); // Full month name
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
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
    fetchPoints();
  }, []);

  useEffect(() => {
    if (!sessionStorage.getItem("isAuthenticated")) {
      navigate("/ecommerce/");
    }
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
      if (image !== "default.png") {
        try {
          setLoading(true); // Show loading state
          Swal.fire({
            title: "Deleting...",
            text: "Please wait while we delete your profile image.",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          const response = await axios.patch(
            `http://localhost:9000/delete-profile-image/${sessionStorage.getItem("customerEmail")}`
          );

          if (response.status === 200) {
            setImage("default.png"); // Update the image after deletion
            Swal.fire("Deleted!", "Your profile image has been deleted.", "success");
          }
        } catch (error) {
          if (error.response?.status === 404) {
            Swal.fire("Error", "Customer not found.", "error");
          } else {
            Swal.fire("Error", "Something went wrong. Please try again!", "error");
          }
        } finally {
          setLoading(false); // Hide loading state
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
      // window.location.reload();
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };
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
            <li onClick={() => {
              navigate('/ecommerce/my-profile');
              // window.location.reload();
            }}><IoPersonOutline /> My Profile</li>

            <li onClick={() => {
              navigate('/ecommerce/change-password');
              // window.location.reload();
            }}><TbPasswordUser /> Change Password</li>

            <li onClick={() => {
              navigate('/ecommerce/my-wishlist');
              // window.location.reload();
            }}><FaRegHeart /> My Wishlist</li>

            <li onClick={() => {
              navigate('/ecommerce/my-orders');
              // window.location.reload();
            }}><CiCircleList /> Order List</li>

            <li onClick={() => {
              navigate('/ecommerce/refer-and-earn');
              // window.location.reload();
            }}><MdCurrencyRupee /> Refer & Earn</li>

            <li onClick={() => {
              navigate('/ecommerce/coupon-code');
              // window.location.reload();
            }}><RiCouponLine /> Coupon Code</li>

            <li className='active' onClick={() => {
              navigate('/ecommerce/my-ecommerce');
              // window.location.reload();
            }}><BsCreditCard2Back /> My Ecommerce</li>

            <li onClick={handleLogout}><MdLock /> Logout</li>
          </ul>
        </div>

        <div className='my-profile-section'>
          <div className='my-profile-section-header'>
            <h1>Points History</h1>
          </div>
          <div className='my-profile-section-body'>
            <div className='profile-detail'>
              <table className="brand-table">
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>Date</th>
                    <th>Points</th>
                    <th className="description">Remark</th>
                    <th>In/Out</th>
                    <th>Available Points</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPoints.map((points, index) => {
                    return (
                      <tr key={points.id} >
                        <td>{startIndex + index + 1}</td>
                        <td>
                          {formatDateOnly(points.c_date)}
                        </td>
                        <td>{points.customerPoint}</td>
                        <td className="description">{points.customerPointDetail}</td>
                        <td>{points.customerPointInOut === 1 ? "In" : "Out"}</td>
                        <td>{points.customerAvailablePoint}</td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          </div>


          {paginatedPoints.length > 0 && (

            <div className="pagination">
              <span>Showing {startIndex + 1} to {Math.min(endIndex, points.length)} of {points.length} entries</span>

              <button onClick={() => handlePageClick(currentPage - 1)} disabled={currentPage === 1}>
                &lt;
              </button>

              {Array.from({ length: endPage - startPage + 1 }, (_, index) => (
                <button
                  key={startPage + index}
                  className={currentPage === startPage + index ? "active" : ""}
                  onClick={() => handlePageClick(startPage + index)}
                >
                  {startPage + index}
                </button>
              ))}

              <button onClick={() => handlePageClick(currentPage + 1)} disabled={currentPage === totalPages}>
                &gt;
              </button>
            </div>
          )}
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

