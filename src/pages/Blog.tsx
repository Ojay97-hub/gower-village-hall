import { useState } from "react";
import { Search, Calendar, TreePine, Users, Megaphone, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import hallGateSunny from "../assets/hall-gate-entrance.jpg";
import { blogPosts, categories } from "../data/blogData";
import type { Category } from "../data/blogData";

const categoryIcons: Record<Exclude<Category, "All">, React.ReactNode> = {
    Community: <Users style={{ width: "16px", height: "16px" }} />,
    Events: <Calendar style={{ width: "16px", height: "16px" }} />,
    Nature: <TreePine style={{ width: "16px", height: "16px" }} />,
    Heritage: <Megaphone style={{ width: "16px", height: "16px" }} />,
};

const categoryColorStyles: Record<Exclude<Category, "All">, React.CSSProperties> = {
    Community: { backgroundColor: "rgba(120, 80, 30, 0.1)", color: "#78501e", borderColor: "rgba(120, 80, 30, 0.2)" },
    Events: { backgroundColor: "rgba(107, 117, 100, 0.1)", color: "#5c6555", borderColor: "rgba(107, 117, 100, 0.2)" },
    Nature: { backgroundColor: "rgba(22, 101, 52, 0.1)", color: "#166534", borderColor: "rgba(22, 101, 52, 0.2)" },
    Heritage: { backgroundColor: "rgba(154, 80, 20, 0.1)", color: "#9a5014", borderColor: "rgba(154, 80, 20, 0.2)" },
};

function CategoryBadge({ category, size = "sm" }: { category: Exclude<Category, "All">; size?: "sm" | "md" }) {
    return (
        <span
            className="inline-flex items-center rounded-full border"
            style={{
                ...categoryColorStyles[category],
                gap: size === "md" ? "6px" : "4px",
                padding: size === "md" ? "4px 12px" : "2px 10px",
                fontSize: "0.75rem",
                fontWeight: 500,
            }}
        >
            {categoryIcons[category]}
            {category}
        </span>
    );
}

export function Blog() {
    const [activeCategory, setActiveCategory] = useState<Category>("All");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredPosts = blogPosts.filter((post) => {
        const matchesCategory = activeCategory === "All" || post.category === activeCategory;
        const matchesSearch =
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const featuredPost = filteredPosts[0];
    const sidePosts = filteredPosts.slice(1, 4);
    const remainingPosts = filteredPosts.slice(4);

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#f8f7f4" }}>
            {/* Embedded responsive styles */}
            <style>{`
        @media (min-width: 1024px) {
          .blog-popular-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (min-width: 640px) {
          .blog-hero-content,
          .blog-section {
            padding-left: 24px !important;
            padding-right: 24px !important;
          }
        }
        @media (min-width: 1024px) {
          .blog-hero-content,
          .blog-section {
            padding-left: 32px !important;
            padding-right: 32px !important;
          }
        }
      `}</style>

            {/* Hero Section */}
            <section className="relative overflow-hidden" style={{ minHeight: "480px" }}>
                <div className="absolute inset-0">
                    <img
                        src={hallGateSunny}
                        alt="Gower village landscape"
                        className="w-full h-full"
                        style={{ objectFit: "cover" }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background: "linear-gradient(135deg, rgba(92,101,85,0.92) 0%, rgba(107,117,100,0.85) 40%, rgba(92,101,85,0.75) 100%)",
                        }}
                    />
                </div>

                <div
                    className="relative mx-auto blog-hero-content"
                    style={{ maxWidth: "80rem", paddingTop: "80px", paddingBottom: "80px", paddingLeft: "16px", paddingRight: "16px" }}
                >
                    <div className="flex items-center mb-6" style={{ gap: "8px", fontSize: "14px" }}>
                        <Link to="/" className="text-white" style={{ opacity: 0.7 }}>Home</Link>
                        <ChevronRight className="text-white" style={{ opacity: 0.5, width: "14px", height: "14px" }} />
                        <span className="text-white">Blog</span>
                    </div>

                    <h1
                        style={{
                            fontFamily: "var(--font-family-serif)",
                            fontSize: "clamp(2rem, 4vw, 3.25rem)",
                            lineHeight: 1.15,
                            fontWeight: 400,
                            color: "white",
                            maxWidth: "680px",
                            marginBottom: "32px",
                        }}
                    >
                        Village News &amp; Stories. Keeping Our Community Connected.
                    </h1>

                    <div className="flex items-center" style={{ maxWidth: "520px", gap: "16px" }}>
                        <div
                            className="flex items-center flex-1 rounded-lg overflow-hidden"
                            style={{
                                backgroundColor: "rgba(255,255,255,0.15)",
                                backdropFilter: "blur(12px)",
                                border: "1px solid rgba(255,255,255,0.2)",
                            }}
                        >
                            <Search className="text-white" style={{ opacity: 0.6, flexShrink: 0, marginLeft: "16px", width: "16px", height: "16px" }} />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full text-sm text-white"
                                style={{
                                    background: "transparent",
                                    outline: "none",
                                    border: "none",
                                    padding: "12px",
                                }}
                            />
                        </div>
                        <button
                            className="text-sm rounded-lg"
                            style={{
                                fontWeight: 600,
                                backgroundColor: "white",
                                color: "#5c6555",
                                padding: "12px 20px",
                                transition: "opacity 0.15s",
                            }}
                        >
                            Search
                        </button>
                    </div>

                    <div className="flex flex-wrap" style={{ marginTop: "32px", gap: "8px" }}>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className="rounded-full text-sm"
                                style={{
                                    fontWeight: 500,
                                    padding: "8px 16px",
                                    backgroundColor: activeCategory === cat ? "white" : "rgba(255,255,255,0.12)",
                                    color: activeCategory === cat ? "#5c6555" : "white",
                                    border: activeCategory === cat ? "1px solid white" : "1px solid rgba(255,255,255,0.2)",
                                    transition: "all 0.2s",
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Articles Section */}
            {filteredPosts.length > 0 ? (
                <section
                    className="mx-auto blog-section"
                    style={{ maxWidth: "80rem", paddingTop: "64px", paddingBottom: "40px", paddingLeft: "16px", paddingRight: "16px" }}
                >
                    <p
                        className="text-sm"
                        style={{
                            color: "#8e9a87",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            marginBottom: "8px",
                        }}
                    >
                        What&apos;s New
                    </p>
                    <h2
                        style={{
                            fontFamily: "var(--font-family-serif)",
                            fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                            fontWeight: 400,
                            color: "#2d2d2d",
                            marginBottom: "40px",
                        }}
                    >
                        Popular Articles
                    </h2>

                    <div
                        className="grid blog-popular-grid"
                        style={{
                            gridTemplateColumns: "1fr",
                            gap: "32px",
                        }}
                    >
                        {featuredPost && (
                            <Link
                                to={`/blog/${featuredPost.slug}`}
                                className="rounded-2xl overflow-hidden block"
                                style={{
                                    backgroundColor: "white",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                                    cursor: "pointer",
                                    textDecoration: "none",
                                    transition: "box-shadow 0.3s, transform 0.3s",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
                                    e.currentTarget.style.transform = "translateY(-4px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                <div className="relative overflow-hidden" style={{ height: "340px" }}>
                                    <img
                                        src={featuredPost.image}
                                        alt={featuredPost.title}
                                        className="w-full h-full"
                                        style={{
                                            objectFit: "cover",
                                            transition: "transform 0.5s ease",
                                        }}
                                    />
                                </div>
                                <div style={{ padding: "28px" }}>
                                    <h3
                                        style={{
                                            fontFamily: "var(--font-family-serif)",
                                            fontSize: "1.35rem",
                                            lineHeight: 1.35,
                                            fontWeight: 400,
                                            color: "#2d2d2d",
                                            marginBottom: "12px",
                                        }}
                                    >
                                        {featuredPost.title}
                                    </h3>
                                    <p className="text-sm" style={{ color: "#666", lineHeight: 1.65, marginBottom: "16px" }}>
                                        {featuredPost.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <CategoryBadge category={featuredPost.category} size="md" />
                                        <span style={{ fontSize: "0.75rem", color: "#999" }}>{featuredPost.date}</span>
                                    </div>
                                </div>
                            </Link>
                        )}

                        <div className="flex flex-col" style={{ gap: "24px" }}>
                            {sidePosts.map((post) => (
                                <Link
                                    key={post.id}
                                    to={`/blog/${post.slug}`}
                                    className="flex rounded-xl overflow-hidden"
                                    style={{
                                        backgroundColor: "white",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                                        cursor: "pointer",
                                        padding: "16px",
                                        gap: "20px",
                                        textDecoration: "none",
                                        transition: "box-shadow 0.3s, transform 0.3s",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    <div
                                        className="rounded-lg overflow-hidden flex-shrink-0"
                                        style={{ width: "140px", height: "120px" }}
                                    >
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full"
                                            style={{ objectFit: "cover" }}
                                        />
                                    </div>
                                    <div className="flex flex-col justify-between flex-1" style={{ minWidth: 0 }}>
                                        <div>
                                            <h3
                                                style={{
                                                    fontFamily: "var(--font-family-serif)",
                                                    fontSize: "1rem",
                                                    lineHeight: 1.4,
                                                    fontWeight: 400,
                                                    color: "#2d2d2d",
                                                    marginBottom: "8px",
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {post.title}
                                            </h3>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "#666",
                                                    lineHeight: 1.55,
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {post.excerpt}
                                            </p>
                                        </div>
                                        <div className="flex items-center" style={{ marginTop: "8px", gap: "12px" }}>
                                            <CategoryBadge category={post.category} />
                                            <span style={{ fontSize: "0.75rem", color: "#999" }}>
                                                {post.readTime}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            ) : (
                <section className="mx-auto" style={{ maxWidth: "80rem", padding: "80px 16px", textAlign: "center" }}>
                    <Search className="mx-auto mb-4" style={{ width: "48px", height: "48px", color: "#ccc" }} />
                    <h2
                        style={{
                            fontFamily: "var(--font-family-serif)",
                            fontSize: "1.5rem",
                            color: "#666",
                            marginBottom: "8px",
                        }}
                    >
                        No articles found
                    </h2>
                    <p className="text-sm" style={{ color: "#999" }}>
                        Try adjusting your search or category filter.
                    </p>
                </section>
            )}

            {/* All Articles Grid */}
            {remainingPosts.length > 0 && (
                <section
                    className="mx-auto blog-section"
                    style={{ maxWidth: "80rem", paddingTop: "20px", paddingBottom: "80px", paddingLeft: "16px", paddingRight: "16px" }}
                >
                    <h2
                        style={{
                            fontFamily: "var(--font-family-serif)",
                            fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
                            fontWeight: 400,
                            color: "#2d2d2d",
                            marginBottom: "32px",
                        }}
                    >
                        More Stories
                    </h2>

                    <div
                        className="grid"
                        style={{
                            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                            gap: "24px",
                        }}
                    >
                        {remainingPosts.map((post) => (
                            <Link
                                key={post.id}
                                to={`/blog/${post.slug}`}
                                className="rounded-xl overflow-hidden block"
                                style={{
                                    backgroundColor: "white",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                                    cursor: "pointer",
                                    textDecoration: "none",
                                    transition: "box-shadow 0.3s, transform 0.3s",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)";
                                    e.currentTarget.style.transform = "translateY(-4px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                <div className="relative overflow-hidden" style={{ height: "200px" }}>
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full"
                                        style={{
                                            objectFit: "cover",
                                            transition: "transform 0.5s ease",
                                        }}
                                    />
                                </div>
                                <div style={{ padding: "20px" }}>
                                    <h3
                                        style={{
                                            fontFamily: "var(--font-family-serif)",
                                            fontSize: "1rem",
                                            lineHeight: 1.4,
                                            fontWeight: 400,
                                            color: "#2d2d2d",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        {post.title}
                                    </h3>
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "#666",
                                            lineHeight: 1.55,
                                            marginBottom: "14px",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <CategoryBadge category={post.category} />
                                        <div className="flex items-center" style={{ gap: "8px" }}>
                                            <span style={{ fontSize: "0.75rem", color: "#999" }}>{post.date}</span>
                                            <span style={{ fontSize: "0.75rem", color: "#ccc" }}>·</span>
                                            <span style={{ fontSize: "0.75rem", color: "#999" }}>{post.readTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
