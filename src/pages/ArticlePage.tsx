import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, ChevronRight } from "lucide-react";
import { blogPosts } from "../data/blogData";
import type { Category } from "../data/blogData";
import { Users, TreePine, Megaphone } from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";

const categoryIcons: Record<Exclude<Category, "All">, React.ReactNode> = {
    Community: <Users style={{ width: "16px", height: "16px" }} />,
    Events: <CalendarIcon style={{ width: "16px", height: "16px" }} />,
    Nature: <TreePine style={{ width: "16px", height: "16px" }} />,
    Heritage: <Megaphone style={{ width: "16px", height: "16px" }} />,
};

const categoryColorStyles: Record<Exclude<Category, "All">, React.CSSProperties> = {
    Community: { backgroundColor: "rgba(120, 80, 30, 0.1)", color: "#78501e", borderColor: "rgba(120, 80, 30, 0.2)" },
    Events: { backgroundColor: "rgba(107, 117, 100, 0.1)", color: "#5c6555", borderColor: "rgba(107, 117, 100, 0.2)" },
    Nature: { backgroundColor: "rgba(22, 101, 52, 0.1)", color: "#166534", borderColor: "rgba(22, 101, 52, 0.2)" },
    Heritage: { backgroundColor: "rgba(154, 80, 20, 0.1)", color: "#9a5014", borderColor: "rgba(154, 80, 20, 0.2)" },
};

export function ArticlePage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const currentIndex = blogPosts.findIndex((p) => p.slug === slug);
    const post = blogPosts[currentIndex];
    const nextPost = blogPosts[(currentIndex + 1) % blogPosts.length];
    const prevPost = blogPosts[(currentIndex - 1 + blogPosts.length) % blogPosts.length];

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8f7f4" }}>
                <div style={{ textAlign: "center" }}>
                    <h1
                        style={{
                            fontFamily: "var(--font-family-serif)",
                            fontSize: "2rem",
                            color: "#2d2d2d",
                            marginBottom: "16px",
                        }}
                    >
                        Article not found
                    </h1>
                    <p className="text-sm" style={{ color: "#666", marginBottom: "24px" }}>
                        The article you're looking for doesn't exist.
                    </p>
                    <Link
                        to="/blog"
                        className="inline-flex items-center rounded-lg text-sm"
                        style={{
                            gap: "8px",
                            padding: "12px 24px",
                            backgroundColor: "#5c6555",
                            color: "white",
                            fontWeight: 500,
                        }}
                    >
                        <ArrowLeft style={{ width: "16px", height: "16px" }} />
                        Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#f8f7f4" }}>
            {/* Hero Image */}
            <div className="relative overflow-hidden" style={{ height: "400px" }}>
                <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full"
                    style={{ objectFit: "cover" }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)",
                    }}
                />

                {/* Back Button Overlay */}
                <div
                    className="absolute"
                    style={{ top: "24px", left: "24px" }}
                >
                    <button
                        onClick={() => navigate("/blog")}
                        className="inline-flex items-center rounded-lg text-sm text-white"
                        style={{
                            gap: "8px",
                            padding: "10px 18px",
                            backgroundColor: "rgba(0,0,0,0.4)",
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.6)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.4)")}
                    >
                        <ArrowLeft style={{ width: "16px", height: "16px" }} />
                        Back to Blog
                    </button>
                </div>

                {/* Title Overlay */}
                <div
                    className="absolute"
                    style={{ bottom: "0", left: "0", right: "0", padding: "40px 24px 32px" }}
                >
                    <div className="mx-auto" style={{ maxWidth: "800px" }}>
                        {/* Breadcrumb */}
                        <div className="flex items-center mb-4" style={{ gap: "8px", fontSize: "13px" }}>
                            <Link to="/" className="text-white" style={{ opacity: 0.7 }}>Home</Link>
                            <ChevronRight className="text-white" style={{ opacity: 0.4, width: "12px", height: "12px" }} />
                            <Link to="/blog" className="text-white" style={{ opacity: 0.7 }}>Blog</Link>
                            <ChevronRight className="text-white" style={{ opacity: 0.4, width: "12px", height: "12px" }} />
                            <span className="text-white" style={{ opacity: 0.9 }}>{post.category}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Article Content */}
            <article className="mx-auto" style={{ maxWidth: "800px", padding: "48px 24px 64px" }}>
                {/* Meta Info */}
                <div className="flex items-center flex-wrap" style={{ gap: "16px", marginBottom: "24px" }}>
                    <span
                        className="inline-flex items-center rounded-full border"
                        style={{
                            ...categoryColorStyles[post.category],
                            gap: "6px",
                            padding: "4px 14px",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                        }}
                    >
                        {categoryIcons[post.category]}
                        {post.category}
                    </span>
                    <div className="flex items-center" style={{ gap: "16px", fontSize: "0.85rem", color: "#888" }}>
                        <span className="inline-flex items-center" style={{ gap: "6px" }}>
                            <Calendar style={{ width: "14px", height: "14px" }} />
                            {post.date}
                        </span>
                        <span className="inline-flex items-center" style={{ gap: "6px" }}>
                            <Clock style={{ width: "14px", height: "14px" }} />
                            {post.readTime}
                        </span>
                    </div>
                </div>

                {/* Title */}
                <h1
                    style={{
                        fontFamily: "var(--font-family-serif)",
                        fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                        lineHeight: 1.25,
                        fontWeight: 400,
                        color: "#2d2d2d",
                        marginBottom: "24px",
                    }}
                >
                    {post.title}
                </h1>

                {/* Excerpt / Lead */}
                <p
                    style={{
                        fontSize: "1.15rem",
                        lineHeight: 1.7,
                        color: "#555",
                        marginBottom: "32px",
                        fontWeight: 400,
                        borderLeft: "3px solid #8e9a87",
                        paddingLeft: "20px",
                    }}
                >
                    {post.excerpt}
                </p>

                {/* Divider */}
                <div style={{ height: "1px", backgroundColor: "#e5e5e0", marginBottom: "32px" }} />

                {/* Body Content */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {post.content.map((paragraph, i) => (
                        <p
                            key={i}
                            style={{
                                fontSize: "1.05rem",
                                lineHeight: 1.85,
                                color: "#444",
                            }}
                        >
                            {paragraph}
                        </p>
                    ))}
                </div>

                {/* Divider */}
                <div style={{ height: "1px", backgroundColor: "#e5e5e0", margin: "48px 0" }} />

                {/* Read Next Navigation */}
                <div>
                    <p
                        style={{
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "#8e9a87",
                            marginBottom: "20px",
                        }}
                    >
                        Continue Reading
                    </p>

                    <div
                        className="grid"
                        style={{
                            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: "20px",
                        }}
                    >
                        {/* Previous Article */}
                        <Link
                            to={`/blog/${prevPost.slug}`}
                            className="flex rounded-xl overflow-hidden"
                            style={{
                                backgroundColor: "white",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                                padding: "16px",
                                gap: "16px",
                                textDecoration: "none",
                                transition: "box-shadow 0.2s, transform 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                                e.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                        >
                            <div
                                className="rounded-lg overflow-hidden flex-shrink-0"
                                style={{ width: "80px", height: "80px" }}
                            >
                                <img
                                    src={prevPost.image}
                                    alt={prevPost.title}
                                    className="w-full h-full"
                                    style={{ objectFit: "cover" }}
                                />
                            </div>
                            <div className="flex flex-col justify-between" style={{ minWidth: 0 }}>
                                <div>
                                    <p style={{ fontSize: "0.7rem", color: "#8e9a87", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>
                                        ← Previous
                                    </p>
                                    <h4
                                        style={{
                                            fontFamily: "var(--font-family-serif)",
                                            fontSize: "0.9rem",
                                            lineHeight: 1.35,
                                            fontWeight: 400,
                                            color: "#2d2d2d",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {prevPost.title}
                                    </h4>
                                </div>
                            </div>
                        </Link>

                        {/* Next Article */}
                        <Link
                            to={`/blog/${nextPost.slug}`}
                            className="flex rounded-xl overflow-hidden"
                            style={{
                                backgroundColor: "#5c6555",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                                padding: "16px",
                                gap: "16px",
                                textDecoration: "none",
                                transition: "box-shadow 0.2s, transform 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
                                e.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.1)";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                        >
                            <div className="flex flex-col justify-between flex-1" style={{ minWidth: 0 }}>
                                <div>
                                    <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>
                                        Read Next →
                                    </p>
                                    <h4
                                        style={{
                                            fontFamily: "var(--font-family-serif)",
                                            fontSize: "0.9rem",
                                            lineHeight: 1.35,
                                            fontWeight: 400,
                                            color: "white",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {nextPost.title}
                                    </h4>
                                </div>
                            </div>
                            <div
                                className="rounded-lg overflow-hidden flex-shrink-0"
                                style={{ width: "80px", height: "80px" }}
                            >
                                <img
                                    src={nextPost.image}
                                    alt={nextPost.title}
                                    className="w-full h-full"
                                    style={{ objectFit: "cover" }}
                                />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Back to all articles link */}
                <div style={{ textAlign: "center", marginTop: "48px" }}>
                    <Link
                        to="/blog"
                        className="inline-flex items-center text-sm"
                        style={{
                            gap: "8px",
                            color: "#5c6555",
                            fontWeight: 500,
                        }}
                    >
                        <ArrowLeft style={{ width: "16px", height: "16px" }} />
                        View all articles
                    </Link>
                </div>
            </article>
        </div>
    );
}
