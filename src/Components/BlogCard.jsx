import React, { useEffect, useState } from "react";
import { FaCalendarDay } from "react-icons/fa";
import "./BlogCard.css";
import axios from "axios";

export default function BlogCard() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get("http://localhost:9000/blogs");
                setBlogs(response.data);
                console.log("Blogs:", response.data);
            } catch (error) {
                console.error("Error fetching blogs:", error);
                setError("Failed to load blogs. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    if (loading) return <p className="loading">Loading blogs...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="blog-container">
            {blogs.length < 0 ? (
                blogs.map((blog) => {
                    // Construct the correct image path
                    const imagePath = `../assets/Blog/${blog.image}`;

                    return (
                        <div className="blog-card" key={blog.id}>
                            <div className="blog-image">
                                <img
                                    src={imagePath}
                                    alt={blog.title}
                                    loading="lazy"
                                    // onError={(e) => {
                                    //     e.target.src = "/assets/Blog/default.png"; // Fallback image
                                    // }}
                                />
                            </div>
                            <div className="blog-content">
                                <div className="blog-title">
                                    <h3>{blog.title}</h3>
                                </div>
                                <div className="blog-date">
                                    <span>
                                        <FaCalendarDay /> {blog.date}
                                    </span>
                                </div>
                                <div className="blog-description">
                                    <p>{blog.description}</p>
                                </div>
                                <div className="blog-readmore">
                                    <span>READ MORE {'>'}</span>
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <>
                <p className="no-blogs">No blogs available</p>
                <img src="/assets/Blog/040822102959" alt="No blogs available" />
                </>
            
            )}
        </div>
    );
}
