import React, { useState } from 'react';
import QuoteSystem from '../quote-system/quote-system';
import './quote-demo.css';

/**
 * Composant de démonstration du système de devis
 * Permet de tester toutes les fonctionnalités du système de devis
 */
function QuoteDemo() {
  const [garmentType, setGarmentType] = useState('tshirt');
  const [selections, setSelections] = useState({
    fabric: 'cotton',
    colourway: 'single',
    embellishment: 'none',
    finishings: 'standard',
    packaging: 'standard',
    delivery: 'standard',
    quantity: 1,
    isCustomSize: false,
    isRushOrder: false
  });

  const handleSelectionChange = (key, value) => {
    setSelections(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleQuoteCalculated = (quote) => {
    console.log('Devis calculé dans la démo:', quote);
  };

  return (
    <div className="quote-demo-container">
      <div className="demo-header">
        <h1>🧪 Démonstration du Système de Devis</h1>
        <p>Testez le système de calcul de devis en temps réel</p>
      </div>

      <div className="demo-content">
        <div className="demo-controls">
          <h3>⚙️ Paramètres de test</h3>
          
          <div className="control-group">
            <label>Type de vêtement:</label>
            <select 
              value={garmentType} 
              onChange={(e) => setGarmentType(e.target.value)}
            >
              <option value="tshirt">T-Shirt</option>
              <option value="hoodie">Hoodie</option>
              <option value="crewneck">Crewneck</option>
              <option value="longsleeve">Longsleeve</option>
              <option value="pull">Pull</option>
              <option value="ziphoodie">Zip Hoodie</option>
            </select>
          </div>

          <div className="control-group">
            <label>Tissu:</label>
            <select 
              value={selections.fabric} 
              onChange={(e) => handleSelectionChange('fabric', e.target.value)}
            >
              <option value="cotton">Coton 100%</option>
              <option value="cotton_organic">Coton Bio</option>
              <option value="polyester">Polyester</option>
              <option value="blend">Mélange Coton/Polyester</option>
            </select>
          </div>

          <div className="control-group">
            <label>Coloris:</label>
            <select 
              value={selections.colourway} 
              onChange={(e) => handleSelectionChange('colourway', e.target.value)}
            >
              <option value="single">Couleur unique</option>
              <option value="two_colors">Deux couleurs</option>
              <option value="multicolor">Multicolore</option>
              <option value="gradient">Dégradé</option>
            </select>
          </div>

          <div className="control-group">
            <label>Embellissement:</label>
            <select 
              value={selections.embellishment} 
              onChange={(e) => handleSelectionChange('embellishment', e.target.value)}
            >
              <option value="none">Aucun</option>
              <option value="embroidery">Broderie</option>
              <option value="print">Impression</option>
              <option value="vinyl">Vinyle</option>
              <option value="patch">Patch</option>
            </select>
          </div>

          <div className="control-group">
            <label>Finitions:</label>
            <select 
              value={selections.finishings} 
              onChange={(e) => handleSelectionChange('finishings', e.target.value)}
            >
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="luxury">Luxe</option>
            </select>
          </div>

          <div className="control-group">
            <label>Emballage:</label>
            <select 
              value={selections.packaging} 
              onChange={(e) => handleSelectionChange('packaging', e.target.value)}
            >
              <option value="standard">Standard</option>
              <option value="eco">Écologique</option>
              <option value="premium">Premium</option>
              <option value="gift">Cadeau</option>
            </select>
          </div>

          <div className="control-group">
            <label>Livraison:</label>
            <select 
              value={selections.delivery} 
              onChange={(e) => handleSelectionChange('delivery', e.target.value)}
            >
              <option value="standard">Standard (7-10 jours)</option>
              <option value="express">Express (3-5 jours)</option>
              <option value="overnight">24h</option>
              <option value="pickup">Retrait en magasin</option>
            </select>
          </div>

          <div className="control-group">
            <label>Quantité:</label>
            <input 
              type="number" 
              min="1" 
              max="1000" 
              value={selections.quantity}
              onChange={(e) => handleSelectionChange('quantity', parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="control-group">
            <label>
              <input 
                type="checkbox" 
                checked={selections.isCustomSize}
                onChange={(e) => handleSelectionChange('isCustomSize', e.target.checked)}
              />
              Taille personnalisée (+15%)
            </label>
          </div>

          <div className="control-group">
            <label>
              <input 
                type="checkbox" 
                checked={selections.isRushOrder}
                onChange={(e) => handleSelectionChange('isRushOrder', e.target.checked)}
              />
              Commande urgente (+25%)
            </label>
          </div>
        </div>

        <div className="demo-quote">
          <h3>💰 Devis en temps réel</h3>
          <QuoteSystem 
            garmentType={garmentType}
            selections={selections}
            onQuoteCalculated={handleQuoteCalculated}
            showDetailedBreakdown={true}
            autoCalculate={true}
          />
        </div>
      </div>

      <div className="demo-footer">
        <h3>📊 Informations sur les tarifs</h3>
        <div className="pricing-info">
          <div className="info-section">
            <h4>Prix de base par vêtement:</h4>
            <ul>
              <li>T-Shirt: 15.00€</li>
              <li>Hoodie: 35.00€</li>
              <li>Crewneck: 28.00€</li>
              <li>Longsleeve: 22.00€</li>
              <li>Pull: 30.00€</li>
              <li>Zip Hoodie: 40.00€</li>
            </ul>
          </div>
          
          <div className="info-section">
            <h4>Remises quantité:</h4>
            <ul>
              <li>10-24 pièces: -5%</li>
              <li>25-49 pièces: -10%</li>
              <li>50-99 pièces: -15%</li>
              <li>100-199 pièces: -20%</li>
              <li>200+ pièces: -25%</li>
            </ul>
          </div>
          
          <div className="info-section">
            <h4>Suppléments:</h4>
            <ul>
              <li>Taille personnalisée: +15%</li>
              <li>Commande urgente: +25%</li>
              <li>TVA: 20%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuoteDemo;