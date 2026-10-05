import { Link } from 'react-router-dom';
import { Mail, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#111111] text-white rounded-[40px] px-10 py-16 mt-16 md:mt-24 shadow-2xl overflow-hidden relative">
      {/* Top section: Logo, Tagline, Links */}
      <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
        
        {/* Left side: Logo & Tagline */}
        <div className="max-w-[500px]">
          <h2 className="text-[3rem] font-extrabold mb-4 tracking-tight leading-none flex items-center gap-3">
            <span className="text-secondary text-[3.5rem]">⚡</span>
            Lost<span className="text-secondary font-light">&</span>Found
          </h2>
          <p className="text-[#a0a0a0] text-[1.1rem] leading-relaxed font-medium">
            A central place for the IIM Bodhgaya community—<br />
            report, find, and let's get your items back!
          </p>
        </div>

        {/* Right side: Links */}
        <div className="flex gap-16 md:gap-24 mr-4 md:mr-10">
          <div className="flex flex-col gap-5">
            <Link to="/" className="text-[#e0e0e0] font-medium hover:text-secondary transition-colors no-underline">Home</Link>
            <Link to="/browse" className="text-[#e0e0e0] font-medium hover:text-secondary transition-colors no-underline">Browse Items</Link>
            <Link to="/report" className="text-[#e0e0e0] font-medium hover:text-secondary transition-colors no-underline">Report Item</Link>
            <Link to="/about" className="text-[#e0e0e0] font-medium hover:text-secondary transition-colors no-underline">About</Link>
          </div>
          <div className="flex flex-col gap-5">
            <a href="#" className="text-[#e0e0e0] font-medium hover:text-secondary transition-colors no-underline">IT Committee</a>
            <a href="#" className="text-[#e0e0e0] font-medium hover:text-secondary transition-colors no-underline">Instagram</a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] w-full bg-[#333333] mb-10"></div>

      {/* Middle section: Email & Opening hours */}
      <div className="flex flex-col md:flex-row gap-12 md:gap-40 mb-10">
        <div className="flex flex-col gap-3">
          <span className="text-secondary text-[0.8rem] font-bold tracking-widest uppercase flex items-center gap-2">
            <Mail size={14} /> Email
          </span>
          <a href="mailto:itcommittee@iimbg.ac.in" className="text-white text-[1.05rem] font-medium hover:text-secondary transition-colors no-underline">
            itcommittee@iimbg.ac.in
          </a>
        </div>
        
        <div className="flex flex-col gap-3">
          <span className="text-secondary text-[0.8rem] font-bold tracking-widest uppercase flex items-center gap-2">
            <Clock size={14} /> Platform Hours
          </span>
          <span className="text-white text-[1.05rem] font-medium">
            24/7 Available Online
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] w-full bg-[#333333] mb-8"></div>

      {/* Bottom section: Copyright & Logos */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-[#777777] text-[0.9rem] font-medium text-center md:text-left">
          Created by IT Committee Copyright © {new Date().getFullYear()} IIM Bodhgaya. All rights reserved.
        </div>
        <div className="flex items-center justify-center gap-6">
          <img src="/logo-itcomm.png" alt="IT Committee" className="h-12 object-contain opacity-70 hover:opacity-100 transition-opacity" />
          <img src="/logo-iimbg.png" alt="IIM Bodh Gaya" className="h-12 object-contain opacity-70 hover:opacity-100 transition-opacity" />
          <img src="/logo-aacsb.png" alt="AACSB" className="h-12 object-contain opacity-70 hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
