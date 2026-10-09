import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Upload, X, ArrowRight, Package, AlignLeft, Tag, MapPin, User, Phone, Image as ImageIcon } from 'lucide-react';

const ReportItemPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [itemType, setItemType] = useState<'lost' | 'found'>('lost');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [location, setLocation] = useState('');
  const [reporterName, setReporterName] = useState(user?.user_metadata?.full_name || '');
  const [reporterContact, setReporterContact] = useState('');
  
  // Image handling
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['Electronics', 'Wallets/Bags', 'Keys', 'Documents', 'Clothing', 'Other'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Check total images limit
      if (imageFiles.length + newFiles.length > 5) {
        setError('You can only upload up to 5 images per item.');
        return;
      }

      const validFiles: File[] = [];
      const validPreviews: string[] = [];
      let sizeError = false;
      let typeError = false;

      newFiles.forEach((file) => {
        if (file.size > 5 * 1024 * 1024) {
          sizeError = true;
          return;
        }
        if (!file.type.startsWith('image/')) {
          typeError = true;
          return;
        }
        validFiles.push(file);
        validPreviews.push(URL.createObjectURL(file));
      });

      if (sizeError) setError('One or more images exceeded the 5MB size limit and were skipped.');
      else if (typeError) setError('One or more files were not valid images and were skipped.');
      else setError(null);

      setImageFiles(prev => [...prev, ...validFiles]);
      setImagePreviews(prev => [...prev, ...validPreviews]);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);

    const newPreviews = [...imagePreviews];
    // Free memory
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    if (reporterContact.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      setIsSubmitting(false);
      return;
    }

    try {
      let imagePathsArray: string[] = [];

      // Upload all images sequentially (or Promise.all)
      if (imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}-${i}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError, data } = await supabase.storage
            .from('item-images')
            .upload(filePath, file);

          if (uploadError) {
            throw new Error(`Image ${i + 1} upload failed: ${uploadError.message}`);
          }
          
          imagePathsArray.push(data.path);
        }
      }

      // Backward compatibility handling:
      // If 0 images, null
      // If 1 image, store it exactly as a raw string so it acts exactly like the old code.
      // If > 1 image, store the JSON stringified array.
      let finalImagePathValue = null;
      if (imagePathsArray.length === 1) {
        finalImagePathValue = imagePathsArray[0];
      } else if (imagePathsArray.length > 1) {
        finalImagePathValue = JSON.stringify(imagePathsArray);
      }

      const reportData = {
        name,
        description,
        category,
        item_type: itemType,
        [itemType === 'lost' ? 'lost_location' : 'found_location']: location,
        reported_by: user.id,
        reporter_name: reporterName,
        reporter_contact: reporterContact,
        image_path: finalImagePathValue,
        status: 'available'
      };

      const { error: insertError } = await supabase
        .from('items')
        .insert([reportData]);

      if (insertError) {
        throw new Error(`Failed to submit report: ${insertError.message}`);
      }

      setSuccess('Item reported successfully!');
      setTimeout(() => {
        navigate('/browse');
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex flex-col items-center py-4 px-4">
      <div className="bg-white p-6 sm:p-8 md:p-10 max-w-[800px] w-full rounded-[16px] border-none shadow-apple">
        <div className="text-center mb-8">
          <h1 className="text-[2.5rem] font-extrabold mb-2 text-primary">Report an Item</h1>
          <p className="text-text-light">Help us keep track of lost and found items on campus.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[12px] mb-6 text-[0.9rem]">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-[#e6f4ea] border border-[#137333]/20 text-[#137333] px-4 py-3 rounded-[12px] mb-6 text-[0.9rem] text-center font-medium">
            {success} Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Type Selector */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-2">
            <button
              type="button"
              onClick={() => setItemType('lost')}
              className={`flex-1 py-3 rounded-[12px] font-bold transition-all duration-300 border-2 ${
                itemType === 'lost' 
                ? 'bg-primary border-primary text-white' 
                : 'bg-[var(--bg-base)] border-black/5 text-text-light hover:border-primary/30 hover:text-primary'
              }`}
            >
              I Lost Something
            </button>
            <button
              type="button"
              onClick={() => setItemType('found')}
              className={`flex-1 py-3 rounded-[12px] font-bold transition-all duration-300 border-2 ${
                itemType === 'found' 
                ? 'bg-[#137333] border-[#137333] text-white' 
                : 'bg-[var(--bg-base)] border-black/5 text-text-light hover:border-[#137333]/30 hover:text-[#137333]'
              }`}
            >
              I Found Something
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] font-bold text-text-dark ml-2">Item Name *</label>
              <div className="flex items-center bg-[var(--bg-base)] rounded-[12px] p-3 border border-black/5 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <Package size={18} className="text-text-light mr-3" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Blue Dell Laptop"
                  className="bg-transparent border-none outline-none w-full text-text-dark font-sans placeholder:text-text-light/60"
                  required
                  maxLength={100}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] font-bold text-text-dark ml-2">Category *</label>
              <div className="flex items-center bg-[var(--bg-base)] rounded-[12px] p-3 border border-black/5 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <Tag size={18} className="text-text-light mr-3" />
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-text-dark font-sans"
                  required
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.85rem] font-bold text-text-dark ml-2">Description</label>
            <div className="flex items-start bg-[var(--bg-base)] rounded-[12px] p-3 border border-black/5 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <AlignLeft size={18} className="text-text-light mr-3 mt-1" />
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe any distinguishing features, brand, color, etc."
                className="bg-transparent border-none outline-none w-full text-text-dark font-sans placeholder:text-text-light/60 min-h-[80px] resize-y"
                maxLength={1000}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.85rem] font-bold text-text-dark ml-2">
              {itemType === 'lost' ? 'Lost Location *' : 'Found Location *'}
            </label>
            <div className="flex items-center bg-[var(--bg-base)] rounded-[12px] p-3 border border-black/5 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <MapPin size={18} className="text-text-light mr-3" />
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={itemType === 'lost' ? "Where did you last see it?" : "Where did you find it?"}
                className="bg-transparent border-none outline-none w-full text-text-dark font-sans placeholder:text-text-light/60"
                required
                maxLength={150}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] font-bold text-text-dark ml-2">Your Name *</label>
              <div className="flex items-center bg-[var(--bg-base)] rounded-[12px] p-3 border border-black/5 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <User size={18} className="text-text-light mr-3" />
                <input 
                  type="text" 
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-transparent border-none outline-none w-full text-text-dark font-sans placeholder:text-text-light/60"
                  required
                  maxLength={100}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] font-bold text-text-dark ml-2">Phone Number *</label>
              <div className="flex items-center bg-[var(--bg-base)] rounded-[12px] p-3 border border-black/5 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <Phone size={18} className="text-text-light mr-3" />
                <input 
                  type="text" 
                  value={reporterContact}
                  onChange={(e) => setReporterContact(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  className="bg-transparent border-none outline-none w-full text-text-dark font-sans placeholder:text-text-light/60"
                  required
                  pattern="\d{10}"
                  maxLength={10}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center ml-2">
              <label className="text-[0.85rem] font-bold text-text-dark">Images (Optional, up to 5)</label>
              <span className="text-[0.75rem] text-text-light font-bold">{imageFiles.length}/5 uploaded</span>
            </div>
            
            <div className={`border-2 border-dashed ${imageFiles.length > 0 ? 'border-primary/50 bg-primary/5' : 'border-black/20 bg-white/50'} rounded-[16px] p-6 text-center transition-all`}>
              
              <div className="flex flex-wrap gap-4 mb-4 justify-center">
                {imagePreviews.map((preview, index) => (
                  <div key={preview} className="relative inline-block w-[100px] h-[100px]">
                    <img src={preview} alt={`Preview ${index + 1}`} className="rounded-[12px] w-full h-full object-cover shadow-sm border border-white/50" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 cursor-pointer hover:bg-red-600 transition-colors shadow-md"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {imageFiles.length < 5 && (
                <label className="cursor-pointer flex flex-col items-center gap-3">
                  <div className="bg-white p-3 rounded-full shadow-sm text-text-light transition-transform hover:scale-105">
                    <ImageIcon size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-text-dark">Click to select images</span>
                    <span className="text-[0.8rem] text-text-light">JPG, PNG, WebP (max 5MB each)</span>
                  </div>
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png, image/webp" 
                    multiple
                    onChange={handleImageChange}
                    className="hidden" 
                    ref={fileInputRef}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="mt-4 pt-6 border-t border-black/5">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-primary text-white border-none py-[1rem] px-[1.5rem] rounded-[16px] font-bold text-[1.1rem] cursor-pointer flex justify-center items-center gap-2 transition-all duration-300 hover:bg-[#001122] disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isSubmitting ? (
                <span className="animate-pulse flex items-center gap-2">
                  <Upload size={20} className="animate-bounce" /> Processing...
                </span>
              ) : (
                <>
                  Submit Report <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ReportItemPage;
