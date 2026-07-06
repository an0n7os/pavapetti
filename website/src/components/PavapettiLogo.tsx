import React from "react";
import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  variant?: "light" | "dark" | "primary";
}

export default function PavapettiLogo({ 
  className = "", 
  size = 44, 
  showText = true,
  variant = "primary" 
}: LogoProps) {
  
  // The new logo is a beautiful wood-carved banner asset that already contains the name "PAVAPETTI"
  return (
    <div className={`flex items-center group cursor-pointer ${className}`}>
      <motion.img 
        src="/pavapetti-logo-new.webp" 
        alt="Heritage Artifacts" 
        style={{ height: size * 1.5 }}
        className="w-auto object-contain transition-transform duration-500 group-hover:scale-105 filter drop-shadow-sm"
        whileTap={{ scale: 0.98 }}
      />
    </div>
  );
}
