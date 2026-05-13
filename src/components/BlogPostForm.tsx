import { useState, useRef, useEffect, useCallback } from "react";
import { X, ImagePlus, Loader2, RotateCcw, Link as LinkIcon } from "lucide-react";
import type { BlogPostRow } from "../context/BlogContext";
import { useBlog } from "../context/BlogContext";

const MAX_WORDS = 500;
const DRAFT_STORAGE_KEY = "blog_post_draft";
const DRAFT_SAVE_DELAY = 1000; // ms debounce

type DraftData = {
    title: string;
    slug: string;
    excerpt: string;
    contentMarkdown: string;
    category: string;
    published: boolean;
    featured: boolean;
    heroImageUrl: string;
    author: string;
    editingPostId?: string;
    savedAt: number;
};

function countWords(text: string): number {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
}

function loadDraft(editingPostId?: string): DraftData | null {
    try {
        const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (!raw) return null;
        const draft: DraftData = JSON.parse(raw);
        // Only restore if the draft matches the same editing context
        // (new post → no editingPostId, edit → matching id)
        if (draft.editingPostId !== editingPostId) return null;
        return draft;
    } catch {
        return null;
    }
}

function clearDraft() {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
}

type BlogPostFormProps = {
    post?: BlogPostRow;
    onSubmit: (values: Omit<BlogPostRow, "id" | "created_at" | "updated_at" | "created_by" | "updated_by">, newImageFile: File | null) => Promise<void>;
    onClose: () => void;
};

export function BlogPostForm({ post, onSubmit, onClose }: BlogPostFormProps) {
    const { createPost, uploadHeroImage } = useBlog();
    const savedDraft = loadDraft(post?.id);
    const hasSavedDraft = !!savedDraft;

    const [title, setTitle] = useState(savedDraft?.title ?? post?.title ?? "");
    const [slug, setSlug] = useState(savedDraft?.slug ?? post?.slug ?? "");
    const [excerpt, setExcerpt] = useState(savedDraft?.excerpt ?? post?.excerpt ?? "");
    const [contentMarkdown, setContentMarkdown] = useState(savedDraft?.contentMarkdown ?? post?.content_markdown ?? "");
    const [category, setCategory] = useState<BlogPostRow["category"]>((savedDraft?.category as BlogPostRow["category"]) ?? post?.category ?? "Community");
    const [published, setPublished] = useState(savedDraft?.published ?? post?.published ?? false);
    const [featured, setFeatured] = useState(savedDraft?.featured ?? post?.featured ?? false);
    const [heroImageUrl, setHeroImageUrl] = useState(savedDraft?.heroImageUrl ?? post?.hero_image_url ?? "");
    const [author, setAuthor] = useState(savedDraft?.author ?? post?.author ?? "");
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(
        hasSavedDraft ? (savedDraft!.heroImageUrl || null) : (post?.hero_image_url || null)
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDraftBanner, setShowDraftBanner] = useState(hasSavedDraft);
    const [draftSavedMessage, setDraftSavedMessage] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [linkText, setLinkText] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [linkError, setLinkError] = useState<string | null>(null);
    const linkSelectionRef = useRef<{ start: number; end: number } | null>(null);
    const linkTextInputRef = useRef<HTMLInputElement>(null);
    const linkUrlInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // Auto-save draft to localStorage (debounced)
    const saveDraft = useCallback(() => {
        const draft: DraftData = {
            title,
            slug,
            excerpt,
            contentMarkdown,
            category,
            published,
            featured,
            heroImageUrl,
            author,
            editingPostId: post?.id,
            savedAt: Date.now(),
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }, [title, slug, excerpt, contentMarkdown, category, published, featured, heroImageUrl, author, post?.id]);

    useEffect(() => {
        // Don't auto-save if form is completely empty (just opened, no input yet)
        const hasContent = title || excerpt || contentMarkdown;
        if (!hasContent) return;

        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(saveDraft, DRAFT_SAVE_DELAY);
        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, [saveDraft]);

    const handleDiscardDraft = () => {
        clearDraft();
        setTitle(post?.title ?? "");
        setSlug(post?.slug ?? "");
        setExcerpt(post?.excerpt ?? "");
        setContentMarkdown(post?.content_markdown ?? "");
        setCategory(post?.category ?? "Community");
        setPublished(post?.published ?? false);
        setFeatured(post?.featured ?? false);
        setHeroImageUrl(post?.hero_image_url ?? "");
        setAuthor(post?.author ?? "");
        setImagePreview(post?.hero_image_url || null);
        setNewImageFile(null);
        setShowDraftBanner(false);
    };

    const handleSaveDraftManual = async () => {
        if (isSavingDraft) return;

        setIsSavingDraft(true);
        try {
            let imageUrl = heroImageUrl;

            // Upload image if there's a new file
            if (newImageFile) {
                imageUrl = await uploadHeroImage(newImageFile);
            }

            // Create draft post in database with published: false
            await createPost({
                title,
                slug,
                excerpt,
                content_markdown: contentMarkdown,
                category,
                published: false,
                featured,
                published_at: null,
                hero_image_url: imageUrl,
                author: author.trim() ? author.trim() : null,
            });

            // Clear localStorage draft since it's now in the database
            clearDraft();
            setShowDraftBanner(false);

            setDraftSavedMessage(true);
            setTimeout(() => setDraftSavedMessage(false), 3000);
        } catch (error) {
            console.error("Failed to save draft:", error);
            alert("Failed to save draft. Please try again.");
        } finally {
            setIsSavingDraft(false);
        }
    };

    // Open the link modal, pre-filling with any selected text in the textarea.
    const handleOpenLinkModal = () => {
        const textarea = contentTextareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = contentMarkdown.slice(start, end);

        linkSelectionRef.current = { start, end };
        setLinkText(selected);
        setLinkUrl("");
        setLinkError(null);
        setLinkModalOpen(true);
    };

    const handleCloseLinkModal = () => {
        setLinkModalOpen(false);
        setLinkError(null);
    };

    const handleConfirmLink = () => {
        const textarea = contentTextareaRef.current;
        const selection = linkSelectionRef.current;
        if (!textarea || !selection) return;

        const trimmedUrl = linkUrl.trim();
        const trimmedText = linkText.trim();

        if (!trimmedUrl) {
            setLinkError("Please enter a URL.");
            linkUrlInputRef.current?.focus();
            return;
        }
        if (!trimmedText) {
            setLinkError("Please enter the text to display.");
            linkTextInputRef.current?.focus();
            return;
        }

        const safeUrl = /^(https?:|mailto:|tel:|\/|#)/i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
        const markdown = `[${trimmedText}](${safeUrl})`;
        const { start, end } = selection;
        const next = contentMarkdown.slice(0, start) + markdown + contentMarkdown.slice(end);

        setContentMarkdown(next);
        setLinkModalOpen(false);
        setLinkError(null);

        requestAnimationFrame(() => {
            textarea.focus();
            const caret = start + markdown.length;
            textarea.setSelectionRange(caret, caret);
        });
    };

    // Auto-focus the appropriate field when the modal opens
    useEffect(() => {
        if (!linkModalOpen) return;
        const t = setTimeout(() => {
            if (linkText) {
                linkUrlInputRef.current?.focus();
            } else {
                linkTextInputRef.current?.focus();
            }
        }, 30);
        return () => clearTimeout(t);
    }, [linkModalOpen]);

    // Close on Escape
    useEffect(() => {
        if (!linkModalOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleCloseLinkModal();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [linkModalOpen]);

    // Auto-generate slug from title if it's a new post and slug is untouched
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (!post) {
            setSlug(
                newTitle
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)+/g, "")
            );
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewImageFile(file);
            setHeroImageUrl(""); // Will be replaced by upload
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClearImage = () => {
        setNewImageFile(null);
        setHeroImageUrl("");
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (countWords(contentMarkdown) > MAX_WORDS) return;

        setIsSubmitting(true);
        try {
            await onSubmit(
                {
                    title,
                    slug,
                    excerpt,
                    content_markdown: contentMarkdown,
                    category,
                    published,
                    featured,
                    published_at: published && !post?.published_at ? new Date().toISOString() : post?.published_at || null,
                    hero_image_url: heroImageUrl, // This might be overwritten if newImageFile exists
                    author: author.trim() ? author.trim() : null,
                },
                newImageFile
            );
            clearDraft(); // Clean up saved draft on successful submit
        } catch (error) {
            console.error("Failed to submit post:", error);
            // In a real app, you'd show a toast here
            alert("Failed to save post. Please check the slug is unique and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-full">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                    <h2 className="text-xl font-bold font-serif text-gray-900">
                        {post ? "Edit Post" : "New Post"}
                    </h2>
                    <button
                        onClick={() => { clearDraft(); onClose(); }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {showDraftBanner && (
                        <div className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm">
                            <RotateCcw className="w-4 h-4 shrink-0" />
                            <span className="flex-1">
                                <strong>Draft restored.</strong> Your unsaved changes from{" "}
                                {new Date(savedDraft!.savedAt).toLocaleString()} were recovered.
                            </span>
                            <button
                                type="button"
                                onClick={handleDiscardDraft}
                                className="text-xs font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2"
                            >
                                Discard draft
                            </button>
                        </div>
                    )}
                    <form id="blog-post-form" onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Title & Slug */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={handleTitleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. Summer Fête Returns"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL friendly)</label>
                                    <input
                                        type="text"
                                        required
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. summer-fete-returns"
                                    />
                                </div>
                            </div>

                            {/* Category & Status */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as BlogPostRow["category"])}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    >
                                        <option value="Community">Community</option>
                                        <option value="Events">Events</option>
                                        <option value="Nature">Nature</option>
                                        <option value="Heritage">Heritage</option>
                                    </select>
                                </div>
                                
                                <div className="flex flex-col justify-center pt-6">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={published}
                                            onChange={(e) => setPublished(e.target.checked)}
                                            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">Publish Post</span>
                                            <span className="text-xs text-gray-500">Make visible to public</span>
                                        </div>
                                    </label>
                                </div>

                                <div className="flex flex-col justify-center pt-6">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={featured}
                                            onChange={(e) => setFeatured(e.target.checked)}
                                            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">Featured</span>
                                            <span className="text-xs text-gray-500">Show larger on blog page</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image</label>
                                {imagePreview ? (
                                    <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group h-48 w-full sm:w-80">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={handleClearImage}
                                                className="bg-white text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors shadow-sm"
                                            >
                                                Remove Image
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center justify-center text-gray-500 h-48 w-full sm:w-80"
                                    >
                                        <ImagePlus className="w-8 h-8 mb-2 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700">Click to upload image</span>
                                        <span className="text-xs mt-1">PNG, JPG up to 5MB</span>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Author & Excerpt */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                                <input
                                    type="text"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. Jane Smith"
                                />
                                <p className="mt-1 text-xs text-gray-500">Optional. Shown on the article and in listings.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt (Short description)</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                                    placeholder="A brief summary of the article..."
                                />
                            </div>

                            {/* Post Content */}
                            <div className="flex flex-col flex-1 min-h-[400px]">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-gray-700">Content</label>
                                    <span className={`text-xs font-medium ${countWords(contentMarkdown) > MAX_WORDS ? 'text-red-600' : 'text-gray-400'}`}>
                                        {countWords(contentMarkdown)} / {MAX_WORDS} words
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 border border-b-0 border-gray-200 rounded-t-xl bg-gray-50">
                                    <button
                                        type="button"
                                        onClick={handleOpenLinkModal}
                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-colors"
                                        title="Insert hyperlink (select text first to turn it into a link)"
                                    >
                                        <LinkIcon className="w-3.5 h-3.5" />
                                        Insert link
                                    </button>
                                    <span className="text-xs text-gray-500">
                                        Select text first to turn it into a link.
                                    </span>
                                </div>
                                <textarea
                                    required
                                    ref={contentTextareaRef}
                                    value={contentMarkdown}
                                    onChange={(e) => setContentMarkdown(e.target.value)}
                                    className={`w-full flex-1 px-4 py-3 border rounded-b-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-y min-h-[400px] text-sm leading-relaxed ${countWords(contentMarkdown) > MAX_WORDS ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                    placeholder="Write your article content here... Use the Insert link button to add hyperlinks."
                                />
                                {countWords(contentMarkdown) > MAX_WORDS && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        Please reduce your content to {MAX_WORDS} words or fewer before saving.
                                    </p>
                                )}
                            </div>

                        </form>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl shrink-0">
                    <button
                        type="button"
                        onClick={() => { clearDraft(); onClose(); }}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <div className="flex items-center gap-2">
                        {!post && (
                            <button
                                type="button"
                                onClick={handleSaveDraftManual}
                                disabled={isSubmitting || isSavingDraft}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors disabled:opacity-70"
                            >
                                {isSavingDraft ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                                        Saving...
                                    </>
                                ) : draftSavedMessage ? (
                                    "✓ Draft saved"
                                ) : (
                                    "Save as draft"
                                )}
                            </button>
                        )}
                        {post && !post.published && (
                            <button
                                type="button"
                                onClick={async () => {
                                    setIsSubmitting(true);
                                    try {
                                        let imageUrl = heroImageUrl;
                                        if (newImageFile) {
                                            imageUrl = await uploadHeroImage(newImageFile);
                                        }
                                        await onSubmit(
                                            {
                                                title,
                                                slug,
                                                excerpt,
                                                content_markdown: contentMarkdown,
                                                category,
                                                published: true,
                                                featured,
                                                published_at: new Date().toISOString(),
                                                hero_image_url: imageUrl,
                                                author: author.trim() ? author.trim() : null,
                                            },
                                            null
                                        );
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                }}
                                disabled={isSubmitting || countWords(contentMarkdown) > MAX_WORDS}
                                className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all disabled:opacity-70"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Publishing...
                                    </>
                                ) : (
                                    "Publish Post"
                                )}
                            </button>
                        )}
                        <button
                            type="submit"
                            form="blog-post-form"
                            disabled={isSubmitting || countWords(contentMarkdown) > MAX_WORDS}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                post ? "Save Changes" : "Create Post"
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {linkModalOpen && (
                <div
                    className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="insert-link-title"
                        className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                                    <LinkIcon className="w-4 h-4" />
                                </div>
                                <h3 id="insert-link-title" className="text-lg font-bold font-serif text-gray-900">
                                    Insert link
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseLinkModal}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-4">
                            <div>
                                <label htmlFor="link-text" className="block text-sm font-medium text-gray-700 mb-1">
                                    Text to display
                                </label>
                                <input
                                    id="link-text"
                                    ref={linkTextInputRef}
                                    type="text"
                                    value={linkText}
                                    onChange={(e) => { setLinkText(e.target.value); setLinkError(null); }}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleConfirmLink(); } }}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. our village website"
                                />
                            </div>
                            <div>
                                <label htmlFor="link-url" className="block text-sm font-medium text-gray-700 mb-1">
                                    URL
                                </label>
                                <input
                                    id="link-url"
                                    ref={linkUrlInputRef}
                                    type="text"
                                    value={linkUrl}
                                    onChange={(e) => { setLinkUrl(e.target.value); setLinkError(null); }}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleConfirmLink(); } }}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    placeholder="https://example.com"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Tip: you can paste a full address or just <span className="font-mono">example.com</span> — we'll add <span className="font-mono">https://</span> for you.
                                </p>
                            </div>

                            {linkError && (
                                <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                                    {linkError}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={handleCloseLinkModal}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmLink}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors"
                            >
                                <LinkIcon className="w-4 h-4" />
                                Insert link
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
