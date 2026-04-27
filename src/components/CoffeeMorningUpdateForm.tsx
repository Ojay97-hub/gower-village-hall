import { useState, useRef } from "react";
import { X, ImagePlus, Loader2 } from "lucide-react";
import type { CoffeeMorningUpdate } from "../context/CoffeeMorningContext";

const MAX_WORDS = 500;

function countWords(text: string): number {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
}

type Props = {
    update?: CoffeeMorningUpdate;
    onSubmit: (
        values: Omit<CoffeeMorningUpdate, "id" | "created_at" | "updated_at" | "created_by" | "updated_by">,
        newImageFile: File | null
    ) => Promise<void>;
    onClose: () => void;
};

export function CoffeeMorningUpdateForm({ update, onSubmit, onClose }: Props) {
    const [title, setTitle] = useState(update?.title || "");
    const [slug, setSlug] = useState(update?.slug || "");
    const [excerpt, setExcerpt] = useState(update?.excerpt || "");
    const [contentMarkdown, setContentMarkdown] = useState(update?.content_markdown || "");
    const [eventDate, setEventDate] = useState(update?.event_date || "");
    const [fundraisingFor, setFundraisingFor] = useState(update?.fundraising_for || "");
    const [amountRaised, setAmountRaised] = useState<string>(
        update?.amount_raised != null ? String(update.amount_raised) : ""
    );
    const [published, setPublished] = useState(update?.published || false);
    const [heroImageUrl, setHeroImageUrl] = useState(update?.hero_image_url || "");
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(update?.hero_image_url || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (!update) {
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
            setHeroImageUrl("");
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleClearImage = () => {
        setNewImageFile(null);
        setHeroImageUrl("");
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (countWords(contentMarkdown) > MAX_WORDS) return;

        setIsSubmitting(true);
        try {
            const parsedAmount = amountRaised.trim() === "" ? null : Number(amountRaised);
            await onSubmit(
                {
                    title,
                    slug,
                    excerpt,
                    content_markdown: contentMarkdown,
                    event_date: eventDate || null,
                    fundraising_for: fundraisingFor.trim() || null,
                    amount_raised: parsedAmount != null && !Number.isNaN(parsedAmount) ? parsedAmount : null,
                    published,
                    published_at:
                        published && !update?.published_at
                            ? new Date().toISOString()
                            : update?.published_at || null,
                    hero_image_url: heroImageUrl,
                },
                newImageFile
            );
        } catch (error) {
            console.error("Failed to submit update:", error);
            alert("Failed to save. Please check the slug is unique and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-full">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-xl font-bold font-serif text-gray-900">
                        {update ? "Edit Update" : "New Coffee Morning Update"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="coffee-morning-update-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={handleTitleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. May Coffee Morning Raises £450 for Air Ambulance"
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
                                    placeholder="e.g. may-coffee-morning-air-ambulance"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
                                <input
                                    type="date"
                                    value={eventDate || ""}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fundraising For</label>
                                <input
                                    type="text"
                                    value={fundraisingFor}
                                    onChange={(e) => setFundraisingFor(e.target.value)}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="e.g. Wales Air Ambulance"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Raised (£)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={amountRaised}
                                    onChange={(e) => setAmountRaised(e.target.value)}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="e.g. 450.00"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={published}
                                    onChange={(e) => setPublished(e.target.checked)}
                                    className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                />
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-900">Publish Update</span>
                                    <span className="text-xs text-gray-500">Make visible to the public</span>
                                </div>
                            </label>
                        </div>

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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt (Short description)</label>
                            <textarea
                                required
                                rows={2}
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                                placeholder="A brief summary of this coffee morning..."
                            />
                        </div>

                        <div className="flex flex-col flex-1 min-h-[400px]">
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-gray-700">Content</label>
                                <span className={`text-xs font-medium ${countWords(contentMarkdown) > MAX_WORDS ? 'text-red-600' : 'text-gray-400'}`}>
                                    {countWords(contentMarkdown)} / {MAX_WORDS} words
                                </span>
                            </div>
                            <textarea
                                required
                                value={contentMarkdown}
                                onChange={(e) => setContentMarkdown(e.target.value)}
                                className={`w-full flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-y min-h-[400px] text-sm leading-relaxed ${countWords(contentMarkdown) > MAX_WORDS ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                placeholder="Write the update content here..."
                            />
                            {countWords(contentMarkdown) > MAX_WORDS && (
                                <p className="mt-1.5 text-xs text-red-600">
                                    Please reduce your content to {MAX_WORDS} words or fewer before saving.
                                </p>
                            )}
                        </div>
                    </form>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="coffee-morning-update-form"
                        disabled={isSubmitting || countWords(contentMarkdown) > MAX_WORDS}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-70"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            update ? "Save Changes" : "Create Update"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
