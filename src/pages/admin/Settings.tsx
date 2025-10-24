import { useState, useEffect } from 'react';
import { settingsAPI, uploadAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './Settings.css';

interface HeroImage {
  id: string;
  imageUrl: string;
  headerText: string;
  headerColor: string;
  descriptionText: string;
  descriptionColor: string;
  textBackgroundColor: string;
  link: string;
  order: number;
  isActive: boolean;
  overlayEnabled: boolean;
  overlayOpacity: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const Settings = () => {
  const { admin } = useAuth();
  const [activeTab, setActiveTab] = useState('hero');
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<HeroImage | null>(null);
  const [uploading, setUploading] = useState(false);

  const [whatsapp, setWhatsapp] = useState({
    countryCode: '+961',
    phoneNumber: '',
  });

  const [formData, setFormData] = useState({
    imageUrl: '',
    headerText: '',
    headerColor: '#000000',
    descriptionText: '',
    descriptionColor: '#ffffff',
    textBackgroundColor: 'rgba(0,0,0,0.4)',
    link: '',
    isActive: true,
    overlayEnabled: true,
    overlayOpacity: 0.4,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [heroData, whatsappData] = await Promise.all([
        settingsAPI.getAllHeroImages(),
        settingsAPI.getWhatsApp(),
      ]);
      // Sort by order to ensure correct display
      const sortedHeroData = heroData.sort((a: any, b: any) => a.order - b.order);
      setHeroImages(sortedHeroData);
      setWhatsapp({
        countryCode: whatsappData.countryCode || '+961',
        phoneNumber: whatsappData.phoneNumber || '',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadAPI.single(file);
      setFormData({ ...formData, imageUrl: result.url });
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitHero = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        order: editing ? editing.order : (heroImages.length > 0 ? Math.max(...heroImages.map(h => h.order)) + 1 : 1),
        createdBy: admin?.email || '',
        updatedBy: admin?.email || '',
      };

      if (editing) {
        await settingsAPI.updateHeroImage(editing.id, data);
      } else {
        await settingsAPI.createHeroImage(data);
      }
      fetchData();
      handleCloseModal();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save hero image');
    }
  };

  const handleEdit = (hero: HeroImage) => {
    setEditing(hero);
    setFormData({
      imageUrl: hero.imageUrl,
      headerText: hero.headerText,
      headerColor: hero.headerColor,
      descriptionText: hero.descriptionText,
      descriptionColor: hero.descriptionColor,
      textBackgroundColor: hero.textBackgroundColor,
      link: hero.link || '',
      isActive: hero.isActive !== false,
      overlayEnabled: hero.overlayEnabled !== false,
      overlayOpacity: hero.overlayOpacity !== undefined ? hero.overlayOpacity : 0.4,
    });
    setShowModal(true);
  };

  const toggleActive = async (hero: HeroImage) => {
    try {
      await settingsAPI.updateHeroImage(hero.id, {
        isActive: !hero.isActive,
        updatedBy: admin?.email || '',
      });
      fetchData();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const moveOrder = async (hero: HeroImage, direction: 'up' | 'down') => {
    const currentIndex = heroImages.findIndex(h => h.id === hero.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= heroImages.length) return;

    const targetHero = heroImages[targetIndex];

    try {
      // Swap orders between the two items
      await Promise.all([
        settingsAPI.updateHeroImage(hero.id, {
          order: targetHero.order,
          updatedBy: admin?.email || '',
        }),
        settingsAPI.updateHeroImage(targetHero.id, {
          order: hero.order,
          updatedBy: admin?.email || '',
        }),
      ]);
      
      // Immediately update local state for instant UI feedback
      const newHeroImages = [...heroImages];
      newHeroImages[currentIndex] = { ...hero, order: targetHero.order };
      newHeroImages[targetIndex] = { ...targetHero, order: hero.order };
      newHeroImages.sort((a, b) => a.order - b.order);
      setHeroImages(newHeroImages);
      
      // Also fetch fresh data from server
      await fetchData();
    } catch (error) {
      alert('Failed to update order');
      // Revert on error
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hero image?')) return;
    
    try {
      await settingsAPI.deleteHeroImage(id);
      fetchData();
    } catch (error) {
      alert('Failed to delete hero image');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormData({
      imageUrl: '',
      headerText: '',
      headerColor: '#000000',
      descriptionText: '',
      descriptionColor: '#ffffff',
      textBackgroundColor: 'rgba(0,0,0,0.4)',
      link: '',
      isActive: true,
      overlayEnabled: true,
      overlayOpacity: 0.4,
    });
  };

  const handleSaveWhatsApp = async () => {
    try {
      await settingsAPI.updateWhatsApp({
        ...whatsapp,
        updatedBy: admin?.email || '',
      });
      alert('WhatsApp number saved successfully!');
    } catch (error) {
      alert('Failed to save WhatsApp number');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'hero' ? 'active' : ''}`}
          onClick={() => setActiveTab('hero')}
        >
          Hero Images
        </button>
        <button 
          className={`tab ${activeTab === 'whatsapp' ? 'active' : ''}`}
          onClick={() => setActiveTab('whatsapp')}
        >
          WhatsApp
        </button>
      </div>

      {activeTab === 'hero' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Hero Images</h2>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Add Hero Image
            </button>
          </div>

          <div className="hero-table-container">
            <table className="hero-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Preview</th>
                  <th>Header</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Overlay</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {heroImages.map((hero, index) => (
                  <tr key={hero.id}>
                    <td>
                      <div className="order-controls">
                        <button 
                          onClick={() => moveOrder(hero, 'up')} 
                          disabled={index === 0}
                          className="order-btn"
                        >
                          ↑
                        </button>
                        <span className="order-number">{hero.order}</span>
                        <button 
                          onClick={() => moveOrder(hero, 'down')} 
                          disabled={index === heroImages.length - 1}
                          className="order-btn"
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="preview-cell">
                        <img src={hero.imageUrl} alt={hero.headerText} className="preview-img" />
                      </div>
                    </td>
                    <td>
                      <div className="text-preview">
                        <span style={{ color: hero.headerColor }}>{hero.headerText}</span>
                      </div>
                    </td>
                    <td>
                      <div className="text-preview">
                        <span style={{ color: hero.descriptionColor }}>{hero.descriptionText}</span>
                      </div>
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleActive(hero)}
                        className={`status-btn ${hero.isActive !== false ? 'active' : 'inactive'}`}
                      >
                        {hero.isActive !== false ? 'Visible' : 'Hidden'}
                      </button>
                    </td>
                    <td>
                      <span className={`overlay-badge ${hero.overlayEnabled !== false ? 'enabled' : 'disabled'}`}>
                        {hero.overlayEnabled !== false ? `${Math.round((hero.overlayOpacity !== undefined ? hero.overlayOpacity : 0.4) * 100)}%` : 'Off'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleEdit(hero)} className="btn-edit-small">✏️</button>
                        <button onClick={() => handleDelete(hero.id)} className="btn-delete-small">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'whatsapp' && (
        <div className="tab-content">
          <h2>WhatsApp Contact</h2>
          <div className="whatsapp-form">
            <div className="phone-input-group">
              <select 
                value={whatsapp.countryCode}
                onChange={(e) => setWhatsapp({ ...whatsapp, countryCode: e.target.value })}
                className="country-code-select"
              >
                <option value="+961">🇱🇧 +961 (Lebanon)</option>
                <option value="+1">🇺🇸 +1 (USA)</option>
                <option value="+44">🇬🇧 +44 (UK)</option>
                <option value="+971">🇦🇪 +971 (UAE)</option>
                <option value="+966">🇸🇦 +966 (Saudi Arabia)</option>
                <option value="+962">🇯🇴 +962 (Jordan)</option>
                <option value="+20">🇪🇬 +20 (Egypt)</option>
              </select>
              <input
                type="tel"
                placeholder="70049615"
                value={whatsapp.phoneNumber}
                onChange={(e) => setWhatsapp({ ...whatsapp, phoneNumber: e.target.value.replace(/\D/g, '') })}
                className="phone-input"
              />
            </div>
            <div className="full-number">
              Full Number: <strong>{whatsapp.countryCode}{whatsapp.phoneNumber}</strong>
            </div>
            <button onClick={handleSaveWhatsApp} className="btn-primary">
              Save WhatsApp Number
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Hero Image' : 'Add Hero Image'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>✕</button>
            </div>

            <form onSubmit={handleSubmitHero}>
              <div className="preview-section">
                <h3>Live Preview</h3>
                <div className="hero-preview" style={{ backgroundImage: `url(${formData.imageUrl})` }}>
                  {formData.overlayEnabled && (
                    <div className="preview-overlay" style={{ backgroundColor: `rgba(0,0,0,${formData.overlayOpacity})` }}></div>
                  )}
                  <div className="preview-text" style={{ backgroundColor: formData.textBackgroundColor }}>
                    <h2 style={{ color: formData.headerColor }}>{formData.headerText || 'Header Text'}</h2>
                    <p style={{ color: formData.descriptionColor }}>{formData.descriptionText || 'Description Text'}</p>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Hero Image</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Header Text</label>
                  <input
                    type="text"
                    value={formData.headerText}
                    onChange={(e) => setFormData({ ...formData, headerText: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Header Color</label>
                  <input
                    type="color"
                    value={formData.headerColor}
                    onChange={(e) => setFormData({ ...formData, headerColor: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Description Text</label>
                  <input
                    type="text"
                    value={formData.descriptionText}
                    onChange={(e) => setFormData({ ...formData, descriptionText: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Description Color</label>
                  <input
                    type="color"
                    value={formData.descriptionColor}
                    onChange={(e) => setFormData({ ...formData, descriptionColor: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Text Background Color</label>
                <input
                  type="text"
                  placeholder="rgba(0,0,0,0.4)"
                  value={formData.textBackgroundColor}
                  onChange={(e) => setFormData({ ...formData, textBackgroundColor: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.overlayEnabled}
                      onChange={(e) => setFormData({ ...formData, overlayEnabled: e.target.checked })}
                    />
                    Enable Dark Overlay
                  </label>
                </div>

                {formData.overlayEnabled && (
                  <div className="form-group">
                    <label>Overlay Opacity: {Math.round(formData.overlayOpacity * 100)}%</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.overlayOpacity}
                      onChange={(e) => setFormData({ ...formData, overlayOpacity: parseFloat(e.target.value) })}
                      className="opacity-slider"
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Active (Visible on website)
                </label>
              </div>

              <div className="form-group">
                <label>Link (Optional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
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

export default Settings;

