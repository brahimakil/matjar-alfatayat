import { useState, useEffect, useRef } from 'react';
import { publicAPI } from '../services/api';
import './CategoriesCarousel.css';

interface Category {
  id: string;
  name: string;
  iconUrl?: string;
}

interface CategoriesCarouselProps {
  onCategorySelect: (categoryId: string | null) => void;
  selectedCategory: string | null;
}

const CategoriesCarousel = ({ onCategorySelect, selectedCategory }: CategoriesCarouselProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await publicAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return <div className="section-loading">Loading categories...</div>;
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="categories-section">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">📂 تصفح حسب الفئة</h2>
          <p className="section-subtitle">اختر الفئة التي تناسبك</p>
        </div>

        <div className="carousel-wrapper">
          <button className="carousel-btn prev" onClick={() => scroll('left')}>
            ❮
          </button>

          <div className="categories-carousel" ref={scrollRef}>
            <button
              className={`category-item ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => onCategorySelect(null)}
            >
              <span className="category-icon">🌟</span>
              <span className="category-name">الكل</span>
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => onCategorySelect(category.id)}
              >
                <div className="category-icon-wrapper">
                  <img 
                    src={category.iconUrl || ''} 
                    alt={category.name} 
                    className="category-icon-img" 
                  />
                </div>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>

          <button className="carousel-btn next" onClick={() => scroll('right')}>
            ❯
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoriesCarousel;

