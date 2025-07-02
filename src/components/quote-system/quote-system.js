import React, { useState, useEffect, useCallback } from 'react';
import quoteService from '../../services/quote-service';
import './quote-system.css';

/**
 * Composant système de devis
 * Affiche le calcul en temps réel et permet de sauvegarder les devis
 */
function QuoteSystem({ 
  garmentType = 'tshirt',
  selections = {},
  onQuoteCalculated,
  showDetailedBreakdown = true,
  autoCalculate = true
}) {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedQuoteId, setSavedQuoteId] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  /**
   * Calcule le devis basé sur les sélections
   */
  const calculateQuote = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const quoteData = {
        garmentType,
        ...selections
      };
      
      const calculatedQuote = quoteService.calculateQuote(quoteData);
      setQuote(calculatedQuote);
      
      // Callback pour informer le parent
      if (onQuoteCalculated) {
        onQuoteCalculated(calculatedQuote);
      }
    } catch (err) {
      setError('Erreur lors du calcul du devis: ' + err.message);
      console.error('Erreur calcul devis:', err);
    } finally {
      setLoading(false);
    }
  }, [garmentType, selections, onQuoteCalculated]);

  /**
   * Sauvegarde le devis actuel
   */
  const saveQuote = async () => {
    if (!quote) {
      setError('Aucun devis à sauvegarder');
      return;
    }

    setLoading(true);
    try {
      const quoteId = quoteService.saveQuote(quote);
      setSavedQuoteId(quoteId);
      alert('Devis sauvegardé avec succès!');
    } catch (err) {
      setError('Erreur lors de la sauvegarde: ' + err.message);
      console.error('Erreur sauvegarde devis:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Génère un devis PDF (simulation)
   */
  const generatePDF = () => {
    if (!quote) return;
    
    // Simulation de génération PDF
    const pdfContent = `
DEVIS JUZELY - ${quote.quoteId}
${'='.repeat(50)}

Type de vêtement: ${quote.garmentType.toUpperCase()}
Date: ${new Date(quote.createdAt).toLocaleDateString('fr-FR')}

DÉTAILS:
- Tissu: ${quote.breakdown.fabric.name} (+${quote.breakdown.fabric.cost}€)
- Coloris: ${quote.breakdown.colourway.name} (+${quote.breakdown.colourway.cost}€)
- Embellissement: ${quote.breakdown.embellishment.name} (+${quote.breakdown.embellishment.cost}€)
- Finitions: ${quote.breakdown.finishings.name} (+${quote.breakdown.finishings.cost}€)
- Emballage: ${quote.breakdown.packaging.name} (+${quote.breakdown.packaging.cost}€)
- Livraison: ${quote.breakdown.delivery.name} (${quote.breakdown.delivery.cost}€)

TARIFICATION:
- Prix unitaire: ${quote.pricing.unitPrice}€
- Quantité: ${quote.pricing.quantity}
- Sous-total: ${quote.pricing.subtotal}€
- Remise quantité: -${quote.pricing.quantityDiscount.amount}€ (${(quote.pricing.quantityDiscount.percentage * 100).toFixed(1)}%)
- Livraison: ${quote.pricing.deliveryCost}€
- TVA (20%): ${quote.pricing.taxAmount}€

TOTAL: ${quote.pricing.totalPrice}€
    `;
    
    // Créer un blob et télécharger
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devis_${quote.quoteId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calcul automatique quand les sélections changent
  useEffect(() => {
    if (autoCalculate && Object.keys(selections).length > 0) {
      calculateQuote();
    }
  }, [selections, garmentType, autoCalculate, calculateQuote]);

  if (loading) {
    return (
      <div className="quote-system loading">
        <div className="loading-spinner"></div>
        <p>Calcul du devis en cours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quote-system error">
        <div className="error-message">
          <h3>❌ Erreur</h3>
          <p>{error}</p>
          <button onClick={calculateQuote} className="retry-btn">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="quote-system empty">
        <div className="empty-state">
          <h3>💰 Système de Devis</h3>
          <p>Sélectionnez vos options pour voir le prix</p>
          <button onClick={calculateQuote} className="calculate-btn">
            Calculer le devis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quote-system">
      <div className="quote-header">
        <h3>💰 Devis - {garmentType.toUpperCase()}</h3>
        <div className="quote-id">ID: {quote.quoteId}</div>
      </div>

      <div className="quote-summary">
        <div className="price-display">
          <div className="total-price">
            <span className="currency">€</span>
            <span className="amount">{quote.pricing.totalPrice}</span>
          </div>
          <div className="price-details">
            <small>TTC • Quantité: {quote.pricing.quantity}</small>
          </div>
        </div>

        {quote.pricing.quantityDiscount.amount > 0 && (
          <div className="discount-badge">
            🎉 Remise: -{quote.pricing.quantityDiscount.amount}€
          </div>
        )}
      </div>

      <div className="quote-breakdown-toggle">
        <button 
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="breakdown-toggle-btn"
        >
          {showBreakdown ? '▼' : '▶'} Détails du calcul
        </button>
      </div>

      {showBreakdown && (
        <div className="quote-breakdown">
          <div className="breakdown-section">
            <h4>Composition du prix</h4>
            <div className="breakdown-items">
              <div className="breakdown-item">
                <span>Prix de base ({garmentType})</span>
                <span>{quote.pricing.basePrice}€</span>
              </div>
              
              {quote.breakdown.fabric.cost > 0 && (
                <div className="breakdown-item">
                  <span>{quote.breakdown.fabric.name}</span>
                  <span>+{quote.breakdown.fabric.cost}€</span>
                </div>
              )}
              
              {quote.breakdown.colourway.cost > 0 && (
                <div className="breakdown-item">
                  <span>{quote.breakdown.colourway.name}</span>
                  <span>+{quote.breakdown.colourway.cost}€</span>
                </div>
              )}
              
              {quote.breakdown.embellishment.cost > 0 && (
                <div className="breakdown-item">
                  <span>{quote.breakdown.embellishment.name}</span>
                  <span>+{quote.breakdown.embellishment.cost}€</span>
                </div>
              )}
              
              {quote.breakdown.finishings.cost > 0 && (
                <div className="breakdown-item">
                  <span>{quote.breakdown.finishings.name}</span>
                  <span>+{quote.breakdown.finishings.cost}€</span>
                </div>
              )}
              
              {quote.breakdown.packaging.cost > 0 && (
                <div className="breakdown-item">
                  <span>{quote.breakdown.packaging.name}</span>
                  <span>+{quote.breakdown.packaging.cost}€</span>
                </div>
              )}
            </div>
          </div>

          <div className="breakdown-section">
            <h4>Calcul final</h4>
            <div className="breakdown-items">
              <div className="breakdown-item">
                <span>Prix unitaire</span>
                <span>{quote.pricing.unitPrice}€</span>
              </div>
              <div className="breakdown-item">
                <span>Quantité × {quote.pricing.quantity}</span>
                <span>{quote.pricing.subtotal}€</span>
              </div>
              {quote.pricing.quantityDiscount.amount > 0 && (
                <div className="breakdown-item discount">
                  <span>Remise quantité ({(quote.pricing.quantityDiscount.percentage * 100).toFixed(1)}%)</span>
                  <span>-{quote.pricing.quantityDiscount.amount}€</span>
                </div>
              )}
              <div className="breakdown-item">
                <span>{quote.breakdown.delivery.name}</span>
                <span>{quote.pricing.deliveryCost}€</span>
              </div>
              <div className="breakdown-item">
                <span>TVA (20%)</span>
                <span>{quote.pricing.taxAmount}€</span>
              </div>
              <div className="breakdown-item total">
                <span><strong>TOTAL TTC</strong></span>
                <span><strong>{quote.pricing.totalPrice}€</strong></span>
              </div>
            </div>
          </div>

          {(quote.surcharges.customSize > 0 || quote.surcharges.rushOrder > 0) && (
            <div className="breakdown-section">
              <h4>Suppléments appliqués</h4>
              <div className="breakdown-items">
                {quote.surcharges.customSize > 0 && (
                  <div className="breakdown-item surcharge">
                    <span>Taille personnalisée</span>
                    <span>+{(quote.surcharges.customSize * 100).toFixed(1)}%</span>
                  </div>
                )}
                {quote.surcharges.rushOrder > 0 && (
                  <div className="breakdown-item surcharge">
                    <span>Commande urgente</span>
                    <span>+{(quote.surcharges.rushOrder * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="quote-actions">
        <button 
          onClick={saveQuote} 
          className="save-quote-btn"
          disabled={loading || savedQuoteId}
        >
          {savedQuoteId ? '✅ Sauvegardé' : '💾 Sauvegarder'}
        </button>
        
        <button 
          onClick={generatePDF} 
          className="pdf-btn"
        >
          📄 Télécharger
        </button>
        
        <button 
          onClick={calculateQuote} 
          className="recalculate-btn"
        >
          🔄 Recalculer
        </button>
      </div>

      {savedQuoteId && (
        <div className="save-confirmation">
          ✅ Devis sauvegardé avec l'ID: {savedQuoteId}
        </div>
      )}

      <div className="quote-footer">
        <small>
          Devis généré le {new Date(quote.createdAt).toLocaleString('fr-FR')}
          • Valable 30 jours
        </small>
      </div>
    </div>
  );
}

export default QuoteSystem;