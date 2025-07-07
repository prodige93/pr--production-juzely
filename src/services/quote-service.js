import pricingConfig from '../data/pricing-config.json';
import database from '../utils/database';

/**
 * Service de calcul et gestion des devis
 * Gère le calcul des prix, la sauvegarde et la récupération des devis
 */
class QuoteService {
  constructor() {
    this.pricingConfig = pricingConfig;
  }

  /**
   * Calcule le devis complet basé sur les sélections de l'utilisateur
   * @param {Object} selections - Les sélections de l'utilisateur
   * @returns {Object} Devis calculé avec détails
   */
  calculateQuote(selections) {
    try {
      const {
        garmentType = 'tshirt',
        fabric,
        colourway,
        embellishment,
        finishings,
        packaging,
        delivery,
        quantity = 1,
        isCustomSize = false,
        isRushOrder = false,
        selectedFit,
        editableSizeData
      } = selections;

      // Prix de base du vêtement
      const basePrice = this.pricingConfig.basePrice[garmentType] || 15.00;
      
      // Calcul des coûts additionnels
      const fabricCost = this.calculateFabricCost(fabric, basePrice);
      const colourwayCost = this.calculateColourwayCost(colourway);
      const embellishmentCost = this.calculateEmbellishmentCost(embellishment);
      const finishingsCost = this.calculateFinishingsCost(finishings);
      const packagingCost = this.calculatePackagingCost(packaging);
      
      // Prix unitaire avant remises
      let unitPrice = basePrice + fabricCost.additionalCost + colourwayCost + 
                     embellishmentCost + finishingsCost + packagingCost;
      
      // Application du multiplicateur de tissu
      unitPrice *= fabricCost.multiplier;
      
      // Supplément pour taille personnalisée
      if (isCustomSize && this.pricingConfig.customSizeUpcharge.enabled) {
        unitPrice *= (1 + this.pricingConfig.customSizeUpcharge.percentage);
      }
      
      // Supplément pour commande urgente
      if (isRushOrder && this.pricingConfig.rushOrderUpcharge.enabled) {
        unitPrice *= (1 + this.pricingConfig.rushOrderUpcharge.percentage);
      }
      
      // Calcul du sous-total
      const subtotal = unitPrice * quantity;
      
      // Application de la remise quantité
      const quantityDiscount = this.calculateQuantityDiscount(quantity);
      const discountAmount = subtotal * quantityDiscount;
      const subtotalAfterDiscount = subtotal - discountAmount;
      
      // Coût de livraison
      const deliveryCost = this.calculateDeliveryCost(delivery);
      
      // Total avant taxes
      const totalBeforeTax = subtotalAfterDiscount + deliveryCost;
      
      // Calcul des taxes
      const taxAmount = totalBeforeTax * this.pricingConfig.taxes.vat;
      
      // Total final
      const totalPrice = totalBeforeTax + taxAmount;
      
      return {
        quoteId: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        garmentType,
        selections,
        pricing: {
          basePrice,
          unitPrice: parseFloat(unitPrice.toFixed(2)),
          quantity,
          subtotal: parseFloat(subtotal.toFixed(2)),
          quantityDiscount: {
            percentage: quantityDiscount,
            amount: parseFloat(discountAmount.toFixed(2))
          },
          subtotalAfterDiscount: parseFloat(subtotalAfterDiscount.toFixed(2)),
          deliveryCost: parseFloat(deliveryCost.toFixed(2)),
          taxAmount: parseFloat(taxAmount.toFixed(2)),
          totalPrice: parseFloat(totalPrice.toFixed(2))
        },
        breakdown: {
          fabric: {
            name: this.getFabricName(fabric),
            cost: parseFloat(fabricCost.additionalCost.toFixed(2)),
            multiplier: fabricCost.multiplier
          },
          colourway: {
            name: this.getColourwayName(colourway),
            cost: parseFloat(colourwayCost.toFixed(2))
          },
          embellishment: {
            name: this.getEmbellishmentName(embellishment),
            cost: parseFloat(embellishmentCost.toFixed(2))
          },
          finishings: {
            name: this.getFinishingsName(finishings),
            cost: parseFloat(finishingsCost.toFixed(2))
          },
          packaging: {
            name: this.getPackagingName(packaging),
            cost: parseFloat(packagingCost.toFixed(2))
          },
          delivery: {
            name: this.getDeliveryName(delivery),
            cost: parseFloat(deliveryCost.toFixed(2))
          }
        },
        surcharges: {
          customSize: isCustomSize ? this.pricingConfig.customSizeUpcharge.percentage : 0,
          rushOrder: isRushOrder ? this.pricingConfig.rushOrderUpcharge.percentage : 0
        },
        sizeInfo: {
          selectedFit: selectedFit || 'custom',
          isCustomSize: isCustomSize,
          sizeData: editableSizeData || {}
        },
        createdAt: new Date().toISOString(),
        currency: 'EUR'
      };
    } catch (error) {
      console.error('Erreur lors du calcul du devis:', error);
      throw new Error('Impossible de calculer le devis');
    }
  }

  /**
   * Calcule le coût du tissu
   */
  calculateFabricCost(fabric, basePrice) {
    if (!fabric || !this.pricingConfig.fabricPricing[fabric]) {
      return { multiplier: 1.0, additionalCost: 0 };
    }
    
    const fabricConfig = this.pricingConfig.fabricPricing[fabric];
    return {
      multiplier: fabricConfig.multiplier,
      additionalCost: fabricConfig.additionalCost
    };
  }

  /**
   * Calcule le coût du coloris
   */
  calculateColourwayCost(colourway) {
    if (!colourway || !this.pricingConfig.colourwayPricing[colourway]) {
      return 0;
    }
    return this.pricingConfig.colourwayPricing[colourway].additionalCost;
  }

  /**
   * Calcule le coût de l'embellissement
   */
  calculateEmbellishmentCost(embellishment) {
    if (!embellishment || !this.pricingConfig.embellishmentPricing[embellishment]) {
      return 0;
    }
    return this.pricingConfig.embellishmentPricing[embellishment].additionalCost;
  }

  /**
   * Calcule le coût des finitions
   */
  calculateFinishingsCost(finishings) {
    if (!finishings || !this.pricingConfig.finishingsPricing[finishings]) {
      return 0;
    }
    return this.pricingConfig.finishingsPricing[finishings].additionalCost;
  }

  /**
   * Calcule le coût de l'emballage
   */
  calculatePackagingCost(packaging) {
    if (!packaging || !this.pricingConfig.packagingPricing[packaging]) {
      return 0;
    }
    return this.pricingConfig.packagingPricing[packaging].additionalCost;
  }

  /**
   * Calcule le coût de livraison
   */
  calculateDeliveryCost(delivery) {
    if (!delivery || !this.pricingConfig.deliveryPricing[delivery]) {
      return this.pricingConfig.deliveryPricing.standard.cost;
    }
    return this.pricingConfig.deliveryPricing[delivery].cost;
  }

  /**
   * Calcule la remise quantité
   */
  calculateQuantityDiscount(quantity) {
    const discountTier = this.pricingConfig.quantityDiscounts.find(
      tier => quantity >= tier.min && quantity <= tier.max
    );
    return discountTier ? discountTier.discount : 0;
  }

  // Méthodes pour récupérer les noms des options
  getFabricName(fabric) {
    return this.pricingConfig.fabricPricing[fabric]?.name || 'Non spécifié';
  }

  getColourwayName(colourway) {
    return this.pricingConfig.colourwayPricing[colourway]?.name || 'Non spécifié';
  }

  getEmbellishmentName(embellishment) {
    return this.pricingConfig.embellishmentPricing[embellishment]?.name || 'Non spécifié';
  }

  getFinishingsName(finishings) {
    return this.pricingConfig.finishingsPricing[finishings]?.name || 'Non spécifié';
  }

  getPackagingName(packaging) {
    return this.pricingConfig.packagingPricing[packaging]?.name || 'Non spécifié';
  }

  getDeliveryName(delivery) {
    return this.pricingConfig.deliveryPricing[delivery]?.name || 'Non spécifié';
  }

  /**
   * Sauvegarde un devis dans la base de données
   * @param {Object} quote - Devis à sauvegarder
   * @returns {string} ID du devis sauvegardé
   */
  saveQuote(quote) {
    try {
      return database.createQuote(quote.garmentType, quote);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du devis:', error);
      throw error;
    }
  }

  /**
   * Récupère un devis par son ID
   * @param {string} quoteId - ID du devis
   * @returns {Object|null} Devis ou null
   */
  getQuoteById(quoteId) {
    try {
      return database.getQuoteById(quoteId);
    } catch (error) {
      console.error('Erreur lors de la récupération du devis:', error);
      return null;
    }
  }

  /**
   * Récupère tous les devis pour un type de vêtement
   * @param {string} garmentType - Type de vêtement
   * @returns {Array} Liste des devis
   */
  getQuotesByGarmentType(garmentType) {
    try {
      return database.getQuotesByGarmentType(garmentType);
    } catch (error) {
      console.error('Erreur lors de la récupération des devis:', error);
      return [];
    }
  }

  /**
   * Met à jour un devis existant
   * @param {string} quoteId - ID du devis
   * @param {Object} updateData - Nouvelles données
   * @returns {boolean} Succès de la mise à jour
   */
  updateQuote(quoteId, updateData) {
    try {
      return database.updateQuote(quoteId, updateData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du devis:', error);
      return false;
    }
  }

  /**
   * Génère un devis rapide avec des valeurs par défaut
   * @param {string} garmentType - Type de vêtement
   * @param {number} quantity - Quantité
   * @returns {Object} Devis rapide
   */
  generateQuickQuote(garmentType = 'tshirt', quantity = 1) {
    const defaultSelections = {
      garmentType,
      fabric: 'cotton',
      colourway: 'single',
      embellishment: 'none',
      finishings: 'standard',
      packaging: 'standard',
      delivery: 'standard',
      quantity,
      isCustomSize: false,
      isRushOrder: false
    };

    return this.calculateQuote(defaultSelections);
  }
}

// Export d'une instance unique
const quoteService = new QuoteService();
export default quoteService;