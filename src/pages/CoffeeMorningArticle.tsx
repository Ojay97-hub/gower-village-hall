import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, ChevronRight, Loader2, Heart, Coffee } from "lucide-react";
import { useCoffeeMorning } from "../context/CoffeeMorningContext";
import cakeMorningSummer from "../assets/cake-morning-summer.webp";

export function CoffeeMorningArticle() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { updates, loading } = useCoffeeMorning();

    const getReadTime = (content: string) => {
        const words = content.trim().split(/\s+/).length;
        const mins = Math.ceil(words / 200);
        return `${mins} min read`;
    };

    const formatDate = (isoString: string | null) => {
        if (!isoString) return "";
        return new Date(isoString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading && updates.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    const currentIndex = updates.findIndex(u => u.slug === slug);
    const post = updates[currentIndex];
    const nextPost = updates.length > 1 && currentIndex !== -1 ? updates[(currentIndex + 1) % updates.length] : null;
    const prevPost = updates.length > 1 && currentIndex !== -1 ? updates[(currentIndex - 1 + updates.length) % updates.length] : null;

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8f7f4" }}>
                <div style={{ textAlign: "center" }}>
                    <h1 style={{ fontFamily: "var(--font-family-serif)", fontSize: "2rem", color: "#2d2d2d", marginBottom: "16px" }}>
                        Update not found
                    </h1>
                    <p className="text-sm" style={{ color: "#666", marginBottom: "24px" }}>
                        The update you're looking for doesn't exist.
                    </p>
                    <Link
                        to="/hall/coffee-morning"
                        className="inline-flex items-center rounded-lg text-sm"
                        style={{ gap: "8px", padding: "12px 24px", backgroundColor: "#5c6555", color: "white", fontWeight: 500 }}
                    >
                        <ArrowLeft style={{ width: "16px", height: "16px" }} />
                        Back to Coffee Morning
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#f8f7f4" }}>
            <div className="relative overflow-hidden bg-gray-100" style={{ height: "400px" }}>
                <img
                    src={post.hero_image_url || cakeMorningSummer}
                    alt={post.title}
                    className="w-full h-full"
                    style={{ objectFit: "cover" }}
                />
                <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)" }}
                />

                <div className="absolute" style={{ top: "24px", left: "24px" }}>
                    <button
                        onClick={() => navigate("/hall/coffee-morning")}
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
                        Back to Coffee Morning
                    </button>
                </div>

                <div className="absolute" style={{ bottom: "0", left: "0", right: "0", padding: "40px 24px 32px" }}>
                    <div className="mx-auto" style={{ maxWidth: "800px" }}>
                        <div className="flex items-center mb-4" style={{ gap: "8px", fontSize: "13px" }}>
                            <Link to="/" className="text-white" style={{ opacity: 0.7 }}>Home</Link>
                            <ChevronRight className="text-white" style={{ opacity: 0.4, width: "12px", height: "12px" }} />
                            <Link to="/hall" className="text-white" style={{ opacity: 0.7 }}>Hall</Link>
                            <ChevronRight className="text-white" style={{ opacity: 0.4, width: "12px", height: "12px" }} />
                            <Link to="/hall/coffee-morning" className="text-white" style={{ opacity: 0.7 }}>Coffee Morning</Link>
                        </div>
                    </div>
                </div>
            </div>

            <article className="mx-auto" style={{ maxWidth: "800px", padding: "48px 24px 64px" }}>
                <div className="flex items-center flex-wrap" style={{ gap: "16px", marginBottom: "24px" }}>
                    <span
                        className="inline-flex items-center rounded-full border"
                        style={{
                            backgroundColor: "rgba(107, 117, 100, 0.1)",
                            color: "#5c6555",
                            borderColor: "rgba(107, 117, 100, 0.2)",
                            gap: "6px",
                            padding: "4px 14px",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                        }}
                    >
                        <Coffee style={{ width: "14px", height: "14px" }} />
                        Coffee Morning
                    </span>
                    <div className="flex items-center" style={{ gap: "16px", fontSize: "0.85rem", color: "#888" }}>
                        {post.event_date && (
                            <span className="inline-flex items-center" style={{ gap: "6px" }}>
                                <Calendar style={{ width: "14px", height: "14px" }} />
                                {formatDate(post.event_date)}
                            </span>
                        )}
                        <span className="inline-flex items-center" style={{ gap: "6px" }}>
                            <Clock style={{ width: "14px", height: "14px" }} />
                            {getReadTime(post.content_markdown)}
                        </span>
                        {!post.published && (
                            <span className="inline-flex items-center bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold">
                                DRAFT
                            </span>
                        )}
                    </div>
                </div>

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

                {(post.fundraising_for || post.amount_raised != null) && (
                    <div
                        className="rounded-2xl flex items-start gap-4"
                        style={{
                            backgroundColor: "rgba(107, 117, 100, 0.08)",
                            border: "1px solid rgba(107, 117, 100, 0.18)",
                            padding: "20px 24px",
                            marginBottom: "32px",
                        }}
                    >
                        <div
                            className="rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ width: "44px", height: "44px", backgroundColor: "white" }}
                        >
                            <Heart style={{ width: "20px", height: "20px", color: "#5c6555" }} />
                        </div>
                        <div>
                            {post.fundraising_for && (
                                <p style={{ fontSize: "0.75rem", color: "#5c6555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                                    Raising money for
                                </p>
                            )}
                            <p style={{ fontFamily: "var(--font-family-serif)", fontSize: "1.15rem", color: "#2d2d2d", fontWeight: 500, marginBottom: post.amount_raised != null ? "4px" : 0 }}>
                                {post.fundraising_for || "Community fundraiser"}
                            </p>
                            {post.amount_raised != null && (
                                <p style={{ fontSize: "0.95rem", color: "#5c6555", fontWeight: 600 }}>
                                    £{Number(post.amount_raised).toFixed(2)} raised
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div style={{ height: "1px", backgroundColor: "#e5e5e0", marginBottom: "32px" }} />

                <div style={{ display: "flex", flexDirection: "column", gap: "20px", color: "#444" }}>
                    {post.content_markdown.split(/\n\n+/).map((paragraph, i) => (
                        <p key={i} style={{ fontSize: "1.125rem", lineHeight: "1.75", whiteSpace: "pre-wrap" }}>
                            {paragraph}
                        </p>
                    ))}
                </div>

                <div style={{ height: "1px", backgroundColor: "#e5e5e0", margin: "48px 0" }} />

                {(prevPost || nextPost) && (
                    <div>
                        <p style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8e9a87", marginBottom: "20px" }}>
                            More Updates
                        </p>

                        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                            {prevPost && (
                                <Link
                                    to={`/hall/coffee-morning/${prevPost.slug}`}
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
                                    <div className="rounded-lg overflow-hidden flex-shrink-0 bg-gray-100" style={{ width: "80px", height: "80px" }}>
                                        <img
                                            src={prevPost.hero_image_url || cakeMorningSummer}
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
                            )}

                            {nextPost && (
                                <Link
                                    to={`/hall/coffee-morning/${nextPost.slug}`}
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
                                    <div className="rounded-lg overflow-hidden flex-shrink-0 bg-gray-100" style={{ width: "80px", height: "80px" }}>
                                        <img
                                            src={nextPost.hero_image_url || cakeMorningSummer}
                                            alt={nextPost.title}
                                            className="w-full h-full"
                                            style={{ objectFit: "cover" }}
                                        />
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                <div style={{ textAlign: "center", marginTop: "48px" }}>
                    <Link
                        to="/hall/coffee-morning"
                        className="inline-flex items-center text-sm"
                        style={{ gap: "8px", color: "#5c6555", fontWeight: 500 }}
                    >
                        <ArrowLeft style={{ width: "16px", height: "16px" }} />
                        Back to Coffee Morning
                    </Link>
                </div>
            </article>
        </div>
    );
}
