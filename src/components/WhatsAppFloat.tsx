import { useState, useEffect } from 'react';
import { publicAPI } from '../services/api';
import './WhatsAppFloat.css';

interface WhatsAppSettings {
  countryCode: string;
  phoneNumber: string;
}

const WhatsAppFloat = () => {
  const [whatsapp, setWhatsapp] = useState<WhatsAppSettings | null>(null);

  useEffect(() => {
    fetchWhatsApp();
  }, []);

  const fetchWhatsApp = async () => {
    try {
      const data = await publicAPI.getWhatsApp();
      setWhatsapp(data);
    } catch (error) {
      console.error('Error fetching WhatsApp:', error);
    }
  };

  const handleClick = () => {
    if (!whatsapp || !whatsapp.phoneNumber) return;

    const phoneNumber = `${whatsapp.countryCode}${whatsapp.phoneNumber}`.replace(/[^0-9]/g, '');
    const message = encodeURIComponent('مرحباً! أود الاستفسار عن منتجاتكم.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // Don't show button if no phone number
  if (!whatsapp || !whatsapp.phoneNumber) {
    return null;
  }

  return (
    <button 
      className="whatsapp-float"
      onClick={handleClick}
      aria-label="Contact us on WhatsApp"
    >
      <svg 
        viewBox="0 0 32 32" 
        className="whatsapp-icon"
        fill="currentColor"
      >
        <path d="M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 7.933-2.127c2.42 1.37 5.173 2.127 8.067 2.127 8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.467c-2.482 0-4.908-0.646-7.07-1.87l-0.507-0.292-5.245 1.405 1.405-5.233-0.321-0.528c-1.362-2.22-2.083-4.785-2.083-7.419 0-7.589 6.178-13.767 13.767-13.767s13.767 6.178 13.767 13.767c0 7.589-6.178 13.767-13.767 13.767zM21.713 18.461c-0.361-0.181-2.137-1.054-2.469-1.174s-0.572-0.181-0.813 0.181c-0.241 0.361-0.934 1.174-1.145 1.416s-0.422 0.271-0.783 0.090c-0.361-0.181-1.524-0.562-2.902-1.791-1.073-0.957-1.797-2.139-2.008-2.5s-0.022-0.556 0.159-0.737c0.163-0.163 0.361-0.422 0.542-0.633s0.241-0.361 0.361-0.603c0.121-0.241 0.060-0.452-0.030-0.633s-0.813-1.959-1.115-2.681c-0.293-0.703-0.592-0.608-0.813-0.619-0.211-0.010-0.452-0.012-0.693-0.012s-0.633 0.090-0.964 0.452c-0.331 0.361-1.266 1.236-1.266 3.013s1.295 3.495 1.476 3.737c0.181 0.241 2.55 3.888 6.177 5.456 0.863 0.373 1.537 0.596 2.063 0.763 0.867 0.277 1.656 0.238 2.281 0.144 0.696-0.104 2.137-0.873 2.439-1.717s0.301-1.567 0.211-1.717c-0.090-0.151-0.331-0.241-0.693-0.422z" />
      </svg>
      <span className="whatsapp-tooltip">تواصل معنا</span>
    </button>
  );
};

export default WhatsAppFloat;

