import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicAPI } from '../services/api';
import './ProductDetail.css';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: any[];
}

interface WhatsAppSettings {
  countryCode: string;
  phoneNumber: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [whatsapp, setWhatsapp] = useState<WhatsAppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProductAndWhatsApp();
    }
  }, [id]);

  const fetchProductAndWhatsApp = async () => {
    try {
      const [productData, whatsappData] = await Promise.all([
        publicAPI.getProductById(id!),
        publicAPI.getWhatsApp(),
      ]);
      setProduct(productData);
      setWhatsapp(whatsappData);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (!product || !whatsapp) return;

    const phoneNumber = `${whatsapp.countryCode}${whatsapp.phoneNumber}`.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `مرحباً، أنا مهتم بالمنتج: ${product.name}\nالسعر: $${product.price}\n\nهل يمكنني الحصول على مزيد من المعلومات؟`
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="loading-state">جاري التحميل...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-container">
        <div className="empty-state">
          <p>المنتج غير موجود</p>
          <button className="back-btn" onClick={() => navigate('/')}>
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  const mainImage = product.images?.[selectedImage]?.url || product.images?.[selectedImage]?.data || '';

  return (
    <div className="product-detail-container">
      <div className="product-detail-content">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← العودة
        </button>

        <div className="product-detail-grid">
          {/* Images Section */}
          <div className="product-images-section">
            <div className="main-image">
              <img src={mainImage} alt={product.name} />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="thumbnail-images">
                {product.images.map((img: any, index: number) => (
                  <button
                    key={index}
                    className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img.url || img.data} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="product-info-section">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-category-badge">{product.category}</p>
            
            <div className="product-price-section">
              <span className="product-price">${product.price}</span>
              <span className={`stock-badge ${product.stock < 10 ? 'low' : ''}`}>
                {product.stock > 0 ? `متوفر (${product.stock})` : 'غير متوفر'}
              </span>
            </div>

            <div className="product-description">
              <h3>الوصف</h3>
              <p>{product.description || 'لا يوجد وصف متاح'}</p>
            </div>

            {whatsapp && whatsapp.phoneNumber && (
              <button 
                className="whatsapp-btn"
                onClick={handleWhatsAppClick}
                disabled={product.stock === 0}
              >
                <span className="whatsapp-icon">💬</span>
                تواصل عبر واتساب
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

