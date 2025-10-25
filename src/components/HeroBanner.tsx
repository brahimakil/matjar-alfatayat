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
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % heroImages.length;
        console.log('Auto-changing slide from', prev, 'to', next);
        return next;
      });
    }, 5000); // Change slide every 5 seconds

    console.log('Interval started for', heroImages.length, 'images');

    return () => {
      console.log('Interval cleared');
      clearInterval(interval);
    };
  }, [heroImages.length]);
  
  const fetchHeroImages = async () => {
    try {
      const data = await publicAPI.getHeroImages();
      console.log('Fetched hero images:', data);
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

  return (
    <div className="hero-banner">
      <div className="hero-slides-container">
        {heroImages.map((hero, index) => (
          <div 
            key={hero.id}
            className={`hero-slide ${index === currentIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${hero.imageUrl || ''})` }}
          >
            {hero.overlayEnabled && (
              <div 
                className="hero-overlay" 
                style={{ opacity: hero.overlayOpacity }}
              />
            )}

            
            <div className="hero-content">
              <div 
                className="hero-text-box"
                style={{ 
                  backgroundColor: 'transparent'
                }}
              >
                {hero.headerText && (
                  <h1 
                    className="hero-header"
                    style={{ color: hero.headerColor }}
                  >
                    {hero.headerText}
                  </h1>
                )}
                {hero.descriptionText && (
                  <p 
                    className="hero-description"
                    style={{ color: hero.descriptionColor }}
                  >
                    {hero.descriptionText}
                  </p>
                )}
                {hero.link && (
                  <a 
                    href={hero.link} 
                    className="hero-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    اكتشف الآن
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}

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

