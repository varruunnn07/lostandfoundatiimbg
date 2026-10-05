import React, { useEffect, useState } from 'react';
import { Search, ArrowRight, Plus, Archive, Check, Users, Heart, MapPin, Clock, Package, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

interface Item {
  id: string;
  name: string;
  item_type: 'lost' | 'found';
  lost_location?: string;
  found_location?: string;
  image_path?: string;
  created_at: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [stats, setStats] = useState({
    reported: 0,
    returned: 0,
    members: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHomePageData() {
      try {
        // Fetch stats securely via RPC so unauthenticated users can see them without breaking RLS
        const { data, error } = await supabase.rpc('get_platform_stats');
        
        if (!error && data) {
          setStats({
            reported: data.reported || 0,
            returned: data.returned || 0,
            members: data.members || 0
          });
        } else if (error) {
          console.error('Error fetching stats via RPC (Ensure 005_platform_stats.sql is executed):', error);
        }

        // Only fetch items if logged in
        if (user) {
          const { data: items } = await supabase
            .from('items')
            .select('id, name, item_type, lost_location, found_location, image_path, created_at')
            .eq('status', 'available')
            .order('created_at', { ascending: false })
            .limit(6);

          if (items) {
            setRecentItems(items);
          }
        }
      } catch (error) {
        console.error('Error fetching home page data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHomePageData();
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // For simplicity, we navigate to browse. 
    // In a full implementation, BrowseItemsPage would read URL params to auto-filter.
    navigate('/browse'); 
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
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="max-w-[600px]">
          <p className="text-[0.8rem] font-bold tracking-[2px] text-text-light mb-4 uppercase">
            LOST & FOUND PORTAL <br /> Powered by <span className="text-secondary">IT Committee</span>
          </p>
          <h1 className="text-[3.5rem] lg:text-[4.5rem] font-extrabold leading-[1.1] mb-6 tracking-[-1px]">
            Lost Something?<br />Let's <span className="text-secondary">Find It.</span>
          </h1>
          <p className="text-[1.1rem] text-text-dark leading-[1.6] mb-10">
            A central place for the IIM Bodhgaya community<br />to report, find, and return lost items.
          </p>

          <form onSubmit={handleSearch} className="flex items-center p-[0.6rem] pl-[1.5rem] pr-[0.6rem] rounded-[50px] mb-8 bg-white/70 flex-col md:flex-row gap-2 md:gap-0 border border-white/80 shadow-sm focus-within:bg-white transition-all">
            <Search className="text-text-light mr-4 hidden md:block" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for items (e.g. laptop, ID card, bottle...)" 
              className="flex-1 border-none bg-transparent text-[1rem] outline-none text-text-dark font-sans w-full p-2 md:p-0"
              maxLength={100}
            />
            <button type="submit" className="bg-primary text-white border-none py-[0.8rem] px-[1.5rem] rounded-[50px] font-semibold cursor-pointer flex justify-center items-center gap-2 transition-all duration-300 hover:bg-[#001122] hover:scale-105 w-full md:w-auto">
              Search <ArrowRight size={18} />
            </button>
          </form>

          <div className="flex flex-col md:flex-row gap-6">
            <Link to="/report" className="glass-panel interactive-hover flex items-center p-5 gap-4 flex-1 no-underline text-inherit">
              <div className="w-[45px] h-[45px] rounded-[12px] flex items-center justify-center text-[1.5rem] bg-[#00509e1a] text-secondary">
                <Plus size={24} />
              </div>
              <div>
                <h3 className="text-[1.1rem] font-bold mb-1 text-text-dark">Report a Lost Item</h3>
                <p className="text-[0.85rem] text-text-light m-0">Can't find something?</p>
              </div>
              <ArrowRight className="ml-auto text-text-light" size={20} />
            </Link>
            
            <Link to="/report" className="glass-panel interactive-hover flex items-center p-5 gap-4 flex-1 no-underline text-inherit">
              <div className="w-[45px] h-[45px] rounded-[12px] flex items-center justify-center text-[1.5rem] bg-[#001f3f1a] text-primary">
                <Archive size={24} />
              </div>
              <div>
                <h3 className="text-[1.1rem] font-bold mb-1 text-text-dark">Report a Found Item</h3>
                <p className="text-[0.85rem] text-text-light m-0">Help it find its owner.</p>
              </div>
              <ArrowRight className="ml-auto text-text-light" size={20} />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center md:justify-between py-6 px-12 rounded-[20px] mt-4 bg-white/50 gap-4 border border-white/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-[45px] h-[45px] rounded-[12px] flex items-center justify-center text-[1.5rem] bg-[#00509e1a] text-secondary">
            <Archive size={24} />
          </div>
          <div>
            <h4 className="text-[1.5rem] font-extrabold leading-none">{stats.reported}</h4>
            <p className="text-[0.85rem] text-text-light font-medium m-0">Items Reported</p>
          </div>
        </div>
        <div className="w-[1px] h-[40px] bg-black/10 hidden md:block"></div>
        <div className="flex items-center gap-4">
          <div className="w-[45px] h-[45px] rounded-[12px] flex items-center justify-center text-[1.5rem] bg-[#e6f4ea] text-[#34a853]">
            <Check size={24} />
          </div>
          <div>
            <h4 className="text-[1.5rem] font-extrabold leading-none">{stats.returned}</h4>
            <p className="text-[0.85rem] text-text-light font-medium m-0">Items Returned</p>
          </div>
        </div>
        <div className="w-[1px] h-[40px] bg-black/10 hidden md:block"></div>
        <div className="flex items-center gap-4">
          <div className="w-[45px] h-[45px] rounded-[12px] flex items-center justify-center text-[1.5rem] bg-[#001f3f1a] text-primary">
            <Users size={24} />
          </div>
          <div>
            <h4 className="text-[1.5rem] font-extrabold leading-none">{stats.members}</h4>
            <p className="text-[0.85rem] text-text-light font-medium m-0">Community Members</p>
          </div>
        </div>
        <div className="w-[1px] h-[40px] bg-black/10 hidden md:block"></div>
        <div className="flex items-center gap-4">
          <div className="w-[45px] h-[45px] rounded-[12px] flex items-center justify-center text-[1.5rem] bg-[#001f3f1a] text-primary">
            <Heart size={24} fill="currentColor" />
          </div>
          <div>
            <p className="text-[0.85rem] text-text-light font-medium leading-[1.3] m-0">A Cleaner,<br/>Kinder Campus</p>
          </div>
        </div>
      </div>

      <section className="p-8 mt-4 bg-white/40 rounded-[20px] border border-white/80 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h2 className="text-[1.5rem] font-extrabold m-0">Recently Added Items</h2>
          {user && (
            <Link to="/browse" className="bg-white/80 border-none py-2 px-4 rounded-[50px] font-semibold text-[0.9rem] text-primary cursor-pointer flex items-center gap-1 transition-all duration-300 hover:bg-white hover:translate-x-[5px] no-underline">
              View All <ArrowRight size={16} />
            </Link>
          )}
        </div>

        {authLoading || loading ? (
          <div className="flex justify-center items-center py-12 relative z-10">
            <div className="animate-spin text-primary">
              <Package size={40} />
            </div>
          </div>
        ) : !user ? (
          <div className="text-center py-16 flex flex-col items-center relative z-10">
            <div className="bg-primary/10 p-5 rounded-full mb-6">
              <Lock size={40} className="text-primary" />
            </div>
            <h3 className="text-[1.5rem] font-bold text-primary mb-3">Authentication Required</h3>
            <p className="text-text-light mb-8 max-w-[400px]">Please login to view recent items and browse the portal.</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Link 
                to="/auth" 
                className="bg-primary text-white py-3 px-8 rounded-[50px] font-bold no-underline transition-all hover:bg-[#001122] hover:scale-105 shadow-md max-w-[200px]"
              >
                Login
              </Link>
            </div>
          </div>
        ) : recentItems.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="text-text-light/30 mb-4 mx-auto" />
            <h3 className="text-[1.2rem] font-bold text-text-dark mb-2">No recent items</h3>
            <p className="text-text-light">Be the first to report a lost or found item!</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
            {recentItems.map(item => {
              const imageUrl = getImageUrl(item.image_path);
              const locationStr = item.item_type === 'lost' ? item.lost_location : item.found_location;

              return (
                <Link to={`/item/${item.id}`} key={item.id} className="bg-white/60 rounded-[16px] p-3 border border-white/80 interactive-hover block no-underline text-inherit">
                  <div className="relative rounded-[12px] overflow-hidden mb-4 bg-[#e8e6e3] aspect-[4/3]">
                    {imageUrl ? (
                      <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#001f3f]/10 to-[#FFD444]/20">
                        <Package size={32} className="text-primary/20" />
                      </div>
                    )}
                    <span className={`absolute top-2 right-2 py-1 px-3 rounded-[50px] text-[0.7rem] font-bold shadow-sm backdrop-blur-md ${
                      item.item_type === 'found' 
                        ? 'bg-[#e6f4ea]/90 text-[#137333] border border-[#137333]/20' 
                        : 'bg-white/90 text-primary border border-primary/20'
                    }`}>
                      {item.item_type === 'found' ? 'Found' : 'Lost'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[1rem] font-bold mb-2 text-text-dark leading-tight">{item.name}</h3>
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.8rem] text-text-light flex items-center gap-2 truncate">
                        <MapPin size={14} className="flex-shrink-0" /> {locationStr}
                      </span>
                      <span className="text-[0.8rem] text-text-light flex items-center gap-2">
                        <Clock size={14} className="flex-shrink-0" /> {timeAgo(item.created_at)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default HomePage;
