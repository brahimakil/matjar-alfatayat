import { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI, uploadAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './Products.css';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  category: string;
  colors: Array<{ name: string; value: string }>;
  images: Array<any>;
  mainImageId: string;
  isFeatured: boolean;
  dimensions: { length: number | null; width: number | null; height: number | null };
  weight: number | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
}

const Products = () => {
  const { admin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentLimit, setCurrentLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: '',
    category: '',
    isFeatured: false,
    colors: [] as Array<{ name: string; value: string }>,
    images: [] as Array<any>,
    mainImageId: '',
    dimensions: { length: null as number | null, width: null as number | null, height: null as number | null },
    weight: null as number | null,
  });

  const [colorInput, setColorInput] = useState({ name: '', value: '#000000' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productsAPI.getAll({ limit: 10 }), // Load only 10 products
        categoriesAPI.getAll(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setHasMore(productsData.length === 10);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const newLimit = currentLimit + 10;
      const productsData = await productsAPI.getAll({ limit: newLimit });
      setProducts(productsData);
      setCurrentLimit(newLimit);
      setHasMore(productsData.length === newLimit);
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const fileArray = Array.from(files);
      const results = await uploadAPI.multiple(fileArray);
      
      const newImages = results.map((result: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        url: result.url,
        name: result.name,
        size: result.size,
        type: result.type,
        isMain: formData.images.length === 0 && index === 0,
      }));

      const updatedImages = [...formData.images, ...newImages];
      setFormData({
        ...formData,
        images: updatedImages,
        mainImageId: formData.mainImageId || newImages[0]?.id || '',
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const setMainImage = (imageId: string) => {
    const updatedImages = formData.images.map(img => ({
      ...img,
      isMain: img.id === imageId,
    }));
    setFormData({ ...formData, images: updatedImages, mainImageId: imageId });
  };

  const removeImage = (imageId: string) => {
    const updatedImages = formData.images.filter(img => img.id !== imageId);
    let newMainImageId = formData.mainImageId;
    
    if (formData.mainImageId === imageId && updatedImages.length > 0) {
      newMainImageId = updatedImages[0].id;
      updatedImages[0].isMain = true;
    }
    
    setFormData({ ...formData, images: updatedImages, mainImageId: newMainImageId });
  };

  const addColor = () => {
    if (!colorInput.name) return;
    setFormData({
      ...formData,
      colors: [...formData.colors, { ...colorInput }],
    });
    setColorInput({ name: '', value: '#000000' });
  };

  const removeColor = (index: number) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId) {
      alert('Please select a category');
      return;
    }

    const selectedCategory = categories.find(c => c.id === formData.categoryId);
    
    const productData = {
      ...formData,
      category: selectedCategory?.name || '',
      createdBy: admin?.email || '',
      updatedBy: admin?.email || '',
    };

    try {
      if (editing) {
        await productsAPI.update(editing.id, productData);
      } else {
        await productsAPI.create(productData);
      }
      fetchData();
      handleCloseModal();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      category: product.category,
      isFeatured: product.isFeatured,
      colors: product.colors || [],
      images: product.images || [],
      mainImageId: product.mainImageId || '',
      dimensions: product.dimensions || { length: null, width: null, height: null },
      weight: product.weight || null,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productsAPI.delete(id);
      fetchData();
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: '',
      category: '',
      isFeatured: false,
      colors: [],
      images: [],
      mainImageId: '',
      dimensions: { length: null, width: null, height: null },
      weight: null,
    });
    setColorInput({ name: '', value: '#000000' });
  };

  const getMainImage = (product: Product) => {
    const mainImg = product.images?.find(img => img.isMain || img.id === product.mainImageId);
    return mainImg?.url || product.images?.[0]?.url;
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Product
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search products by name, description, or category..."
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

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            {getMainImage(product) && (
              <img src={getMainImage(product)} alt={product.name} className="product-image" />
            )}
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-category">{product.category}</p>
              <p className="product-price">${product.price.toFixed(2)}</p>
              <p className="product-stock">Stock: {product.stock}</p>
              {product.isFeatured && <span className="featured-badge">Featured</span>}
              <div className="card-actions">
                <button onClick={() => handleEdit(product)} className="btn-edit">Edit</button>
                <button onClick={() => handleDelete(product.id)} className="btn-delete">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && !loading && (
        <div className="load-more-container">
          <button 
            className="btn-load-more" 
            onClick={loadMore} 
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading...' : 'Load More Products'}
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label>Stock *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    Featured Product
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Colors</label>
                <div className="color-input-group">
                  <input
                    type="text"
                    placeholder="Color name"
                    value={colorInput.name}
                    onChange={(e) => setColorInput({ ...colorInput, name: e.target.value })}
                  />
                  <input
                    type="color"
                    value={colorInput.value}
                    onChange={(e) => setColorInput({ ...colorInput, value: e.target.value })}
                  />
                  <button type="button" onClick={addColor} className="btn-add-color">Add</button>
                </div>
                <div className="colors-list">
                  {formData.colors.map((color, index) => (
                    <div key={index} className="color-item">
                      <div className="color-preview" style={{ backgroundColor: color.value }}></div>
                      <span>{color.name}</span>
                      <button type="button" onClick={() => removeColor(index)} className="btn-remove">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Product Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                <div className="images-grid">
                  {formData.images.map((img) => (
                    <div key={img.id} className={`image-item ${img.isMain ? 'main-image' : ''}`}>
                      <img src={img.url} alt={img.name} />
                      {img.isMain && <span className="main-badge">Main</span>}
                      <div className="image-actions">
                        <button type="button" onClick={() => setMainImage(img.id)} className="btn-set-main">
                          Set Main
                        </button>
                        <button type="button" onClick={() => removeImage(img.id)} className="btn-remove-img">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;

