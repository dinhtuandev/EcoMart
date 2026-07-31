import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-white font-bold text-lg">TechHub</span>
          <p className="text-sm mt-1">Website Thương mại Điện tử Thiết bị & Phụ kiện Công nghệ</p>
        </div>
        <div className="text-sm text-slate-500">
          © {new Date().getFullYear()} TechHub. All rights reserved. (Thanh toán COD)
        </div>
      </div>
    </footer>
  );
};

export default Footer;
