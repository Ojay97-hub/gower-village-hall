import { useState } from "react";
import { Plus, Edit2, Trash2, Search, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useBlog, BlogPostRow } from "../context/BlogContext";
import { BlogPostForm } from "../components/BlogPostForm";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";

export function AdminBlog() {
    const { posts, loading, error, createPost, updatePost, deletePost, uploadHeroImage } = useBlog();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"All" | "Published" | "Draft">("All");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPostRow | undefined>(undefined);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<BlogPostRow | undefined>(undefined);
    const [isDeleting, setIsDeleting] = useState(false);

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              post.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === "All" ? true :
                              filterStatus === "Published" ? post.published : !post.published;
        return matchesSearch && matchesStatus;
    });

    const handleOpenForm = (post?: BlogPostRow) => {
        setEditingPost(post);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingPost(undefined);
    };

    const handleSubmitForm = async (values: Omit<BlogPostRow, "id" | "created_at" | "updated_at" | "created_by" | "updated_by">, newImageFile: File | null) => {
        let imageUrl = values.hero_image_url;

        // If there's a new image file, upload it first
        if (newImageFile) {
            imageUrl = await uploadHeroImage(newImageFile);
            
            // If editing and there was an old image, it will be left stray in storage.
            // A more complex app would delete the old one here. We'll stick to simple overwrite in DB.
        }

        const dataToSave = { ...values, hero_image_url: imageUrl };

        if (editingPost) {
            await updatePost(editingPost.id, dataToSave);
        } else {
            await createPost(dataToSave);
        }

        handleCloseForm();
    };

    const handleDeleteClick = (post: BlogPostRow) => {
        setPostToDelete(post);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!postToDelete) return;
        setIsDeleting(true);
        try {
            await deletePost(postToDelete.id, postToDelete.hero_image_url);
            setDeleteModalOpen(false);
            setPostToDelete(undefined);
        } catch (error) {
            console.error("Failed to delete post:", error);
            alert("Failed to delete post. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
        setPostToDelete(undefined);
    };

    if (loading && posts.length === 0) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 max-w-4xl mx-auto mt-10 bg-red-50 text-red-600 rounded-2xl border border-red-200">
                <h2 className="text-xl font-bold mb-2">Error Loading Posts</h2>
                <p>{error.message}</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-gray-900 mb-2">Blog Posts</h1>
                    <p className="text-gray-500">Manage all articles, drafts, and categories.</p>
                </div>
                <button
                    onClick={() => handleOpenForm()}
                    className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium"
                >
                    <Plus className="w-5 h-5" />
                    New Post
                </button>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {(["All", "Published", "Draft"] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterStatus === status ? "bg-primary-100 text-primary-800" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts Grid/List */}
            {filteredPosts.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No posts found</h3>
                    <p className="text-gray-500">Try adjusting your filters or search query.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-sm font-medium text-gray-500">
                                    <th className="p-4 pl-6 font-medium w-max font-medium">Post</th>
                                    <th className="p-4 font-medium w-1/5">Category & Status</th>
                                    <th className="p-4 font-medium w-1/5">Dates</th>
                                    <th className="p-4 pr-6 font-medium text-right w-1/6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPosts.map(post => (
                                    <tr key={post.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-gray-200">
                                                    {post.hero_image_url ? (
                                                        <img src={post.hero_image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 mb-0.5 line-clamp-1">
                                                        {post.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-mono">
                                                        /{post.slug}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col items-start gap-2">
                                                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                                    {post.category}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`w-2 h-2 rounded-full ${post.published ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                    <span className="text-xs font-medium text-gray-600">
                                                        {post.published ? 'Published' : 'Draft'}
                                                    </span>
                                                    {post.featured && (
                                                        <span className="ml-1 text-[10px] uppercase font-bold text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            <div>Created: {new Date(post.created_at).toLocaleDateString()}</div>
                                            {post.published_at && (
                                                <div className="text-xs text-gray-400 mt-1">Pub: {new Date(post.published_at).toLocaleDateString()}</div>
                                            )}
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link 
                                                    to={`/blog/${post.slug}`}
                                                    target="_blank"
                                                    title="View Article"
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleOpenForm(post)}
                                                    title="Edit Post"
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(post)}
                                                    title="Delete Post"
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isFormOpen && (
                <BlogPostForm
                    post={editingPost}
                    onSubmit={handleSubmitForm}
                    onClose={handleCloseForm}
                />
            )}

            <ConfirmDeleteModal
                isOpen={deleteModalOpen}
                title="Delete Post"
                itemName={postToDelete?.title || ""}
                isDeleting={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </div>
    );
}
