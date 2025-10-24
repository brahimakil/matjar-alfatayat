import { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import './Dashboard.css';

interface Stats {
  totalProducts: number;
  totalCategories: number;
  totalAdmins: number;
  featuredProducts: number;
  totalStock: number;
  lowStockProducts: number;
  activeHeroImages: number;
  totalHeroImages: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  images: any[];
  isFeatured: boolean;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalCategories: 0,
    totalAdmins: 0,
    featuredProducts: 0,
    totalStock: 0,
    lowStockProducts: 0,
    activeHeroImages: 0,
    totalHeroImages: 0,
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, recentData, featuredData] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentProducts(),
        dashboardAPI.getFeaturedProducts(),
      ]);
      setStats(statsData);
      setRecentProducts(recentData);
      setFeaturedProducts(featuredData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMainImage = (product: Product) => {
    const mainImage = product.images?.find((img: any) => img.isMain);
    return mainImage?.url || mainImage?.data || product.images?.[0]?.url || product.images?.[0]?.data || '';
  };

  if (loading) {
    return <div className="dashboard-container"><div className="loading">Loading...</div></div>;
  }

  const statCards = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      bgColor: '#e3f2fd',
      icon: '📦',
      subtext: `${stats.featuredProducts} featured`,
    },
    {
      label: 'Total Categories',
      value: stats.totalCategories,
      bgColor: '#e8f5e9',
      icon: '📂',
      subtext: 'Active categories',
    },
    {
      label: 'Total Stock',
      value: stats.totalStock,
      bgColor: '#f3e5f5',
      icon: '📊',
      subtext: `${stats.lowStockProducts} low stock`,
    },
    {
      label: 'Total Admins',
      value: stats.totalAdmins,
      bgColor: '#fff3e0',
      icon: '👥',
      subtext: 'Active admins',
    },
    {
      label: 'Hero Images',
      value: stats.totalHeroImages,
      bgColor: '#fce4ec',
      icon: '🖼️',
      subtext: `${stats.activeHeroImages} active`,
    },
    {
      label: 'Low Stock Alert',
      value: stats.lowStockProducts,
      bgColor: '#ffebee',
      icon: '⚠️',
      subtext: 'Products < 10 units',
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to your admin dashboard</p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p>{stat.label}</p>
                <h2>{stat.value}</h2>
                <span className="stat-subtext">{stat.subtext}</span>
              </div>
              <div className="stat-icon" style={{ backgroundColor: stat.bgColor }}>
                <span style={{ fontSize: '32px' }}>{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="content-grid">
        <div className="content-card">
          <h2>Recent Products</h2>
          {recentProducts.length > 0 ? (
            <div className="products-list">
              {recentProducts.map((product) => (
                <div key={product.id} className="product-item">
                  <img src={getMainImage(product)} alt={product.name} />
                  <div className="product-details">
                    <h4>{product.name}</h4>
                    <p className="product-category">{product.category}</p>
                    <div className="product-meta">
                      <span className="product-price">${product.price}</span>
                      <span className={`product-stock ${product.stock < 10 ? 'low' : ''}`}>
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No products yet</div>
          )}
        </div>

        <div className="content-card">
          <h2>Featured Products</h2>
          {featuredProducts.length > 0 ? (
            <div className="products-list">
              {featuredProducts.map((product) => (
                <div key={product.id} className="product-item">
                  <img src={getMainImage(product)} alt={product.name} />
                  <div className="product-details">
                    <h4>{product.name}</h4>
                    <p className="product-category">{product.category}</p>
                    <div className="product-meta">
                      <span className="product-price">${product.price}</span>
                      <span className="featured-badge">⭐ Featured</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No featured products yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
