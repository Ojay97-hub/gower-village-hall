import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Coffee, Clock, CalendarDays, Users, Plus, Edit2, Trash2, AlertTriangle, X, Heart, ArrowRight, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGallery, GalleryImage } from '../context/GalleryContext';
import { useAuth } from '../context/AuthContext';
import { useCoffeeMorning } from '../context/CoffeeMorningContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { GalleryImageForm } from '../components/gallery/GalleryImageForm';
import { Link, useNavigate } from 'react-router-dom';
import cakeDisplay from '../assets/cake-display.jpg';
import flowerArrangement from '../assets/flower-arrangement.jpg';
import cakeMorningSummer from '../assets/cake-morning-summer.webp';

const defaultGalleryImages = [
  { id: 'default-1', image_url: cakeDisplay, label: 'Cake display', display_order: 1, created_at: '', grid_size: 'large' as const },
  { id: 'default-2', image_url: flowerArrangement, label: 'Flower arrangement', display_order: 2, created_at: '', grid_size: 'normal' as const },
  {
    id: 'default-3',
    image_url: 'https://images.unsplash.com/photo-1559630854-e3615c5f4e46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWN0b3JpYSUyMHNwb25nZSUyMGNha2V8ZW58MXx8fHwxNzY0NjA2MjAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    label: 'Victoria sponge', display_order: 3, created_at: '', grid_size: 'normal' as const
  },
  {
    id: 'default-4',
    image_url: 'https://images.unsplash.com/photo-1692324161119-9df5ca75973f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZW1vbiUyMGRyaXp6bGUlMjBjYWtlfGVufDF8fHx8MTc2NDYwNjIwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    label: 'Lemon drizzle', display_order: 4, created_at: '', grid_size: 'normal' as const
  },
  {
    id: 'default-5',
    image_url: 'https://images.unsplash.com/photo-1703876086193-5d29f099205c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBmdWRnZSUyMGNha2V8ZW58MXx8fHwxNzY0NjA2MjAxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    label: 'Chocolate fudge', display_order: 5, created_at: '', grid_size: 'large' as const
  },
  {
    id: 'default-6',
    image_url: 'https://images.unsplash.com/photo-1622926421334-6829deee4b4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJyb3QlMjBjYWtlfGVufDF8fHx8MTc2NDYwNjIwMXww&ixlib=rb-4.1.0&q=80&w=1080',
    label: 'Carrot cake', display_order: 6, created_at: '', grid_size: 'normal' as const
  },
  {
    id: 'default-7',
    image_url: 'https://images.unsplash.com/photo-1681711092882-b1b2ac383705?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjB3YWxudXQlMjBjYWtlfGVufDF8fHx8MTc2NDYwNjIwMXww&ixlib=rb-4.1.0&q=80&w=1080',
    label: 'Coffee & walnut', display_order: 7, created_at: '', grid_size: 'normal' as const
  },
  {
    id: 'default-8',
    image_url: 'https://images.unsplash.com/photo-1590869173972-7868b37913ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWxzaCUyMGJhcmElMjBicml0aCUyMGNha2V8ZW58MXx8fHwxNzY0NjA2MjAyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    label: 'Welsh bara brith', display_order: 8, created_at: '', grid_size: 'normal' as const
  }
];

function getNextCoffeeMorning(): Date {
  const now = new Date();
  // Try this month's first Saturday
  const d = new Date(now.getFullYear(), now.getMonth(), 1);
  d.setDate(1 + ((6 - d.getDay() + 7) % 7)); // first Saturday
  // Set to 10:30
  d.setHours(10, 30, 0, 0);
  // If it's already past, go to next month
  if (d <= now) {
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    next.setDate(1 + ((6 - next.getDay() + 7) % 7));
    next.setHours(10, 30, 0, 0);
    return next;
  }
  return d;
}

function useCountdown(target: Date) {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [target]);
  return time;
}

export function CoffeeMorning() {
  const { galleryImages, loading: galleryLoading, deleteGalleryImage, reorderGalleryImages } = useGallery();
  const { updates, loading: updatesLoading } = useCoffeeMorning();
  const { isAdmin, hasRole } = useAuth();
  const navigate = useNavigate();

  const nextDate = getNextCoffeeMorning();
  const countdown = useCountdown(nextDate);

  const [mode, setMode] = useState<'view' | 'edit' | 'delete'>('view');
  const [showImageForm, setShowImageForm] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | undefined>(undefined);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [draggedImage, setDraggedImage] = useState<GalleryImage | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [updatesPage, setUpdatesPage] = useState(0);
  const UPDATES_PER_PAGE = 3;

  const displayImages = (isAdmin || galleryImages.length > 0) ? galleryImages : defaultGalleryImages;

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, image: GalleryImage) => {
    setDraggedImage(image);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedImage(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (!draggedImage || !isAdmin) return;
    const dragIndex = displayImages.findIndex(img => img.id === draggedImage.id);
    if (dragIndex === dropIndex) return;
    const newImages = [...displayImages];
    newImages.splice(dragIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    if (!draggedImage.id.startsWith('default-')) {
      await reorderGalleryImages(newImages);
    }
  };

  const handleAddImage = () => {
    setMode('view');
    setEditingImage(undefined);
    setShowImageForm(true);
    setTimeout(() => {
      document.getElementById('gallery-form-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleEditImage = (image: GalleryImage) => {
    setEditingImage(image);
    setShowImageForm(true);
    setTimeout(() => {
      document.getElementById('gallery-form-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleFormClose = () => {
    setShowImageForm(false);
    setEditingImage(undefined);
  };

  const handleDeleteClick = (image: GalleryImage) => {
    setImageToDelete(image);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (imageToDelete) {
      try {
        setIsDeleting(true);
        await deleteGalleryImage(imageToDelete.id, imageToDelete.image_url);
        setIsDeleting(false);
        setDeleteConfirmOpen(false);
        setImageToDelete(null);
        setMode('view');
      } catch (error) {
        console.error('Failed to delete image:', error);
        setIsDeleting(false);
        alert('Failed to delete image. Please check the console for details.');
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setImageToDelete(null);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-primary-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0">
              <Coffee className="w-10 h-10 text-primary-600" />
            </div>
            <div>
              <p className="text-primary-600 font-medium mb-2 uppercase tracking-widest text-sm">Village Hall</p>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
                Monthly Coffee Mornings
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                Join us for our friendly village coffee mornings — a cherished community tradition
                held every first Saturday of the month. Enjoy homemade cakes, warm conversation,
                and the company of neighbours old and new.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-sm font-medium text-primary-600 uppercase tracking-widest mb-1">Next coffee morning</p>
          <p className="text-xl font-semibold text-gray-900 mb-6">
            {nextDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {' '}· 10:30 – 12:30
          </p>
          <div className="flex justify-center gap-4">
            {[
              { label: 'Days', value: countdown.days },
              { label: 'Hours', value: countdown.hours },
              { label: 'Minutes', value: countdown.minutes },
              { label: 'Seconds', value: countdown.seconds },
            ].map(({ label, value }) => (
              <div key={label} className="bg-primary-50 rounded-2xl px-5 py-4 min-w-[72px]">
                <p className="text-3xl font-bold text-gray-900 tabular-nums">{String(value).padStart(2, '0')}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-primary-50 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <CalendarDays className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">When</p>
                <p className="text-gray-600 text-sm">First Saturday of every month</p>
              </div>
            </div>
            <div className="bg-primary-50 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <Clock className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Time</p>
                <p className="text-gray-600 text-sm">10:30 – 12:30</p>
              </div>
            </div>
            <div className="bg-primary-50 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Open to</p>
                <p className="text-gray-600 text-sm">Everyone — all are welcome</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Updates */}
      <section className="py-16 border-b border-gray-100" style={{ backgroundColor: '#f8f7f4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="text-sm font-medium text-primary-600 uppercase tracking-widest mb-2">Latest news</p>
              <h2
                style={{
                  fontFamily: 'var(--font-family-serif)',
                  fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                  fontWeight: 400,
                  color: '#2d2d2d',
                  marginBottom: '6px',
                }}
              >
                Recent Updates
              </h2>
              <p className="text-gray-600">See what we've been raising money for and how each morning went.</p>
            </div>
            {isAdmin && hasRole('coffee_mornings') && (
              <button
                onClick={() => navigate('/admin/coffee-morning')}
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm self-start md:self-auto"
              >
                <Settings className="w-4 h-4" />
                Manage Updates
              </button>
            )}
          </div>

          {updatesLoading && updates.length === 0 ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
            </div>
          ) : updates.length === 0 ? (
            <div
              className="rounded-2xl text-center"
              style={{ backgroundColor: 'white', border: '1px dashed #d1d5db', padding: '48px 24px' }}
            >
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Coffee className="w-6 h-6 text-primary-600" />
              </div>
              <p className="text-gray-700 font-medium mb-1">No updates yet</p>
              <p className="text-sm text-gray-500">
                Check back after our next coffee morning to see what we raised.
              </p>
            </div>
          ) : (() => {
            const totalPages = Math.ceil(updates.length / UPDATES_PER_PAGE);
            const pageUpdates = updates.slice(updatesPage * UPDATES_PER_PAGE, (updatesPage + 1) * UPDATES_PER_PAGE);
            return (
              <>
                <div
                  className="grid"
                  style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}
                >
                  {pageUpdates.map((u) => (
                    <Link
                      key={u.id}
                      to={`/hall/coffee-morning/${u.slug}`}
                      className="rounded-2xl overflow-hidden flex flex-col group"
                      style={{
                        backgroundColor: 'white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        textDecoration: 'none',
                        transition: 'box-shadow 0.3s, transform 0.3s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div className="relative overflow-hidden bg-gray-100" style={{ height: '220px' }}>
                        <img
                          src={u.hero_image_url || cakeMorningSummer}
                          alt={u.title}
                          className="w-full h-full"
                          style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                        />
                        {!u.published && (
                          <span className="absolute top-3 left-3 bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide">
                            DRAFT
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col flex-1" style={{ padding: '24px' }}>
                        <div className="flex items-center text-xs text-gray-500 mb-3" style={{ gap: '12px' }}>
                          {u.event_date && (
                            <span className="inline-flex items-center" style={{ gap: '6px' }}>
                              <CalendarDays className="w-3.5 h-3.5" />
                              {new Date(u.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                        <h3
                          style={{
                            fontFamily: 'var(--font-family-serif)',
                            fontSize: '1.2rem',
                            lineHeight: 1.35,
                            fontWeight: 400,
                            color: '#2d2d2d',
                            marginBottom: '10px',
                          }}
                        >
                          {u.title}
                        </h3>
                        <p
                          className="text-sm flex-1"
                          style={{
                            color: '#666',
                            lineHeight: 1.6,
                            marginBottom: '16px',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {u.excerpt}
                        </p>
                        {(u.fundraising_for || u.amount_raised != null) && (
                          <div
                            className="flex items-center gap-2 rounded-lg mb-4"
                            style={{
                              backgroundColor: 'rgba(107, 117, 100, 0.08)',
                              padding: '8px 12px',
                              border: '1px solid rgba(107, 117, 100, 0.15)',
                            }}
                          >
                            <Heart className="w-4 h-4 flex-shrink-0" style={{ color: '#5c6555' }} />
                            <p className="text-xs flex-1 truncate" style={{ color: '#3f463b' }}>
                              {u.amount_raised != null ? (
                                <>
                                  <span className="font-semibold">£{Number(u.amount_raised).toFixed(2)}</span>
                                  {u.fundraising_for && <> raised for {u.fundraising_for}</>}
                                </>
                              ) : (
                                <>Raising money for <span className="font-semibold">{u.fundraising_for}</span></>
                              )}
                            </p>
                          </div>
                        )}
                        <span
                          className="inline-flex items-center text-sm font-medium mt-auto"
                          style={{ color: '#5c6555', gap: '6px' }}
                        >
                          Read update
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8">
                    <button
                      onClick={() => setUpdatesPage(p => p - 1)}
                      disabled={updatesPage === 0}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ backgroundColor: 'white', borderColor: '#d1d5db', color: '#374151' }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Newer
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setUpdatesPage(i)}
                          className="rounded-full transition-all"
                          style={{
                            width: i === updatesPage ? '24px' : '8px',
                            height: '8px',
                            backgroundColor: i === updatesPage ? '#5c6555' : '#d1d5db',
                          }}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setUpdatesPage(p => p + 1)}
                      disabled={updatesPage === totalPages - 1}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ backgroundColor: 'white', borderColor: '#d1d5db', color: '#374151' }}
                    >
                      Older
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <div className="flex-1 text-center md:text-left">
              <h2 className="mb-2">Gallery</h2>
              <p className="text-gray-600 text-lg">Delicious homemade cakes by our local bakers</p>
              {isAdmin && mode !== 'view' && (
                <p className="text-sm font-medium mt-2 animate-in fade-in slide-in-from-top-1 duration-200 text-primary-600">
                  {mode === 'edit' ? 'Select an image to edit' : 'Select an image to delete'}
                </p>
              )}
            </div>

            {isAdmin && (
              <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                <button
                  onClick={() => setMode('view')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'view' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  View
                </button>
                <button
                  onClick={handleAddImage}
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
                <div className="w-px bg-gray-200 my-1 mx-1" />
                <button
                  onClick={() => setMode(mode === 'edit' ? 'view' : 'edit')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${mode === 'edit' ? 'bg-primary-100 text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => setMode(mode === 'delete' ? 'view' : 'delete')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${mode === 'delete' ? 'bg-red-100 text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>

          {galleryLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
          ) : (
            <>
              {/* Mobile: touch-scroll carousel */}
              <div className="md:hidden -mx-4 px-4">
                <div
                  className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4"
                  style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                >
                  {displayImages.map((image) => (
                    <div
                      key={image.id}
                      className="group relative flex-none w-72 snap-start overflow-hidden rounded-2xl shadow-md"
                    >
                      <ImageWithFallback
                        src={image.image_url}
                        alt={image.label}
                        className="w-full aspect-square object-cover"
                        loading="lazy"
                      />
                      {isAdmin && mode !== 'view' && (
                        <div
                          className={`absolute inset-0 z-40 flex items-center justify-center cursor-pointer ${
                            mode === 'edit' ? 'bg-primary-900/20' : 'bg-red-900/20'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (mode === 'edit') handleEditImage(image);
                            if (mode === 'delete') handleDeleteClick(image);
                          }}
                        >
                          <div className={`p-3 rounded-full shadow-lg ${mode === 'edit' ? 'bg-white text-primary-600' : 'bg-white text-red-600'}`}>
                            {mode === 'edit' ? <Edit2 className="w-6 h-6" /> : <Trash2 className="w-6 h-6" />}
                          </div>
                        </div>
                      )}
                      {image.label && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <p className="text-white text-sm font-medium">{image.label}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Scroll hint dots */}
                <div className="flex justify-center gap-1.5 mt-2">
                  {displayImages.map((image) => (
                    <div key={image.id} className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  ))}
                </div>
              </div>

              {/* Desktop: grid */}
              <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayImages.map((image, index) => (
                  <div
                    key={image.id}
                    draggable={isAdmin && !image.id.startsWith('default-')}
                    onDragStart={(e) => handleDragStart(e, image)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`group cursor-pointer relative overflow-hidden shadow-md rounded-lg transition-all duration-300 ${
                      image.grid_size === 'large' ? 'md:col-span-2 md:row-span-2' : ''
                    } ${dragOverIndex === index ? 'ring-4 ring-primary-500 ring-offset-2 scale-[1.02]' : ''
                    } ${isAdmin && !image.id.startsWith('default-') ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  >
                    <ImageWithFallback
                      src={image.image_url}
                      alt={image.label}
                      className={`w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105 ${
                        image.grid_size === 'large' ? 'aspect-square' : 'aspect-[4/3]'
                      }`}
                      loading="lazy"
                    />
                    {isAdmin && mode !== 'view' && (
                      <div
                        className={`absolute inset-0 z-40 transition-colors duration-200 cursor-pointer flex items-center justify-center ${
                          mode === 'edit'
                            ? 'hover:bg-primary-900/20 active:bg-primary-900/30 ring-inset hover:ring-4 ring-primary-500'
                            : 'hover:bg-red-900/20 active:bg-red-900/30 ring-inset hover:ring-4 ring-red-500'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (mode === 'edit') handleEditImage(image);
                          if (mode === 'delete') handleDeleteClick(image);
                        }}
                      >
                        <div className={`p-3 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-200 ${
                          mode === 'edit' ? 'bg-white text-primary-600' : 'bg-white text-red-600'
                        }`}>
                          {mode === 'edit' ? <Edit2 className="w-6 h-6" /> : <Trash2 className="w-6 h-6" />}
                        </div>
                      </div>
                    )}
                    {isAdmin && (
                      <div className="absolute top-2 left-2 p-1.5 bg-white/80 text-gray-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                        </svg>
                      </div>
                    )}
                    {image.label && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-sm font-medium">{image.label}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {showImageForm && (
            <div id="gallery-form-section" className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <GalleryImageForm
                initialData={editingImage}
                onSuccess={handleFormClose}
                onCancel={handleFormClose}
              />
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Come and join us</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            No need to book — just turn up on the first Saturday of the month.
            Looking to hire the hall for your own event?
          </p>
          <Link
            to="/hall#booking"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Book the Hall
          </Link>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleDeleteCancel} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-80 mx-auto animate-in fade-in zoom-in-95 duration-200 border border-gray-300">
            <button
              onClick={handleDeleteCancel}
              className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-base font-bold text-gray-900 mb-2">Delete Image?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-gray-900">"{imageToDelete?.label}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex flex-row gap-4">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{ backgroundColor: '#dc2626' }}
                className="flex-1 px-4 py-3 text-white font-medium rounded-xl hover:opacity-90 transition-colors flex items-center justify-center gap-2 text-sm"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
