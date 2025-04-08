import React from "react";
import { Link } from "react-router-dom";
import LanguageSelector from "../LanguageSelector";
import { Button } from "../ui/button";
import { useLanguage } from "../../contexts/LanguageContext";

const Header = () => {
  const { t } = useLanguage();
  
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="flex w-full justify-between items-center bg-[#00353F] p-3 shadow-md">
      <div className="flex items-center gap-2 text-[#EEE] text-base px-2 py-0 transition-transform hover:scale-105">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7">
            <img src="/LabourNet_logo.png" alt="LabourNet Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-medium">LabourNet</span>
        </Link>
      </div>

      <nav className="flex items-center gap-6 max-sm:hidden">
        <Link to="/" className="text-[#EEE] text-sm px-4 py-0 hover:text-white transition-colors">
          {t("Dashboard")}
        </Link>
        <Link to="/Our-story" className="text-[#EEE] text-sm px-4 py-0 hover:text-white transition-colors">
          {t("OurStory")}
        </Link>
        <Link to="/journey" className="text-[#EEE] text-sm px-4 py-0 hover:text-white transition-colors">
          {t("Marketplace")}
        </Link>
      </nav>

      <div className="flex items-center gap-4">
        <LanguageSelector />
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs hover:bg-white/10 transition-colors"
          onClick={scrollToContact}
        >
          {t("Get In Touch")}
        </Button>
      </div>
    </header>
  );
};

export default Header;
