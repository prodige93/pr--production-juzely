import React from 'react';
import { useNavigate } from 'react-router-dom';
import database from '../../utils/database';
import './garment-selection.css';

function GarmentSelection() {
  const navigate = useNavigate();
  
  const handleMyOrdersClick = () => {
    navigate('/');
  };
  

   
   const handleTShirtClick = () => {
     handleGarmentSelection('tshirt', 'T-Shirt');
   };
   
   const handlePullClick = () => {
     handleGarmentSelection('pull', 'Pull');
   };
   
   const handleHoodieClick = () => {
     handleGarmentSelection('hoodie', 'Hoodie');
   };
   
   const handleCrewneckClick = () => {
     handleGarmentSelection('crewneck', 'Crewneck');
   };
   
   const handleLongSleeveClick = () => {
     handleGarmentSelection('longsleeve', 'Long Sleeve');
   };
   
   const handleZipHoodieClick = () => {
     handleGarmentSelection('ziphoodie', 'Zip-Hoodie');
   };
  
  const handleGarmentSelection = (garmentType, garmentName) => {
    try {
      // Save garment selection to database
      const selectionId = database.saveGarmentSelection(garmentType, {
        garmentName: garmentName,
        category: 'basic',
        selectedAt: new Date().toISOString()
      });
      
      console.log(`Sélection ${garmentName} sauvegardée:`, selectionId);
      
      // Navigate to specific garment design page
      if (garmentType === 'tshirt') {
        navigate('/tshirt-design');
      } else if (garmentType === 'pull') {
        navigate('/pull-design');
      } else if (garmentType === 'hoodie') {
        navigate('/hoodie-design');
      } else if (garmentType === 'crewneck') {
        navigate('/crewneck-design');
      } else if (garmentType === 'longsleeve') {
        navigate('/longsleeve-design');
      } else if (garmentType === 'ziphoodie') {
        navigate('/ziphoodie-design');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la sélection:', error);
      alert('Erreur lors de la sélection. Veuillez réessayer.');
    }
  };



  return (
    <div className="garment-selection-container">
      <div className="garment-header">
        <button className="back-button" onClick={handleMyOrdersClick}>
          ← My orders
        </button>
        <h1 className="garment-title">What would you like to design?</h1>
        <button className="close-button">×</button>
      </div>

      <div className="garment-category">
        <h2 className="category-title">Basic</h2>
        
        <div className="garment-grid">
          {/* Section T-Shirt */}
          <div className="garment-card" onClick={handleTShirtClick}>
            <div className="garment-image">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <path d="M20 25 L25 20 L35 20 L40 25 L60 25 L60 30 L55 35 L55 70 L25 70 L25 35 L20 30 Z" 
                      stroke="#666" strokeWidth="2" fill="none"/>
                <path d="M35 20 L35 25 L45 25 L45 20" stroke="#666" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <h3 className="garment-name">T-Shirt</h3>
          </div>

          {/* Section Pull */}
          <div className="garment-card" onClick={handlePullClick}>
            <div className="garment-image">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <path d="M15 25 L20 20 L30 20 L35 25 L45 25 L50 20 L60 20 L65 25 L65 35 L60 40 L60 70 L20 70 L20 40 L15 35 Z" 
                      stroke="#666" strokeWidth="2" fill="none"/>
                <path d="M30 20 L30 25 L50 25 L50 20" stroke="#666" strokeWidth="2" fill="none"/>
                <path d="M15 25 L15 35 L20 40" stroke="#666" strokeWidth="2" fill="none"/>
                <path d="L65 25 L65 35 L60 40" stroke="#666" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <h3 className="garment-name">Pull</h3>
          </div>

          {/* Section Hoodie */}
          <div className="garment-card" onClick={handleHoodieClick}>
            <div className="garment-image">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <path d="M20 25 L25 20 L35 20 L40 25 L60 25 L60 30 L55 35 L55 50 L25 50 L25 35 L20 30 Z" 
                      stroke="#666" strokeWidth="2" fill="none"/>
                <path d="M35 20 L35 25 L45 25 L45 20" stroke="#666" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <h3 className="garment-name">Hoodie</h3>
          </div>

          <div className="garment-card" onClick={handleCrewneckClick}>
            <div className="garment-image">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <path d="M25 25 L30 20 L35 20 L40 25 L55 25 L55 30 L50 35 L50 70 L30 70 L30 35 L25 30 Z" 
                      stroke="#666" strokeWidth="2" fill="none"/>
                <path d="M35 20 L35 25 L40 25 L40 20" stroke="#666" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <h3 className="garment-name">Crewneck</h3>
          </div>

          <div className="garment-card" onClick={handleLongSleeveClick}>
            <div className="garment-image">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <path d="M15 25 L20 20 L30 20 L35 25 L45 25 L50 20 L60 20 L65 25 L65 35 L60 40 L60 70 L20 70 L20 40 L15 35 Z" 
                      stroke="#666" strokeWidth="2" fill="none"/>
                <path d="M30 20 L30 25 L50 25 L50 20" stroke="#666" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <h3 className="garment-name">Long Sleeve</h3>
          </div>

          <div className="garment-card" onClick={handleZipHoodieClick}>
            <div className="garment-image">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <path d="M20 25 L25 20 L35 20 L40 25 L60 25 L60 30 L55 35 L55 70 L25 70 L25 35 L20 30 Z" 
                      stroke="#666" strokeWidth="2" fill="none"/>
                <path d="M35 20 L35 25 L45 25 L45 20" stroke="#666" strokeWidth="2" fill="none"/>
                <path d="M40 25 L45 30 L50 25" stroke="#666" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <h3 className="garment-name">Zip-Hoodie</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GarmentSelection;