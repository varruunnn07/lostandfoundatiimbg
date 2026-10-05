import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const getNavClass = ({ isActive }: { isActive: boolean }) => {
    return `no-underline font-medium py-[0.6rem] px-[1.2rem] rounded-[50px] transition-all duration-300 text-[0.95rem] ${isActive ? 'bg-[rgba(0,31,63,0.1)] text-primary' : 'text-text-dark hover:bg-white/50'}`;
  };

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="flex flex-col md:flex-row justify-between items-center py-4 px-8 rounded-[50px] bg-white/50 backdrop-blur-[10px] border border-white/80 mb-16 gap-4 md:gap-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 border-r border-black/10 pr-6 hidden lg:flex">
          <img src="/logo-iimbg-new.png" alt="IIM Bodh Gaya" className="h-[75px] object-contain -my-4 ml-[-5px]" />
          <img src="/logo-aacsb.png" alt="AACSB" className="h-[45px] object-contain" />
        </div>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="IT Committee IIM Bodhgaya Logo" className="w-[45px] h-[45px] rounded-full object-cover border-2 border-white shadow-[0_4px_10px_rgba(0,0,0,0.1)]" />
          <div className="flex flex-col">
            <span className="font-extrabold text-[1.2rem] text-primary leading-tight">iT Comm.</span>
            <span className="text-[0.65rem] font-semibold tracking-[1px] text-text-light">IIM BODHGAYA</span>
          </div>
        </div>
      </div>

      <nav className="flex flex-wrap justify-center gap-4">
        <NavLink to="/" className={getNavClass}>Home</NavLink>
        <NavLink to="/report" className={getNavClass}>Report Item</NavLink>
        <NavLink to="/browse" className={getNavClass}>Browse Items</NavLink>
        <NavLink to="/about" className={getNavClass}>About</NavLink>
      </nav>

      <button 
        onClick={handleAuthAction}
        className="bg-text-dark text-white border-none py-[0.8rem] px-[1.5rem] rounded-[50px] font-semibold flex items-center gap-2 cursor-pointer transition-all duration-300 hover:bg-black hover:scale-105"
      >
        {user ? (
          <>
            <LogOut size={18} /> Sign Out
          </>
        ) : (
          <>
            <User size={18} /> Sign In
          </>
        )}
      </button>
    </header>
  );
};

export default Navbar;




