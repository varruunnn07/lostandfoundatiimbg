import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

import { useAuth } from '../lib/AuthContext';
import { MapPin, Clock, Search, Package, Phone, User, CheckCircle, Lock } from 'lucide-react';

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
  collected_at?: string;
}

const BrowseItemsPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'available' | 'collected'>('available');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [statusFilter, user]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('status', statusFilter)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };



  const getFirstImagePath = (path?: string): string | undefined => {
    if (!path) return undefined;
    try {
      const parsed = JSON.parse(path);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      return path;
    } catch {
      return path;
    }
  };

  const getImageUrl = (path?: string) => {
    const firstPath = getFirstImagePath(path);
    if (!firstPath) return null;
    const { data } = supabase.storage.from('item-images').getPublicUrl(firstPath);
    return data.publicUrl;
  };

  // Helper to get relative time
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'all' || item.item_type === typeFilter;
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  if (authLoading) {
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
        <div className="glass-panel p-10 max-w-[500px] w-full text-center flex flex-col items-center">
          <div className="bg-primary/10 p-5 rounded-full mb-6">
            <Lock size={48} className="text-primary" />
          </div>
          <h2 className="text-[2rem] font-extrabold mb-3 text-primary leading-tight">Authentication Required</h2>
          <p className="text-text-light mb-8 text-[1.1rem]">Please login to see/browse products.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link 
              to="/auth" 
              state={{ from: { pathname: '/browse' } }}
              className="bg-primary text-white py-3 px-8 rounded-[50px] font-bold no-underline transition-all hover:bg-[#001122] hover:scale-105 shadow-md flex-1 max-w-[200px]"
            >
              Login
            </Link>
            <Link 
              to="/auth" 
              state={{ from: { pathname: '/browse' } }}
              className="bg-white text-primary py-3 px-8 rounded-[50px] font-bold no-underline transition-all border-2 border-primary/20 hover:border-primary/50 shadow-sm flex-1 max-w-[200px]"
            >
              Create Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-2">
        <div className="w-full md:w-auto">
          <h1 className="text-[3rem] font-extrabold leading-tight text-primary mb-2">
            Browse Items
          </h1>
          <p className="text-text-light text-[1.1rem]">
            {statusFilter === 'available' 
              ? 'Help return lost items, or find what you lost.' 
              : 'Items that have been successfully returned.'}
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-[50px] border border-white/80 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('available')}
            className={`flex-1 md:flex-none py-2 px-6 rounded-[50px] font-bold text-[0.95rem] transition-all duration-300 ${
              statusFilter === 'available' ? 'bg-primary text-white shadow-md' : 'text-text-light hover:text-primary'
            }`}
          >
            Available
          </button>
          <button
            onClick={() => setStatusFilter('collected')}
            className={`flex-1 md:flex-none py-2 px-6 rounded-[50px] font-bold text-[0.95rem] transition-all duration-300 ${
              statusFilter === 'collected' ? 'bg-[#137333] text-white shadow-md' : 'text-text-light hover:text-[#137333]'
            }`}
          >
            Collected
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center bg-white/70 rounded-[12px] px-4 py-3 border border-white/80 focus-within:bg-white transition-all">
          <Search size={18} className="text-text-light mr-3" />
          <input 
            type="text" 
            placeholder="Search items..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-text-dark font-sans placeholder:text-text-light/60"
            maxLength={100}
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setTypeFilter('all')}
            className={`px-4 py-3 rounded-[12px] font-semibold text-[0.9rem] transition-all border ${
              typeFilter === 'all' ? 'bg-white border-primary/20 shadow-sm text-primary' : 'bg-transparent border-transparent text-text-light hover:bg-white/50'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setTypeFilter('lost')}
            className={`px-4 py-3 rounded-[12px] font-semibold text-[0.9rem] transition-all border ${
              typeFilter === 'lost' ? 'bg-white border-primary/20 shadow-sm text-primary' : 'bg-transparent border-transparent text-text-light hover:bg-white/50'
            }`}
          >
            Lost Only
          </button>
          <button 
            onClick={() => setTypeFilter('found')}
            className={`px-4 py-3 rounded-[12px] font-semibold text-[0.9rem] transition-all border ${
              typeFilter === 'found' ? 'bg-white border-[#137333]/20 shadow-sm text-[#137333]' : 'bg-transparent border-transparent text-text-light hover:bg-white/50'
            }`}
          >
            Found Only
          </button>
        </div>
        <div className="flex gap-2">
          <select 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-4 py-3 rounded-[12px] font-semibold text-[0.9rem] transition-all border bg-white/70 border-white/80 focus:bg-white text-text-dark"
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Wallets/Bags">Wallets/Bags</option>
            <option value="Keys">Keys</option>
            <option value="Documents">Documents</option>
            <option value="Clothing">Clothing</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin text-primary">
            <Package size={40} />
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <Package size={48} className="text-text-light/30 mb-4" />
          <h3 className="text-[1.5rem] font-bold text-text-dark mb-2">No items found</h3>
          <p className="text-text-light">
            {searchQuery 
              ? "Try adjusting your search or filters." 
              : `There are currently no ${statusFilter} items to display.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const imageUrl = getImageUrl(item.image_path);
            const locationStr = item.item_type === 'lost' ? item.lost_location : item.found_location;
            
            return (
              <Link to={`/item/${item.id}`} key={item.id} className="bg-white/60 rounded-[20px] p-4 border border-white/80 interactive-hover flex flex-col h-full no-underline text-inherit">
                {/* Image Container */}
                <div className="relative rounded-[16px] overflow-hidden mb-4 bg-[#e8e6e3] aspect-[4/3] flex-shrink-0">
                  {imageUrl ? (
                    <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#001f3f]/10 to-[#FFD444]/20">
                      <Package size={48} className="text-primary/20" />
                    </div>
                  )}
                  
                  <span className={`absolute top-3 right-3 py-1 px-3 rounded-[50px] text-[0.75rem] font-bold shadow-sm backdrop-blur-md ${
                    item.item_type === 'found' 
                      ? 'bg-[#e6f4ea]/90 text-[#137333] border border-[#137333]/20' 
                      : 'bg-white/90 text-primary border border-primary/20'
                  }`}>
                    {item.item_type === 'found' ? 'Found' : 'Lost'}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-[1.2rem] font-bold text-text-dark leading-tight">{item.name}</h3>
                    <span className="text-[0.7rem] bg-black/5 px-2 py-1 rounded-[8px] font-semibold text-text-light whitespace-nowrap ml-2">
                      {item.category}
                    </span>
                  </div>
                  
                  {item.description && (
                    <p className="text-[0.9rem] text-text-light mb-4 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-black/5">
                    <span className="text-[0.85rem] text-text-dark font-medium flex items-center gap-2">
                      <MapPin size={15} className="text-primary/70" /> 
                      {locationStr}
                    </span>
                    
                    <span className="text-[0.85rem] text-text-dark font-medium flex items-center gap-2">
                      <User size={15} className="text-primary/70" /> 
                      {item.reporter_name}
                    </span>

                    <span className="text-[0.85rem] text-text-dark font-medium flex items-center gap-2 mb-2">
                      <Phone size={15} className="text-primary/70" /> 
                      {item.reporter_contact}
                    </span>
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[0.75rem] text-text-light flex items-center gap-1.5">
                        <Clock size={13} /> {timeAgo(item.created_at)}
                      </span>
                      


                      {statusFilter === 'collected' && item.collected_at && (
                        <span className="text-[0.75rem] text-[#137333] font-bold flex items-center gap-1">
                          <CheckCircle size={13} /> 
                          Collected {timeAgo(item.collected_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default BrowseItemsPage;
