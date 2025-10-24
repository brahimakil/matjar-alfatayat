import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../services/api';
import './FeaturedProducts.css';

interface Product {
  id: string;
  name: string;
  price: number;
  images: any[];
  category: string;
  isFeatured: boolean;
}

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const data = await publicAPI.getFeaturedProducts(8);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMainImage = (product: Product) => {
    const mainImage = product.images?.find((img: any) => img.isMain);
    return mainImage?.url || mainImage?.data || product.images?.[0]?.url || product.images?.[0]?.data || '';
  };

  if (loading) {
    return <div className="section-loading">Loading featured products...</div>;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="featured-section">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">✨ المنتجات المميزة</h2>
          <p className="section-subtitle">اكتشف أفضل منتجاتنا المختارة بعناية</p>
        </div>

        <div className="products-grid">
          {products.map((product) => (
            <Link 
              to={`/product/${product.id}`} 
              key={product.id} 
              className="product-card"
            >
              <div className="product-image-wrapper">
                <img src={getMainImage(product)} alt={product.name} />
                <span className="featured-badge">⭐ مميز</span>
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-category">{product.category}</p>
                <p className="product-price">${product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;

