import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import database from '../../utils/database';
import './tshirt-design.css';

// Size data definition outside component to avoid re-creation on each render
const tshirtSizeData = {
  'XS': { totalLength: 65, chestWidth: 52, bottomWidth: 52, sleeveLength: 19, armhole: 23, sleeveOpening: 19, neckRibLength: 2.5, neckOpening: 18.5, shoulderToShoulder: 51 },
  'S': { totalLength: 67, chestWidth: 54, bottomWidth: 54, sleeveLength: 20, armhole: 23.5, sleeveOpening: 19.5, neckRibLength: 2.5, neckOpening: 18.5, shoulderToShoulder: 53 },
  'M': { totalLength: 69, chestWidth: 56, bottomWidth: 56, sleeveLength: 21, armhole: 24, sleeveOpening: 20, neckRibLength: 2.5, neckOpening: 18.5, shoulderToShoulder: 55 },
  'L': { totalLength: 71, chestWidth: 58, bottomWidth: 58, sleeveLength: 22, armhole: 24.5, sleeveOpening: 20.5, neckRibLength: 2.5, neckOpening: 18.5, shoulderToShoulder: 57 },
  'XL': { totalLength: 73, chestWidth: 60, bottomWidth: 60, sleeveLength: 23, armhole: 25, sleeveOpening: 21, neckRibLength: 2.5, neckOpening: 18.5, shoulderToShoulder: 59 }
};

function TshirtDesign() {
  const [selectedFit, setSelectedFit] = useState('custom');
  const [editableSizeData, setEditableSizeData] = useState({});
  const [isModified, setIsModified] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectionId, setSelectionId] = useState(null);
  const navigate = useNavigate();
  
  const handleMyOrdersClick = () => {
    navigate('/');
  };
  
  const handleBackToSelection = () => {
    navigate('/design');
  };

  // Initialize editable data with default values and save selection
  useEffect(() => {
    setEditableSizeData(tshirtSizeData);
    
    // Save garment selection to database
    try {
      const id = database.saveGarmentSelection('tshirt', {
        garmentName: 'T-Shirt',
        category: 'basic',
        initialSizeData: tshirtSizeData
      });
      setSelectionId(id);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la sélection T-shirt:', error);
    }
  }, []);
  
  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if file is SVG or PNG
      const allowedTypes = ['image/svg+xml', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Veuillez sélectionner un fichier SVG ou PNG uniquement.');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La taille du fichier ne doit pas dépasser 5MB.');
        return;
      }
      
      try {
        // Create preview URL
        const reader = new FileReader();
        reader.onload = async (e) => {
          const preview = e.target.result;
          
          // Save image to database
          const imageId = database.saveImage(file, preview);
          
          // Update state with image data including database ID
          setUploadedImage({
            id: imageId,
            file: file,
            name: file.name,
            type: file.type,
            size: file.size
          });
          setImagePreview(preview);
          setIsModified(true);
          
          console.log('Image uploadée et sauvegardée pour T-shirt:', imageId, file.name);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Erreur lors de l\'upload:', error);
        alert('Erreur lors de l\'upload de l\'image. Veuillez réessayer.');
      }
    }
  };
  
  // Remove uploaded image
  const removeImage = () => {
    if (uploadedImage && uploadedImage.id) {
      // Delete from database
      database.deleteImage(uploadedImage.id);
      console.log('Image T-shirt supprimée de la base de données:', uploadedImage.id);
    }
    setUploadedImage(null);
    setImagePreview(null);
    setIsModified(true);
  };
   
   // Handle cell value changes
   const handleCellChange = (size, measurementKey, value) => {
     const numValue = parseFloat(value) || 0;
     setEditableSizeData(prev => ({
       ...prev,
       [size]: {
         ...prev[size],
         [measurementKey]: numValue
       }
     }));
     setIsModified(true);
   };
   
   // Validate cell values based on size rules
   const validateCell = (size, measurementKey, value) => {
     const numValue = parseFloat(value);
     if (isNaN(numValue) || numValue < 0 || numValue > 200) {
       return false;
     }
     return true;
   };
   
   // Handle quote generation
   const handleGenerateQuote = () => {
     try {
       const quoteData = {
         garmentType: 'tshirt',
         garmentName: 'T-Shirt',
         fit: selectedFit,
         sizeData: editableSizeData,
         uploadedImage: uploadedImage,
         selectionId: selectionId,
         measurements: measurements.map(m => ({
           ...m,
           values: Object.keys(editableSizeData).reduce((acc, size) => {
             acc[size] = editableSizeData[size][m.key] || 0;
             return acc;
           }, {})
         }))
       };
       
       const quoteId = database.saveQuote(quoteData);
       alert(`Devis généré avec succès! ID: ${quoteId}`);
       console.log('Devis T-shirt généré:', quoteId, quoteData);
       
     } catch (error) {
       console.error('Erreur lors de la génération du devis:', error);
       alert('Erreur lors de la génération du devis. Veuillez réessayer.');
     }
   };

  const fitOptions = [
    { id: 'oversized', label: 'Oversized Fit' },
    { id: 'regular', label: 'Regular Fit' },
    { id: 'slim', label: 'Slim Fit' },
    { id: 'custom', label: 'Custom Fit' },
    { id: 'cropped', label: 'Cropped (1/2 Sleeve) Fit' }
  ];

  const measurements = [
    { id: 'A', label: 'Total Length', key: 'totalLength' },
    { id: 'B', label: 'Chest Width', key: 'chestWidth' },
    { id: 'C', label: 'Bottom Width', key: 'bottomWidth' },
    { id: 'D', label: 'Sleeve Length', key: 'sleeveLength' },
    { id: 'E', label: 'Armhole', key: 'armhole' },
    { id: 'F', label: 'Sleeve Opening', key: 'sleeveOpening' },
    { id: 'G', label: 'Neck Rib Length', key: 'neckRibLength' },
    { id: 'H', label: 'Neck Opening', key: 'neckOpening' },
    { id: 'I', label: 'Shoulder-to-Shoulder', key: 'shoulderToShoulder' }
  ];

  return (
    <div className="tshirt-design-container">
      <div className="tshirt-design-header">
        <button className="back-button" onClick={handleBackToSelection}>← Sélection</button>
        <button className="back-button" onClick={handleMyOrdersClick}>← My orders</button>
        <div className="header-tabs">
          <span className="tab active">Fit - T-Shirt</span>
          <span className="tab">Fabric</span>
          <span className="tab">Colourway</span>
          <span className="tab">Necklabel</span>
          <span className="tab">Corelabel</span>
          <span className="tab">Embellishment</span>
          <span className="tab">Finishings</span>
          <span className="tab">Quantity</span>
          <span className="tab">Packaging</span>
          <span className="tab">Delivery</span>
        </div>
      </div>

      <div className="tshirt-design-content">
        <div className="fit-selection">
          <h3>Sélectionnez le fit de votre T-Shirt</h3>
          <div className="fit-options">
            {fitOptions.map((option) => (
              <label key={option.id} className="fit-option">
                <input
                  type="radio"
                  name="fit"
                  value={option.id}
                  checked={selectedFit === option.id}
                  onChange={(e) => setSelectedFit(e.target.value)}
                />
                <span className="fit-label">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="image-upload-section">
          <h3>Télécharger une image de référence (optionnel)</h3>
          <div className="upload-area">
            {!imagePreview ? (
              <div className="upload-placeholder">
                <input
                  type="file"
                  id="image-upload"
                  accept=".svg,.png"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="image-upload" className="upload-button">
                  Choisir un fichier SVG ou PNG
                </label>
                <p className="upload-info">Taille max: 5MB</p>
              </div>
            ) : (
              <div className="image-preview">
                <img src={imagePreview} alt="Aperçu" className="preview-image" />
                <div className="image-info">
                  <p><strong>Nom:</strong> {uploadedImage.name}</p>
                  <p><strong>Taille:</strong> {(uploadedImage.size / 1024).toFixed(2)} KB</p>
                  <button onClick={removeImage} className="remove-button">Supprimer</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="tshirt-preview-section">
          <h3>Aperçu du T-Shirt</h3>
          <div className="tshirt-svg-container">
            <svg width="200" height="240" viewBox="0 0 200 240" className="tshirt-svg">
              {/* T-shirt outline */}
              <path d="M50 60 L50 40 Q50 30 60 30 L80 30 Q90 20 110 20 Q130 20 140 30 L160 30 Q170 30 170 40 L170 60 L150 80 L150 220 Q150 230 140 230 L60 230 Q50 230 50 220 L50 80 Z" 
                    fill="#f8f9fa" 
                    stroke="#333" 
                    strokeWidth="2"/>
              
              {/* Sleeves */}
              <ellipse cx="40" cy="70" rx="15" ry="25" fill="#f8f9fa" stroke="#333" strokeWidth="2"/>
              <ellipse cx="180" cy="70" rx="15" ry="25" fill="#f8f9fa" stroke="#333" strokeWidth="2"/>
              
              {/* Neckline */}
              <ellipse cx="110" cy="35" rx="20" ry="10" fill="white" stroke="#333" strokeWidth="2"/>
            </svg>
          </div>
        </div>

        <div className="size-chart-section">
          <h3>Tableau des tailles T-Shirt (en cm)</h3>
          <div className="table-container">
            <table className="size-table">
              <thead>
                <tr>
                  <th>Mesures</th>
                  <th>XS</th>
                  <th>S</th>
                  <th>M</th>
                  <th>L</th>
                  <th>XL</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((measurement) => (
                  <tr key={measurement.id}>
                    <td className="measurement-label">
                      <span className="measurement-id">{measurement.id}</span>
                      {measurement.label}
                    </td>
                    {Object.keys(editableSizeData).map((size) => (
                      <td key={size}>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="200"
                          value={editableSizeData[size]?.[measurement.key] || ''}
                          onChange={(e) => handleCellChange(size, measurement.key, e.target.value)}
                          className={validateCell(size, measurement.key, editableSizeData[size]?.[measurement.key]) ? '' : 'invalid'}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="actions-section">
          <button 
            onClick={handleGenerateQuote}
            className="generate-quote-button"
            disabled={!isModified && !uploadedImage}
          >
            Generate Quote
          </button>
          {selectionId && (
            <p className="selection-info">ID de sélection: {selectionId}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TshirtDesign;