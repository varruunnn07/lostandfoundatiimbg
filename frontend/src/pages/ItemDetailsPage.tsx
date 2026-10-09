import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { MapPin, Package, User, Phone, ArrowLeft, CheckCircle, Tag, Calendar, ChevronLeft, ChevronRight, Mail, Building, Clock, AlertCircle, Lock, MessageCircle } from 'lucide-react';

interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  item_type: 'lost' | 'found';
  lost_location?: string;
  found_location?: string;
  reported_by: string;
  reporter_name: string;
  reporter_contact: string;
  image_path?: string;
  status: 'available' | 'collected';
  created_at: string;
  collected_by?: string;
  collected_at?: string;
  collector_name?: string;
  collector_hostel?: string;
  collector_email?: string;
  collector_phone?: string;
  collection_date_time?: string;
}

const ItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Gallery state
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Modal Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formHostel, setFormHostel] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');

  const fetchItem = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setItem(data);

      if (data.image_path) {
        let paths: string[] = [];
        try {
          const parsed = JSON.parse(data.image_path);
          if (Array.isArray(parsed)) {
            paths = parsed;
          } else {
            paths = [data.image_path];
          }
        } catch {
          paths = [data.image_path];
        }
        const urls = paths.map(p => supabase.storage.from('item-images').getPublicUrl(p).data.publicUrl);
        setImageUrls(urls);
      }
    } catch (err: any) {
      console.error('Error fetching item:', err);
      setError('Item not found or an error occurred while loading.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchItem();
    }
  }, [id, user]);

  const handleNextImage = () => setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
  const handlePrevImage = () => setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    // Validation
    if (!formName || !formHostel || !formEmail || !formPhone || !formDate || !formTime) {
      setSubmitError('All fields are required.');
      return;
    }
    
    // Basic email validation
    if (!/^\S+@\S+\.\S+$/.test(formEmail)) {
      setSubmitError('Please enter a valid email address.');
      return;
    }

    if (formPhone.length !== 10) {
      setSubmitError('Please enter a valid 10-digit phone number.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Combine date and time into a valid ISO string
      const collectionDateTime = new Date(`${formDate}T${formTime}`).toISOString();

      const { error: updateError } = await supabase
        .from('items')
        .update({
          status: 'collected',
          collector_name: formName,
          collector_hostel: formHostel,
          collector_email: formEmail,
          collector_phone: formPhone,
          collection_date_time: collectionDateTime
        })
        .eq('id', item.id)
        .eq('reported_by', user?.id) // Extra safety check
        .eq('status', 'available'); // Trigger will also prevent, but we double check

      if (updateError) {
        throw new Error(updateError.message);
      }

      setSubmitSuccess('Collection details saved successfully!');
      setTimeout(() => {
        setIsModalOpen(false);
        fetchItem(); // Refresh item to show new collected status
      }, 1500);

    } catch (err: any) {
      console.error('Error updating item:', err);
      setSubmitError(err.message || 'Failed to update the item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin text-primary">
          <Package size={48} />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh] px-4 pb-12">
        <div className="bg-white border-none shadow-apple p-10 max-w-[500px] w-full text-center flex flex-col items-center rounded-[16px]">
          <div className="bg-primary/10 p-5 rounded-full mb-6">
            <Lock size={48} className="text-primary" />
          </div>
          <h2 className="text-[2rem] font-extrabold mb-3 text-primary leading-tight">Authentication Required</h2>
          <p className="text-text-light mb-8 text-[1.1rem]">Please login to view item details.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link 
              to="/auth" 
              state={{ from: { pathname: `/item/${id}` } }}
              className="bg-primary text-white py-3 px-8 rounded-[50px] font-bold no-underline transition-all hover:bg-[#001122] hover:scale-105 shadow-md flex-1 max-w-[200px]"
            >
              Login
            </Link>
            <Link 
              to="/auth" 
              state={{ from: { pathname: `/item/${id}` } }}
              className="bg-white text-primary py-3 px-8 rounded-[50px] font-bold no-underline transition-all border-2 border-primary/20 hover:border-primary/50 shadow-sm flex-1 max-w-[200px]"
            >
              Create Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <div className="bg-white border-none shadow-apple p-10 max-w-[500px] w-full text-center rounded-[16px]">
          <Package size={64} className="text-text-light/30 mx-auto mb-6" />
          <h2 className="text-[2rem] font-extrabold mb-4 text-primary">Item Not Found</h2>
          <p className="text-text-light mb-8">{error || 'The item you are looking for does not exist.'}</p>
          <Link 
            to="/browse" 
            className="bg-primary text-white py-3 px-6 rounded-[50px] font-bold no-underline inline-flex items-center gap-2 transition-all hover:bg-[#001122]"
          >
            <ArrowLeft size={18} /> Back to Browse
          </Link>
        </div>
      </main>
    );
  }

  const locationStr = item.item_type === 'lost' ? item.lost_location : item.found_location;
  const isOwner = user?.id === item.reported_by;

  return (
    <main className="flex justify-center py-4 px-4 pb-16">
      <div className="max-w-[1000px] w-full flex flex-col gap-6">
        
        <div className="flex justify-between items-center">
          <Link to="/browse" className="text-text-light hover:text-primary transition-colors flex items-center gap-2 font-semibold w-fit no-underline">
            <ArrowLeft size={20} /> Back to Browse
          </Link>

          {isOwner && item.status === 'available' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#137333] hover:bg-[#0d5224] text-white py-2 px-5 rounded-[50px] font-bold transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <CheckCircle size={18} /> Mark as Collected
            </button>
          )}
        </div>

        <div className="bg-white rounded-[16px] overflow-hidden flex flex-col md:flex-row border-none shadow-apple">
          
          {/* Image Section */}
          <div className="md:w-1/2 bg-[#e8e6e3] min-h-[300px] md:min-h-full flex flex-col">
            <div className="relative flex-1 flex items-center justify-center min-h-[300px]">
              {imageUrls.length > 0 ? (
                <>
                  <img 
                    src={imageUrls[currentImageIndex]} 
                    alt={`${item.name} - ${currentImageIndex + 1}`} 
                    className="w-full h-full object-cover absolute inset-0" 
                  />
                  
                  {imageUrls.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary p-2 rounded-full shadow-lg backdrop-blur-md transition-all z-20 cursor-pointer"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      
                      <button 
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary p-2 rounded-full shadow-lg backdrop-blur-md transition-all z-20 cursor-pointer"
                      >
                        <ChevronRight size={24} />
                      </button>

                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-[50px] text-[0.8rem] font-bold tracking-widest z-20 backdrop-blur-md">
                        {currentImageIndex + 1} / {imageUrls.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#001f3f]/10 to-[#FFD444]/20 absolute inset-0 text-primary/30">
                  <Package size={80} className="mb-4" />
                  <span className="font-semibold text-[1.1rem]">No Image Available</span>
                </div>
              )}
              
              <span className={`absolute top-4 right-4 py-1.5 px-4 rounded-[50px] text-[0.85rem] font-bold shadow-sm backdrop-blur-md z-20 ${
                item.item_type === 'found' 
                  ? 'bg-[#E2E8F0]/90 text-[#334155] border border-[#CBD5E1]/50' 
                  : 'bg-[#FEF3C7]/90 text-[#D97706] border border-[#FDE68A]/50'
              }`}>
                {item.item_type === 'found' ? 'Found Item' : 'Lost Item'}
              </span>
              
              {item.status === 'collected' && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                  <div className="bg-[#137333] text-white py-2 px-6 rounded-[50px] font-black text-[1.5rem] tracking-wide uppercase shadow-xl flex items-center gap-3 transform -rotate-12">
                    <CheckCircle size={28} /> Collected
                  </div>
                </div>
              )}
            </div>

            {imageUrls.length > 1 && (
              <div className="flex gap-2 p-4 bg-white/50 backdrop-blur-md overflow-x-auto">
                {imageUrls.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-[8px] overflow-hidden flex-shrink-0 transition-all border-2 cursor-pointer ${
                      currentImageIndex === idx ? 'border-primary shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col bg-white">
            <div className="mb-6">
              <span className="inline-block bg-black/5 px-3 py-1.5 rounded-[8px] font-semibold text-text-light text-[0.8rem] mb-3 flex items-center gap-2 w-fit">
                <Tag size={14} /> {item.category}
              </span>
              <h1 className="text-[2.5rem] font-extrabold text-primary leading-tight mb-4">{item.name}</h1>
              
              <div className="flex flex-col gap-3">
                <span className="text-[1.05rem] text-text-dark font-medium flex items-center gap-3">
                  <MapPin size={20} className="text-primary/70 flex-shrink-0" /> 
                  <span className="font-semibold">{item.item_type === 'lost' ? 'Lost at:' : 'Found at:'}</span> {locationStr}
                </span>
                
                <span className="text-[1.05rem] text-text-dark font-medium flex items-center gap-3">
                  <Calendar size={20} className="text-primary/70 flex-shrink-0" /> 
                  <span className="font-semibold">Reported on:</span> {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <hr className="border-black/5 my-6" />

            <div className="mb-8">
              <h3 className="text-[1.2rem] font-bold mb-3 text-text-dark">Description</h3>
              <p className="text-text-light leading-relaxed whitespace-pre-wrap text-[1.05rem]">
                {item.description || "No additional description provided."}
              </p>
            </div>
            
            <div className="mt-auto bg-[var(--bg-base)] p-6 rounded-[16px] border border-black/5 flex flex-col gap-6">
              <div>
                <h3 className="text-[1rem] font-bold mb-4 text-text-dark uppercase tracking-wider">Reporter Contact</h3>
                <div className="flex flex-col gap-3">
                  <span className="text-[1.05rem] text-text-dark font-medium flex items-center gap-3">
                    <User size={20} className="text-primary/70 flex-shrink-0" /> 
                    {item.reporter_name}
                  </span>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <span className="text-[1.05rem] text-text-dark font-medium flex items-center gap-3">
                      <Phone size={20} className="text-primary/70 flex-shrink-0" /> 
                      {item.reporter_contact}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <a 
                        href={`tel:${item.reporter_contact}`}
                        className="w-[36px] h-[36px] flex items-center justify-center bg-black/5 hover:bg-primary hover:text-white rounded-full transition-colors text-text-dark"
                        title="Call Reporter"
                      >
                        <Phone size={16} />
                      </a>
                      <a 
                        href={`https://wa.me/${item.reporter_contact.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-[36px] h-[36px] flex items-center justify-center bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white rounded-full transition-colors"
                        title="Message on WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {item.status === 'collected' && item.collector_name && (
                <>
                  <hr className="border-black/5" />
                  <div>
                    <h3 className="text-[1rem] font-bold mb-4 text-[#137333] uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle size={18} /> Collection Details
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[0.8rem] text-text-light font-semibold uppercase tracking-wider">Collector</span>
                        <span className="text-[1rem] text-text-dark font-medium flex items-center gap-2">
                          <User size={16} className="text-[#137333]/70" /> {item.collector_name}
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <span className="text-[0.8rem] text-text-light font-semibold uppercase tracking-wider">Hostel/Room</span>
                        <span className="text-[1rem] text-text-dark font-medium flex items-center gap-2">
                          <Building size={16} className="text-[#137333]/70" /> {item.collector_hostel}
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <span className="text-[0.8rem] text-text-light font-semibold uppercase tracking-wider">Phone</span>
                        <span className="text-[1rem] text-text-dark font-medium flex items-center gap-2">
                          <Phone size={16} className="text-[#137333]/70" /> {item.collector_phone}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[0.8rem] text-text-light font-semibold uppercase tracking-wider">Email</span>
                        <span className="text-[1rem] text-text-dark font-medium flex items-center gap-2 truncate" title={item.collector_email}>
                          <Mail size={16} className="text-[#137333]/70 flex-shrink-0" /> <span className="truncate">{item.collector_email}</span>
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-1 sm:col-span-2 mt-2 bg-[#e6f4ea] p-3 rounded-[12px]">
                        <span className="text-[0.8rem] text-[#137333] font-bold uppercase tracking-wider">Collection Date & Time</span>
                        <span className="text-[1.05rem] text-[#137333] font-bold flex items-center gap-2">
                          <Clock size={18} /> 
                          {item.collection_date_time ? new Date(item.collection_date_time).toLocaleString() : 'Date unavailable'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Collection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[600px] max-h-[90vh] flex flex-col my-8">
            
            <div className="p-6 border-b border-black/5 flex justify-between items-center sticky top-0 bg-white rounded-t-[24px] z-10">
              <h2 className="text-[1.5rem] font-bold text-primary m-0 flex items-center gap-2">
                <CheckCircle size={24} className="text-[#137333]" /> Collection Details
              </h2>
              <button onClick={handleModalClose} className="text-text-light hover:text-red-500 transition-colors p-2 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="bg-primary/5 rounded-[12px] p-4 flex items-center gap-4 mb-6">
                {imageUrls.length > 0 ? (
                  <img src={imageUrls[0]} alt="Item" className="w-16 h-16 rounded-[8px] object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-[8px] bg-black/10 flex items-center justify-center">
                    <Package size={24} className="text-text-light" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-text-dark m-0">{item.name}</h3>
                  <p className="text-[0.85rem] text-text-light m-0">Please fill out the details of the person receiving this item.</p>
                </div>
              </div>

              {submitError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-[8px] mb-6 text-[0.9rem] flex items-start gap-2 border border-red-200">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" /> {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="bg-[#e6f4ea] text-[#137333] p-3 rounded-[8px] mb-6 text-[0.9rem] flex items-center justify-center gap-2 border border-[#137333]/20 font-bold">
                  <CheckCircle size={18} /> {submitSuccess}
                </div>
              )}

              <form id="collection-form" onSubmit={handleCollectionSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[0.85rem] font-bold text-text-dark ml-1">Collector's Full Name *</label>
                  <div className="flex items-center bg-black/5 rounded-[12px] p-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <User size={18} className="text-text-light ml-2 mr-3" />
                    <input 
                      type="text" required value={formName} onChange={e => setFormName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="bg-transparent border-none outline-none w-full text-[0.95rem] font-sans"
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[0.85rem] font-bold text-text-dark ml-1">Hostel / Block & Room *</label>
                  <div className="flex items-center bg-black/5 rounded-[12px] p-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <Building size={18} className="text-text-light ml-2 mr-3" />
                    <input 
                      type="text" required value={formHostel} onChange={e => setFormHostel(e.target.value)}
                      placeholder="e.g. Boys Hostel A, Room 102"
                      className="bg-transparent border-none outline-none w-full text-[0.95rem] font-sans"
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[0.85rem] font-bold text-text-dark ml-1">Email Address *</label>
                    <div className="flex items-center bg-black/5 rounded-[12px] p-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                      <Mail size={18} className="text-text-light ml-2 mr-3" />
                      <input 
                        type="email" required value={formEmail} onChange={e => setFormEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="bg-transparent border-none outline-none w-full text-[0.95rem] font-sans"
                        maxLength={150}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[0.85rem] font-bold text-text-dark ml-1">Phone Number *</label>
                    <div className="flex items-center bg-black/5 rounded-[12px] p-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                      <Phone size={18} className="text-text-light ml-2 mr-3" />
                      <input 
                        type="tel" required value={formPhone} onChange={e => setFormPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit mobile number"
                        className="bg-transparent border-none outline-none w-full text-[0.95rem] font-sans"
                        pattern="\d{10}"
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[0.85rem] font-bold text-text-dark ml-1">Collection Date *</label>
                    <div className="flex items-center bg-black/5 rounded-[12px] p-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                      <Calendar size={18} className="text-text-light ml-2 mr-3" />
                      <input 
                        type="date" required value={formDate} onChange={e => setFormDate(e.target.value)}
                        className="bg-transparent border-none outline-none w-full text-[0.95rem] font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[0.85rem] font-bold text-text-dark ml-1">Collection Time *</label>
                    <div className="flex items-center bg-black/5 rounded-[12px] p-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                      <Clock size={18} className="text-text-light ml-2 mr-3" />
                      <input 
                        type="time" required value={formTime} onChange={e => setFormTime(e.target.value)}
                        className="bg-transparent border-none outline-none w-full text-[0.95rem] font-sans"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-black/5 bg-black/[0.02] rounded-b-[24px] flex justify-end gap-3 sticky bottom-0">
              <button 
                type="button" 
                onClick={handleModalClose}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-[50px] font-bold text-text-dark hover:bg-black/5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="collection-form"
                disabled={isSubmitting}
                className="bg-[#137333] hover:bg-[#0d5224] text-white px-8 py-2.5 rounded-[50px] font-bold transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Confirm Handover'}
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
};

export default ItemDetailsPage;
