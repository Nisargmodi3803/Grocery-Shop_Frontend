import React, { useEffect, useState } from "react";
import { FaCalendarDay } from "react-icons/fa";
import "./BlogCard.css";
import axios from "axios";
import { useLoading } from "../Context/LoadingContext";
import { useNavigate } from "react-router-dom";

const importAll = (r) => {
    let images = {};
    r.keys().forEach((item) => {
        images[item.replace("./", "")] = r(item);
    });
    return images;
};

const imageMap = importAll(require.context("../assets/Blog", false, /\.(png|jpe?g|svg)$/));

export default function BlogCard() {
    const { loading, setLoading } = useLoading(); // Use the loading context
    const [blogs, setBlogs] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true); // Start loading before fetching
            try {
                const response = await axios.get("http://localhost:9000/blogs");
                if (response.status === 200) {
                    setBlogs(response.data);
                }
            } catch (error) {
                if (error.response.status === 404) {
                    console.log("No Blogs Found");
                } else {
                    console.error("Error fetching blogs:", error);
                    setError("Failed to load blogs. Please try again later.");
                }
            } finally {
                setLoading(false); // Stop loading after fetching
            }
        };
        fetchBlogs();
    }, [setLoading]);

    if (error) return <p className="error">{error}</p>;

    return (
        <div className="blog-container">
            {loading ? (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                </div>
            ) : blogs.length > 0 ? (
                blogs.map((blog) => {
                    const imageSrc = imageMap[blog.image_url] || `http://localhost:9000/uploads/${blog.image_url}` || imageMap["default.png"] ;
                    return (
                        <div className="blog-card" key={blog.id}>
                            <div className="blog-image">
                                <img
                                    src={imageSrc}
                                    alt={blog.title}
                                    loading="lazy"
                                    onClick={() => {
                                        navigate(`/ecommerce/blog/${blog.slug_title}`);
                                        // window.location.reload();
                                    }}
                                />
                            </div>
                            <div className="blog-content">
                                <div
                                    className="blog-title"
                                    onClick={() => {
                                        navigate(`/ecommerce/blog/${blog.slug_title}`);
                                        // window.location.reload();
                                    }}
                                >
                                    <h3>{blog.title}</h3>
                                </div>
                                <div
                                    className="blog-date"
                                    onClick={() => {
                                        navigate(`/ecommerce/blog/${blog.slug_title}`);
                                        // window.location.reload();
                                    }}>
                                    <span>
                                        <FaCalendarDay /> {blog.date}
                                    </span>
                                </div>
                                <div className="blog-description">
                                    <p>{blog.description}</p>
                                </div>
                                <div className="blog-readmore">
                                    <span
                                        onClick={() => {
                                            navigate(`/ecommerce/blog/${blog.slug_title}`);
                                            // window.location.reload();
                                        }}
                                    >READ MORE {'>'}</span>
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="no-blogs">
                    <p>No blogs available</p>
                    <img src={imageMap["default.png"]} alt="No blogs available" />
                </div>
            )}
        </div>
    );
}
