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
  
  const colors = {
    primary: {
      bg: "bg-primary",
      text: "text-primary-foreground",
      brand: "text-foreground",
      dot: "text-primary"
    },
    light: {
      bg: "bg-white",
      text: "text-primary",
      brand: "text-white",
      dot: "text-primary"
    },
    dark: {
      bg: "bg-primary",
      text: "text-primary-foreground",
      brand: "text-white",
      dot: "text-primary-foreground"
    }
  };

  const activeColors = colors[variant];

  return (
    <div className={`flex items-center gap-2.5 group cursor-pointer ${className}`}>
      {/* The Logo Mark */}
      <div className="relative" style={{ width: size, height: size }}>
        <motion.div 
          className={`absolute inset-0 ${activeColors.bg} rounded-[32%] shadow-xl flex items-center justify-center overflow-hidden`}
          whileHover={{ rotate: 5, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {/* Stylized 'P' with heritage motifs */}
          <svg 
            viewBox="0 0 100 100" 
            className={`w-3/5 h-3/5 ${activeColors.text} fill-current`}
          >
            <path d="M30 20 H55 C70 20 80 30 80 45 C80 60 70 70 55 70 H30 V85 H20 V20 H30 Z M30 30 V60 H55 C65 60 70 55 70 45 C70 35 65 30 55 30 H30 Z" />
            {/* Artistic dots representing craftsmanship */}
            <circle cx="25" cy="45" r="3" />
            <circle cx="42.5" cy="45" r="3" />
            <circle cx="60" cy="45" r="3" />
          </svg>
          
          {/* Subtle texture/gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        </motion.div>
        
        {/* Outer Ring Animation */}
        <motion.div 
          className="absolute -inset-1.5 rounded-[38%] border border-primary/20 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
        />
      </div>

      {/* The Wordmark */}
      {showText && (
        <div className="flex flex-col leading-[0.9]">
          <span className={`font-serif font-bold text-[24px] tracking-tight ${activeColors.brand} transition-colors duration-300`}>
            Pavapetti<span className={`font-light italic ml-0.5 ${activeColors.dot}`}>.</span>
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="h-[0.5px] w-2 bg-primary/40" />
            <span className={`text-[7.5px] tracking-[0.4em] uppercase font-black opacity-50 whitespace-nowrap ${variant === 'dark' ? 'text-white' : 'text-muted-foreground'}`}>
              Heritage Archives
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
