import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import database from '../../utils/database';
import './ziphoodie-design.css';

function ZiphoodieDesign() {
  const navigate = useNavigate();
  const [selectedFit, setSelectedFit] = useState('Regular');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [selectionId, setSelectionId] = useState(null);
  
  // Size chart data
  const [editableSizeData, setEditableSizeData] = useState({
    XS: { chest: 88, length: 68, sleeve: 60 },
    S: { chest: 93, length: 71, sleeve: 62 },
    M: { chest: 98, length: 74, sleeve: 64 },
    L: { chest: 103, length: 77, sleeve: 66 },
    XL: { chest: 108, length: 80, sleeve: 68 }
  });

  const measurements = [
    { key: 'chest', label: 'Tour de poitrine', unit: 'cm' },
    { key: 'length', label: 'Longueur', unit: 'cm' },
    { key: 'sleeve', label: 'Longueur de manche', unit: 'cm' }
  ];

  const fitOptions = ['Slim', 'Regular', 'Oversized'];

  useEffect(() => {
    // Get the latest garment selection
    const selections = database.getGarmentSelections();
    if (selections.length > 0) {
      const latestSelection = selections[selections.length - 1];
      if (latestSelection.garmentType === 'ziphoodie') {
        setSelectionId(latestSelection.id);
      }
    }
  }, []);

  // Handle fit selection
  const handleFitChange = (fit) => {
    setSelectedFit(fit);
    setIsModified(true);
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setIsModified(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle size chart modifications
  const handleSizeChange = (size, measurement, value) => {
    setEditableSizeData(prev => ({
      ...prev,
      [size]: {
        ...prev[size],
        [measurement]: parseFloat(value) || 0
      }
    }));
    setIsModified(true);
  };

  // Handle quote generation
   const handleGenerateQuote = () => {
     try {
       const quoteData = {
         garmentType: 'ziphoodie',
         garmentName: 'Zip-Hoodie',
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
       console.log('Devis Zip-Hoodie généré:', quoteId, quoteData);
       
     } catch (error) {
       console.error('Erreur lors de la génération du devis:', error);
       alert('Erreur lors de la génération du devis. Veuillez réessayer.');
     }
   };

  const handleBackToSelection = () => {
    navigate('/design');
  };

  return (
    <div className="ziphoodie-design-container">
      <div className="design-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBackToSelection}>
            ← Retour
          </button>
        </div>
        <div className="header-center">
          <div className="tabs">
            <button className="tab active">Zip-Hoodie</button>
          </div>
        </div>
        <div className="header-right">
          <button className="back-button" onClick={handleBackToSelection}>
            ← Retour à la sélection
          </button>
        </div>
      </div>

      <div className="design-content">
        <div className="left-section">
          <div className="fit-selection">
            <h3>Choose your fit</h3>
            <div className="fit-options">
              {fitOptions.map(fit => (
                <label key={fit} className="fit-option">
                  <input
                    type="radio"
                    name="fit"
                    value={fit}
                    checked={selectedFit === fit}
                    onChange={() => handleFitChange(fit)}
                  />
                  {fit} fit
                </label>
              ))}
            </div>
          </div>

          <div className="cutting-patterns">
            <h3>Do you have your own cutting patterns?</h3>
            <div className="upload-section">
              <input
                type="file"
                id="image-upload"
                accept=".svg,.png"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload" className="upload-button">
                Upload
              </label>
            </div>
          </div>
        </div>

        <div className="center-section">
          <div className="size-chart-header">
            <h3>Fill in the size chart</h3>
            <div className="chart-actions">
              <button className="btn-green">✓ Save</button>
              <button className="btn-blue">Edit</button>
              <button className="btn-orange">Download</button>
            </div>
          </div>

          <div className="size-chart-section">
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
                     <tr key={measurement.key}>
                       <td className="measurement-label">
                         <span className="measurement-id">{measurement.key.toUpperCase()}</span>
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
                             onChange={(e) => handleSizeChange(size, measurement.key, e.target.value)}
                             className="size-input"
                           />
                         </td>
                       ))}
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
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
           <p className="selection-info">
             ID de sélection: {selectionId}
           </p>
         )}
       </div>
     </div>
   );
}

export default ZiphoodieDesign;