import { Link } from 'react-router-dom';
import { Mail, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-none shadow-apple text-text-dark rounded-[24px] px-6 md:px-10 py-12 md:py-16 mt-8 md:mt-24 overflow-hidden relative">
      {/* Top section: Logo, Tagline, Links */}
      <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
        
        {/* Left side: Logo & Tagline */}
        <div className="max-w-[500px]">
          <h2 className="text-[2.2rem] md:text-[3rem] font-extrabold mb-4 tracking-tight leading-none flex items-center gap-3 text-primary">
            <img src="/logo.png" alt="IT Committee" className="h-[2.5rem] w-[2.5rem] md:h-[3.5rem] md:w-[3.5rem] rounded-full object-cover" />
            Lost<span className="text-secondary drop-shadow-sm font-light">&</span>Found
          </h2>
          <p className="text-text-light text-[1.1rem] leading-relaxed font-medium">
            A central place for the IIM Bodhgaya community—<br />
            report, find, and let's get your items back!
          </p>
        </div>

        {/* Right side: Links */}
        <div className="flex gap-16 md:gap-24 mr-4 md:mr-10">
          <div className="flex flex-col gap-5">
            <Link to="/" className="text-text-dark/80 font-medium hover:text-primary transition-colors no-underline">Home</Link>
            <Link to="/browse" className="text-text-dark/80 font-medium hover:text-primary transition-colors no-underline">Browse Items</Link>
            <Link to="/report" className="text-text-dark/80 font-medium hover:text-primary transition-colors no-underline">Report Item</Link>
            <Link to="/about" className="text-text-dark/80 font-medium hover:text-primary transition-colors no-underline">About</Link>
          </div>
          <div className="flex flex-col gap-5">
            <a href="#" className="text-text-dark/80 font-medium hover:text-primary transition-colors no-underline">IT Committee</a>
            <a href="#" className="text-text-dark/80 font-medium hover:text-primary transition-colors no-underline">Instagram</a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] w-full bg-black/10 mb-10"></div>

      {/* Middle section: Email & Opening hours */}
      <div className="flex flex-col md:flex-row gap-12 md:gap-40 mb-10">
        <div className="flex flex-col gap-3">
          <span className="text-primary text-[0.8rem] font-bold tracking-widest uppercase flex items-center gap-2">
            <Mail size={14} /> Email
          </span>
          <a href="mailto:itcommittee@iimbg.ac.in" className="text-text-dark text-[1.05rem] font-medium hover:text-primary transition-colors no-underline">
            itcommittee@iimbg.ac.in
          </a>
        </div>
        
        <div className="flex flex-col gap-3">
          <span className="text-primary text-[0.8rem] font-bold tracking-widest uppercase flex items-center gap-2">
            <Clock size={14} /> Platform Hours
          </span>
          <span className="text-text-dark text-[1.05rem] font-medium">
            24/7 Available Online
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] w-full bg-black/10 mb-8"></div>

      {/* Bottom section: Copyright & Logos */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-text-light text-[0.9rem] font-medium text-center md:text-left">
          Created by IT Committee Copyright © {new Date().getFullYear()} IIM Bodhgaya. All rights reserved.
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <img src="/logo.png" alt="IT Committee" className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover opacity-70 hover:opacity-100 transition-opacity" />
          <img src="/logo-iimbg.png" alt="IIM Bodh Gaya" className="h-10 md:h-12 object-contain opacity-70 hover:opacity-100 transition-opacity" />
          <img src="/logo-aacsb.png" alt="AACSB" className="h-10 md:h-12 object-contain opacity-70 hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;

