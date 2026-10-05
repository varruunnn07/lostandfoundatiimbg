import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavClass = ({ isActive }: { isActive: boolean }) => {
    return `no-underline font-medium py-[0.6rem] px-[1.2rem] rounded-[50px] transition-all duration-300 text-[0.95rem] ${isActive ? 'bg-[rgba(0,31,63,0.1)] text-primary' : 'text-text-dark hover:bg-white/50'}`;
  };

  const getMobileNavClass = ({ isActive }: { isActive: boolean }) => {
    return `no-underline font-medium py-3 px-6 rounded-2xl transition-all duration-300 text-[1.1rem] ${isActive ? 'bg-[rgba(0,31,63,0.1)] text-primary' : 'text-text-dark hover:bg-black/5'}`;
  };

  const handleAuthAction = () => {
    setIsMobileMenuOpen(false);
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <>
      <header className="flex justify-between items-center py-3 px-4 md:py-4 md:px-8 rounded-[50px] bg-white/50 backdrop-blur-[10px] border border-white/80 mb-8 md:mb-16 relative z-50">
        
        {/* Left Side: Logos */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 border-r border-black/10 pr-6 hidden lg:flex">
            <img src="/logo-iimbg-new.png" alt="IIM Bodh Gaya" className="h-[75px] object-contain -my-4 ml-[-5px]" />
            <img src="/logo-aacsb.png" alt="AACSB" className="h-[45px] object-contain" />
          </div>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="IT Committee IIM Bodhgaya Logo" className="w-[40px] h-[40px] md:w-[45px] md:h-[45px] rounded-full object-cover border-2 border-white shadow-[0_4px_10px_rgba(0,0,0,0.1)]" />
            <div className="flex flex-col">
              <span className="font-extrabold text-[1rem] md:text-[1.2rem] text-primary leading-tight">iT Comm.</span>
              <span className="text-[0.6rem] md:text-[0.65rem] font-semibold tracking-[1px] text-text-light">IIM BODHGAYA</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-wrap justify-center gap-2 lg:gap-4">
          <NavLink to="/" className={getNavClass}>Home</NavLink>
          <NavLink to="/report" className={getNavClass}>Report Item</NavLink>
          <NavLink to="/browse" className={getNavClass}>Browse Items</NavLink>
          <NavLink to="/about" className={getNavClass}>About</NavLink>
        </nav>

        {/* Desktop Auth Button */}
        <div className="hidden md:block">
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
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden flex items-center justify-center p-2 text-primary bg-white/50 rounded-full border border-white/50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#f0f4f8]/95 backdrop-blur-xl flex flex-col pt-24 px-6 pb-8 overflow-y-auto">
          <div className="flex flex-col gap-2 mb-10">
            <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className={getMobileNavClass}>Home</NavLink>
            <NavLink to="/report" onClick={() => setIsMobileMenuOpen(false)} className={getMobileNavClass}>Report Item</NavLink>
            <NavLink to="/browse" onClick={() => setIsMobileMenuOpen(false)} className={getMobileNavClass}>Browse Items</NavLink>
            <NavLink to="/about" onClick={() => setIsMobileMenuOpen(false)} className={getMobileNavClass}>About</NavLink>
          </div>
          
          <button 
            onClick={handleAuthAction}
            className="bg-primary text-white border-none py-4 px-6 rounded-[20px] font-bold text-[1.1rem] flex items-center justify-center gap-2 cursor-pointer w-full mt-auto shadow-lg"
          >
            {user ? (
              <>
                <LogOut size={20} /> Sign Out
              </>
            ) : (
              <>
                <User size={20} /> Sign In
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;
