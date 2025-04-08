import React, { useEffect } from 'react';

const LanguageSelector = () => {
  useEffect(() => {
    // Add Google Translate script to head
    const addScript = () => {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
    };

    // Initialize Google Translate
    window.googleTranslateElementInit = function() {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          includedLanguages: 'en,hi,mr,te,ml,ta,kn,gu,pa'
        },
        'google_translate_element'
      );
    };

    // Add script if it doesn't exist
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      addScript();
    }

    // Hide Google Translate banner and fix body position
    const hideBanner = () => {
      const banner = document.querySelector('.goog-te-banner-frame');
      if (banner) {
        banner.style.display = 'none';
      }
      document.body.style.top = '0';
      document.body.style.position = 'static';
      document.body.style.marginTop = '40px'; // Add margin to prevent overlap
    };

    // Check for banner periodically
    const interval = setInterval(hideBanner, 100);

    return () => {
      clearInterval(interval);
      delete window.googleTranslateElementInit;
    };
  }, []);

  return (
    <div className="relative">
      <div id="google_translate_element"></div>
      <style jsx="true">{`
        #google_translate_element {
          display: inline-block;
        }
        #google_translate_element .goog-te-gadget {
          font-family: inherit;
        }
        #google_translate_element .goog-te-gadget-simple {
          background-color: transparent !important;
          border: none !important;
          padding: 0 !important;
          line-height: 1.5 !important;
          color: white ;
        }
        #google_translate_element .goog-te-gadget-simple img {
          display: none;
          color: white !important;
        }
        #google_translate_element .goog-te-gadget-simple .goog-te-menu-value {
          color: white !important;
          font-size: 14px;
        }
        #google_translate_element .goog-te-gadget-simple .goog-te-menu-value span {
          color: white !important;
          border: none !important;
          font-size: inherit !important;
        }
        .goog-te-banner-frame {
          display: none !important;
        }
        body {
          top: 0 !important;
          position: static !important;
          margin-top: 40px !important;
          color: white !important;
        }
        .goog-te-gadget-simple {
          background-color: transparent !important;
          border: none !important;
        }
        .goog-te-menu-value {
          color: white !important;
        }
        .goog-te-menu-value:hover {
          text-decoration: none !important;
        }
        .goog-te-menu-value span {
          color: white !important;
        }
        .goog-te-menu-value span:hover {
          color: white !important;
        }
        .goog-te-menu-value:before {
          color: white !important;
        }
        .goog-te-menu-value:after {
          color: white !important;
        }
        .goog-te-menu-value * {
          color: white !important;
        }
        .goog-te-menu-value a {
          color: white !important;
        }
        .goog-te-menu-value a:hover {
          color: white !important;
        }
        .goog-te-menu-value a:visited {
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default LanguageSelector;
