import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import FeaturedProducts from '../components/FeaturedProducts';
import CategoriesCarousel from '../components/CategoriesCarousel';
import { publicAPI } from '../services/api';
import './PublicHome.css';

interface Product {
  id: string;
  name: string;
  price: number;
  images: any[];
  category: string;
  description: string;
}

const PublicHome = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentLimit, setCurrentLimit] = useState(12);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await publicAPI.getProducts({
        categoryId: selectedCategory || undefined,
        search: searchQuery || undefined,
        limit: 12,
      });
      setProducts(data);
      setCurrentLimit(12);
      setHasMore(data.length === 12);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    setLoading(true);
    try {
      const newLimit = currentLimit + 12;
      const data = await publicAPI.getProducts({
        categoryId: selectedCategory || undefined,
        search: searchQuery || undefined,
        limit: newLimit,
      });
      setProducts(data);
      setCurrentLimit(newLimit);
      setHasMore(data.length === newLimit);
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const getMainImage = (product: Product) => {
    const mainImage = product.images?.find((img: any) => img.isMain);
    return mainImage?.url || mainImage?.data || product.images?.[0]?.url || product.images?.[0]?.data || '';
  };

  return (
    <div className="public-home">
      <HeroBanner />
      <FeaturedProducts />
      <CategoriesCarousel 
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
      />

      {/* All Products Section */}
      <section className="all-products-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">🛍️ جميع المنتجات</h2>
            <p className="section-subtitle">تصفح مجموعتنا الكاملة</p>
          </div>

          {/* Search Bar */}
          <div className="search-container">
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')}>
                ✕
              </button>
            )}
          </div>

          {/* Products Grid */}
          {loading && products.length === 0 ? (
            <div className="loading-state">جاري التحميل...</div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <p>لا توجد منتجات متاحة</p>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((product) => (
                  <Link 
                    to={`/product/${product.id}`} 
                    key={product.id} 
                    className="product-card"
                  >
                    <div className="product-image-wrapper">
                      <img src={getMainImage(product)} alt={product.name} />
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-category">{product.category}</p>
                      <p className="product-price">${product.price}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {hasMore && (
                <div className="load-more-container">
                  <button
                    className="load-more-btn"
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? 'جاري التحميل...' : 'تحميل المزيد'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default PublicHome;

