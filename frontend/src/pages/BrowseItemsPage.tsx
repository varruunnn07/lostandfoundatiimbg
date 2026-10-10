import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

import { useAuth } from '../lib/AuthContext';
import { MapPin, Clock, Search, Package, User, CheckCircle, Lock, Laptop, Wallet, Key, FileText, Shirt } from 'lucide-react';

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

type FilterMode = 'all' | 'lost' | 'found' | 'resolved';

const BrowseItemsPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [locationQuery, setLocationQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [filterMode, user]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const statusToFetch = filterMode === 'resolved' ? 'collected' : 'available';
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('status', statusToFetch)
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

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getCategoryIcon = (category: string, size = 14) => {
    switch (category) {
      case 'Electronics': return <Laptop size={size} />;
      case 'Wallets/Bags': return <Wallet size={size} />;
      case 'Keys': return <Key size={size} />;
      case 'Documents': return <FileText size={size} />;
      case 'Clothing': return <Shirt size={size} />;
      default: return <Package size={size} />;
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const locationStr = (item.item_type === 'lost' ? item.lost_location : item.found_location) || '';
    const matchesLocation = locationStr.toLowerCase().includes(locationQuery.toLowerCase());

    const matchesType = (filterMode === 'all' || filterMode === 'resolved')
      ? true
      : item.item_type === filterMode;

    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory && matchesLocation;
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
        <div className="p-10 max-w-[500px] w-full text-center flex flex-col items-center bg-white border-none shadow-apple rounded-[16px]">
          <div className="bg-primary/10 p-5 rounded-full mb-6">
            <Lock size={48} className="text-primary" />
          </div>
          <h2 className="text-[2rem] font-extrabold mb-3 text-primary leading-tight">Authentication Required</h2>
          <p className="text-text-light mb-8 text-[1.1rem]">Please login to see/browse products.</p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link
              to="/auth"
              state={{ from: { pathname: '/browse' } }}
              className="bg-primary text-white py-3 px-8 rounded-[50px] font-bold no-underline transition-all hover:bg-black hover:scale-105 shadow-md flex-1 max-w-[200px]"
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
        <div className="w-full">
          <h1 className="text-[3rem] font-extrabold leading-tight text-primary mb-2">
            Browse Items
          </h1>
          <p className="text-text-light text-[1.1rem]">
            {filterMode === 'resolved'
              ? 'Items that have been successfully returned.'
              : 'Help return lost items, or find what you lost.'}
          </p>
        </div>
      </div>

      {/* Streamlined Search and Filters Bar */}
      <div className="bg-white rounded-[16px] p-4 flex flex-col gap-4 border-none shadow-apple">
        {/* Top row: Search input */}
        <div className="flex items-center bg-[var(--bg-base)] rounded-[12px] px-4 py-3 border border-black/5 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Search size={18} className="text-text-light mr-3" />
          <input
            type="text"
            placeholder="Search for an item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-text-dark font-sans placeholder:text-text-light/60"
            maxLength={100}
          />
        </div>

        {/* Bottom row: Pills and Dropdowns */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          {/* Segmented Pills */}
          <div className="flex bg-[var(--bg-base)] p-1 rounded-[12px] border border-black/5 w-full lg:w-auto overflow-x-auto">
            {(['all', 'lost', 'found', 'resolved'] as FilterMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`flex-1 lg:flex-none py-2 px-5 rounded-[8px] font-bold text-[0.9rem] capitalize transition-all duration-300 whitespace-nowrap ${filterMode === mode
                    ? 'bg-white text-primary shadow-sm border border-black/5'
                    : 'text-text-light hover:text-primary bg-transparent border border-transparent'
                  }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="flex items-center bg-[var(--bg-base)] rounded-[12px] px-4 py-2 border border-black/5 focus-within:bg-white transition-all w-full sm:w-auto">
              <MapPin size={16} className="text-text-light mr-2" />
              <input
                type="text"
                placeholder="Campus Location..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-text-dark font-sans text-[0.9rem] placeholder:text-text-light/60 min-w-[120px]"
                maxLength={50}
              />
            </div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-4 py-2 rounded-[12px] font-semibold text-[0.9rem] transition-all border border-black/5 bg-[var(--bg-base)] focus:bg-white text-text-dark w-full sm:w-auto outline-none"
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
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin text-primary">
            <Package size={40} />
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-[16px] p-12 text-center flex flex-col items-center justify-center min-h-[300px] border-none shadow-apple">
          <Package size={48} className="text-text-light/30 mb-4" />
          <h3 className="text-[1.5rem] font-bold text-text-dark mb-2">No items found</h3>
          <p className="text-text-light">
            {searchQuery || locationQuery
              ? "Try adjusting your search or filters."
              : `There are currently no ${filterMode} items to display.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const imageUrl = getImageUrl(item.image_path);
            const locationStr = item.item_type === 'lost' ? item.lost_location : item.found_location;

            return (
              <Link to={`/item/${item.id}`} key={item.id} className="bg-white rounded-[16px] p-4 shadow-apple-hover flex flex-col h-full no-underline text-inherit">
                {/* Image Container */}
                <div className="relative rounded-[12px] overflow-hidden mb-4 bg-[var(--bg-base)] aspect-[4/3] flex-shrink-0">
                  {imageUrl ? (
                    <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <Package size={48} className="text-primary/20" />
                    </div>
                  )}

                  <span className={`absolute top-3 right-3 py-1 px-3 rounded-[50px] text-[0.7rem] font-bold shadow-sm backdrop-blur-md flex items-center gap-1.5 ${item.item_type === 'found'
                      ? 'bg-[#E2E8F0]/90 text-[#334155] border border-[#CBD5E1]/50' // Found (neutral/sage)
                      : 'bg-[#FEF3C7]/90 text-[#D97706] border border-[#FDE68A]/50' // Lost (warm amber)
                    }`}>
                    <Clock size={12} /> {item.item_type === 'found' ? 'Found' : 'Lost'} {timeAgo(item.created_at)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-[1.2rem] font-bold text-text-dark leading-tight">{item.name}</h3>
                    <span className="text-[0.75rem] bg-primary/5 text-primary px-2.5 py-1.5 rounded-[8px] font-semibold whitespace-nowrap ml-2 border border-primary/10 flex items-center gap-1.5">
                      {getCategoryIcon(item.category)} {item.category}
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

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[0.75rem] text-text-light flex items-center gap-1.5">
                        <Clock size={13} /> {new Date(item.created_at).toLocaleDateString()}
                      </span>

                      {filterMode === 'resolved' && item.collected_at && (
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
