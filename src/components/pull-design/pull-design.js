import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import database from '../../utils/database';
import './pull-design.css';

// Size data definition outside component to avoid re-creation on each render
const pullSizeData = {
  'XXS': { totalLength: 68, chestWidth: 52, bottomWidth: 52, sleeveLength: 60, armhole: 24, sleeveOpening: 10, neckRibLength: 3, neckOpening: 20, shoulderToShoulder: 50 },
  'XS': { totalLength: 70, chestWidth: 54, bottomWidth: 54, sleeveLength: 61, armhole: 24.5, sleeveOpening: 10.5, neckRibLength: 3, neckOpening: 20, shoulderToShoulder: 52 },
  'S': { totalLength: 72, chestWidth: 56, bottomWidth: 56, sleeveLength: 62, armhole: 25, sleeveOpening: 11, neckRibLength: 3, neckOpening: 20, shoulderToShoulder: 54 },
  'M': { totalLength: 74, chestWidth: 58, bottomWidth: 58, sleeveLength: 63, armhole: 25.5, sleeveOpening: 11.5, neckRibLength: 3, neckOpening: 20, shoulderToShoulder: 56 },
  'L': { totalLength: 76, chestWidth: 60, bottomWidth: 60, sleeveLength: 64, armhole: 26, sleeveOpening: 12, neckRibLength: 3, neckOpening: 20, shoulderToShoulder: 58 },
  'XL': { totalLength: 78, chestWidth: 62, bottomWidth: 62, sleeveLength: 65, armhole: 26.5, sleeveOpening: 12.5, neckRibLength: 3, neckOpening: 20, shoulderToShoulder: 60 },
  'XXL': { totalLength: 80, chestWidth: 64, bottomWidth: 64, sleeveLength: 66, armhole: 27, sleeveOpening: 13, neckRibLength: 3, neckOpening: 20, shoulderToShoulder: 62 }
};

function PullDesign() {
  const [selectedFit, setSelectedFit] = useState('custom');
  const [editableSizeData, setEditableSizeData] = useState({});
  const [isModified, setIsModified] = useState(false);

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
    setEditableSizeData(pullSizeData);
    
    // Save garment selection to database
    try {
      const id = database.saveGarmentSelection('pull', {
        garmentName: 'Pull',
        category: 'basic',
        initialSizeData: pullSizeData
      });
      setSelectionId(id);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la sélection Pull:', error);
    }
  }, []);

   
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
         garmentType: 'pull',
         garmentName: 'Pull',
         fit: selectedFit,
         sizeData: editableSizeData,

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
       console.log('Devis Pull généré:', quoteId, quoteData);
       
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
    { id: 'cropped', label: 'Cropped Fit' }
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
    <div className="pull-design-container">
      <div className="pull-design-header">
        <button className="back-button" onClick={handleBackToSelection}>← Sélection</button>
        <button className="back-button" onClick={handleMyOrdersClick}>← My orders</button>
        <div className="header-tabs">
          <span className="tab active">Fit - Pull</span>
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

      <div className="pull-design-content">
        <div className="left-section">
          <div className="fit-selection">
            <h3>Choose your fit</h3>
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

          <div className="cutting-patterns-section">
            <h3>Do you have your own cutting patterns?</h3>
            <button className="upload-button">Upload</button>
          </div>
        </div>

        <div className="center-section">
          <div className="size-chart-header">
            <h3>Tableau des tailles T-Shirt (en cm)</h3>
            <div className="action-buttons">
              <button className="action-btn save-btn">📁 Sauvegarder</button>
              <button className="action-btn view-btn">👁 Voir devis</button>
              <button className="action-btn stats-btn">📊 Stats</button>
              <button className="action-btn clean-btn">🧹 Nettoyer</button>
            </div>
          </div>

            <div className="table-container">
              <table className="size-table">
                <thead>
                  <tr>
                    <th>Mesures</th>
                    <th>XXS</th>
                    <th>XS</th>
                    <th>S</th>
                    <th>M</th>
                    <th>L</th>
                    <th>XL</th>
                    <th>XXL</th>
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
            disabled={!isModified}
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

export default PullDesign;