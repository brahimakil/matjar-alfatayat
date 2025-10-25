import { useState, useEffect } from 'react';
import { publicAPI } from '../services/api';
import './HeroBanner.css';

interface HeroImage {
  id: string;
  imageUrl: string;
  headerText: string;
  headerColor: string;
  descriptionText: string;
  descriptionColor: string;
  textBackgroundColor: string;
  link?: string;
  isActive: boolean;
  overlayEnabled: boolean;
  overlayOpacity: number;
  order: number;
}

const HeroBanner = () => {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroImages();
  }, []);

  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % heroImages.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [heroImages.length]);

  const fetchHeroImages = async () => {
    try {
      const data = await publicAPI.getHeroImages();
      setHeroImages(data);
    } catch (error) {
      console.error('Error fetching hero images:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  };

  if (loading) {
    return <div className="hero-loading">Loading...</div>;
  }

  if (heroImages.length === 0) {
    return null;
  }

  const currentHero = heroImages[currentIndex];

  const heroImageUrl = currentHero.imageUrl || '';

  return (
    <div className="hero-banner">
      <div className="hero-slide" style={{ backgroundImage: `url(${heroImageUrl})` }}>
        {currentHero.overlayEnabled && (
          <div 
            className="hero-overlay" 
            style={{ opacity: currentHero.overlayOpacity }}
          />
        )}
        
        <div className="hero-content">
          <div 
            className="hero-text-box"
            style={{ 
              backgroundColor: currentHero.textBackgroundColor 
                ? currentHero.textBackgroundColor.replace(/rgba?\(([^)]+)\)/, (match, values) => {
                    const parts = values.split(',').map((v: string) => v.trim());
                    if (parts.length === 4) {
                      // If already rgba, reduce opacity to 30%
                      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, 0.1)`;
                    } else if (parts.length === 3) {
                      // If rgb, convert to rgba with 30% opacity
                      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, 0.1)`;
                    }
                    return match;
                  })
                : 'rgba(0, 0, 0, 0.3)'
            }}
          >
            {currentHero.headerText && (
              <h1 
                className="hero-header"
                style={{ color: currentHero.headerColor }}
              >
                {currentHero.headerText}
              </h1>
            )}
            {currentHero.descriptionText && (
              <p 
                className="hero-description"
                style={{ color: currentHero.descriptionColor }}
              >
                {currentHero.descriptionText}
              </p>
            )}
            {currentHero.link && (
              <a 
                href={currentHero.link} 
                className="hero-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                اكتشف الآن
              </a>
            )}
          </div>
        </div>

        {heroImages.length > 1 && (
          <>
            <button className="hero-nav prev" onClick={goToPrevious}>
              ❮
            </button>
            <button className="hero-nav next" onClick={goToNext}>
              ❯
            </button>

            <div className="hero-dots">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HeroBanner;

