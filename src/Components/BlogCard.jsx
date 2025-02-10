import React, { useEffect, useState } from "react";
import { FaCalendarDay } from "react-icons/fa";
import "./BlogCard.css";
import axios from "axios";

// Dynamically import all images from the 'assets/Blog' folder
const importAll = (r) => {
    let images = {};
    r.keys().forEach((item) => {
        images[item.replace("./", "")] = r(item);
    });
    return images;
};

// Load all images from 'src/assets/Blog/'
const imageMap = importAll(require.context("../assets/Blog", false, /\.(png|jpe?g|svg)$/));

export default function BlogCard() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get("http://localhost:9000/blogs");
                setBlogs(response.data);
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
            {blogs.length > 0 ? (
                blogs.map((blog) => {
                    // Get image source from imageMap, fallback to default
                    const imageSrc = imageMap[blog.image_url] || imageMap["default.png"];

                    return (
                        <div className="blog-card" key={blog.id}>
                            <div className="blog-image">
                                <img 
                                    src={imageSrc} 
                                    alt={blog.title} 
                                    loading="lazy"
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
                <div className="no-blogs">
                    <p>No blogs available</p>
                    <img src={imageMap["default.png"]} alt="No blogs available" />
                </div>
            )}
        </div>
    );
}
