// Système de base de données pour la gestion des images et devis
// Utilise localStorage comme simulation de base de données

class Database {
  constructor() {
    this.STORAGE_KEYS = {
      QUOTES: 'sizeChartQuotes',
      IMAGES: 'uploadedImages',
      SETTINGS: 'appSettings',
      GARMENT_SELECTIONS: 'garmentSelections',
      TSHIRT_DESIGNS: 'juzely_tshirt_designs',
      PULL_DESIGNS: 'juzely_pull_designs',
      HOODIE_DESIGNS: 'juzely_hoodie_designs',
      CREWNECK_DESIGNS: 'juzely_crewneck_designs',
      LONGSLEEVE_DESIGNS: 'juzely_longsleeve_designs',
      ZIPHOODIE_DESIGNS: 'juzely_ziphoodie_designs'
    };
  }

  // ========== GESTION DES IMAGES ==========
  
  /**
   * Sauvegarde une image dans la base de données
   * @param {File} file - Fichier image
   * @param {string} imagePreview - URL base64 de l'aperçu
   * @returns {string} ID unique de l'image
   */
  saveImage(file, imagePreview) {
    try {
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const imageData = {
        id: imageId,
        name: file.name,
        type: file.type,
        size: file.size,
        preview: imagePreview,
        uploadDate: new Date().toISOString(),
        lastModified: file.lastModified
      };
      
      const existingImages = this.getAllImages();
      existingImages[imageId] = imageData;
      
      localStorage.setItem(this.STORAGE_KEYS.IMAGES, JSON.stringify(existingImages));
      
      console.log('Image sauvegardée:', imageId, imageData.name);
      return imageId;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'image:', error);
      throw new Error('Impossible de sauvegarder l\'image');
    }
  }
  
  /**
   * Récupère toutes les images
   * @returns {Object} Objet contenant toutes les images
   */
  getAllImages() {
    try {
      const images = localStorage.getItem(this.STORAGE_KEYS.IMAGES);
      return images ? JSON.parse(images) : {};
    } catch (error) {
      console.error('Erreur lors de la récupération des images:', error);
      return {};
    }
  }
  
  /**
   * Récupère une image par son ID
   * @param {string} imageId - ID de l'image
   * @returns {Object|null} Données de l'image ou null
   */
  getImageById(imageId) {
    const images = this.getAllImages();
    return images[imageId] || null;
  }
  
  /**
   * Supprime une image
   * @param {string} imageId - ID de l'image à supprimer
   * @returns {boolean} Succès de la suppression
   */
  deleteImage(imageId) {
    try {
      const images = this.getAllImages();
      if (images[imageId]) {
        delete images[imageId];
        localStorage.setItem(this.STORAGE_KEYS.IMAGES, JSON.stringify(images));
        console.log('Image supprimée:', imageId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      return false;
    }
  }

  // ========== GESTION DES DEVIS ==========
  
  /**
   * Sauvegarde un devis complet
   * @param {Object} quoteData - Données du devis
   * @returns {string} ID du devis
   */
  saveQuote(quoteData) {
    try {
      const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const completeQuote = {
        id: quoteId,
        ...quoteData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      const existingQuotes = this.getAllQuotes();
      existingQuotes.push(completeQuote);
      
      localStorage.setItem(this.STORAGE_KEYS.QUOTES, JSON.stringify(existingQuotes));
      
      console.log('Devis sauvegardé:', quoteId);
      return quoteId;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du devis:', error);
      throw new Error('Impossible de sauvegarder le devis');
    }
  }
  
  /**
   * Récupère tous les devis
   * @returns {Array} Liste des devis
   */
  getAllQuotes() {
    try {
      const quotes = localStorage.getItem(this.STORAGE_KEYS.QUOTES);
      return quotes ? JSON.parse(quotes) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des devis:', error);
      return [];
    }
  }
  
  /**
   * Récupère un devis par son ID
   * @param {string} quoteId - ID du devis
   * @returns {Object|null} Données du devis ou null
   */
  getQuoteById(quoteId) {
    const quotes = this.getAllQuotes();
    return quotes.find(quote => quote.id === quoteId) || null;
  }
  
  /**
   * Met à jour un devis existant
   * @param {string} quoteId - ID du devis
   * @param {Object} updateData - Nouvelles données
   * @returns {boolean} Succès de la mise à jour
   */
  updateQuote(quoteId, updateData) {
    try {
      const quotes = this.getAllQuotes();
      const quoteIndex = quotes.findIndex(quote => quote.id === quoteId);
      
      if (quoteIndex !== -1) {
        quotes[quoteIndex] = {
          ...quotes[quoteIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem(this.STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
        console.log('Devis mis à jour:', quoteId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du devis:', error);
      return false;
    }
  }
  
  /**
   * Supprime un devis
   * @param {string} quoteId - ID du devis à supprimer
   * @returns {boolean} Succès de la suppression
   */
  deleteQuote(quoteId) {
    try {
      const quotes = this.getAllQuotes();
      const filteredQuotes = quotes.filter(quote => quote.id !== quoteId);
      
      if (filteredQuotes.length !== quotes.length) {
        localStorage.setItem(this.STORAGE_KEYS.QUOTES, JSON.stringify(filteredQuotes));
        console.log('Devis supprimé:', quoteId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la suppression du devis:', error);
      return false;
    }
  }

  // ========== FONCTIONS UTILITAIRES ==========
  
  /**
   * Recherche des devis par critères
   * @param {Object} criteria - Critères de recherche
   * @returns {Array} Devis correspondants
   */
  searchQuotes(criteria = {}) {
    const quotes = this.getAllQuotes();
    
    return quotes.filter(quote => {
      if (criteria.fit && quote.fit !== criteria.fit) return false;
      if (criteria.dateFrom && new Date(quote.createdAt) < new Date(criteria.dateFrom)) return false;
      if (criteria.dateTo && new Date(quote.createdAt) > new Date(criteria.dateTo)) return false;
      if (criteria.hasImage && !quote.uploadedImage) return false;
      
      return true;
    });
  }
  
  /**
   * Nettoie les données obsolètes
   * @param {number} daysOld - Nombre de jours pour considérer les données comme obsolètes
   */
  cleanupOldData(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      // Nettoyer les devis anciens
      const quotes = this.getAllQuotes();
      const recentQuotes = quotes.filter(quote => 
        new Date(quote.createdAt) > cutoffDate
      );
      
      if (recentQuotes.length !== quotes.length) {
        localStorage.setItem(this.STORAGE_KEYS.QUOTES, JSON.stringify(recentQuotes));
        console.log(`${quotes.length - recentQuotes.length} devis anciens supprimés`);
      }
      
      // Nettoyer les images non utilisées
      const images = this.getAllImages();
      const usedImageIds = recentQuotes
        .filter(quote => quote.uploadedImage && quote.uploadedImage.id)
        .map(quote => quote.uploadedImage.id);
      
      const cleanedImages = {};
      Object.keys(images).forEach(imageId => {
        if (usedImageIds.includes(imageId) || 
            new Date(images[imageId].uploadDate) > cutoffDate) {
          cleanedImages[imageId] = images[imageId];
        }
      });
      
      localStorage.setItem(this.STORAGE_KEYS.IMAGES, JSON.stringify(cleanedImages));
      
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  }
  
  /**
   * Exporte toutes les données
   * @returns {Object} Toutes les données de l'application
   */
  exportAllData() {
    return {
      quotes: this.getAllQuotes(),
      images: this.getAllImages(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }
  
  /**
   * Importe des données
   * @param {Object} data - Données à importer
   * @returns {boolean} Succès de l'importation
   */
  importData(data) {
    try {
      if (data.quotes) {
        localStorage.setItem(this.STORAGE_KEYS.QUOTES, JSON.stringify(data.quotes));
      }
      if (data.images) {
        localStorage.setItem(this.STORAGE_KEYS.IMAGES, JSON.stringify(data.images));
      }
      console.log('Données importées avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      return false;
    }
  }
  
  /**
   * Obtient les statistiques de la base de données
   * @returns {Object} Statistiques
   */
  getStats() {
    const quotes = this.getAllQuotes();
    const images = this.getAllImages();
    
    return {
      totalQuotes: quotes.length,
      totalImages: Object.keys(images).length,
      quotesWithImages: quotes.filter(q => q.uploadedImage).length,
      totalStorageSize: this.calculateStorageSize(),
      oldestQuote: quotes.length > 0 ? Math.min(...quotes.map(q => new Date(q.createdAt))) : null,
      newestQuote: quotes.length > 0 ? Math.max(...quotes.map(q => new Date(q.createdAt))) : null
    };
  }
  
  // ========== GESTION DES SÉLECTIONS DE VÊTEMENTS ==========
  
  /**
   * Sauvegarde une sélection de vêtement
   * @param {string} garmentType - Type de vêtement (tshirt, pull, etc.)
   * @param {Object} additionalData - Données supplémentaires
   * @returns {string} ID de la sélection
   */
  saveGarmentSelection(garmentType, additionalData = {}) {
    try {
      const selectionId = `selection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const selectionData = {
        id: selectionId,
        garmentType: garmentType,
        selectedAt: new Date().toISOString(),
        ...additionalData
      };
      
      const existingSelections = this.getAllGarmentSelections();
      existingSelections.push(selectionData);
      
      localStorage.setItem(this.STORAGE_KEYS.GARMENT_SELECTIONS, JSON.stringify(existingSelections));
      
      console.log('Sélection de vêtement sauvegardée:', selectionId, garmentType);
      return selectionId;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la sélection:', error);
      throw new Error('Impossible de sauvegarder la sélection');
    }
  }
  
  /**
   * Récupère toutes les sélections de vêtements
   * @returns {Array} Liste des sélections
   */
  getAllGarmentSelections() {
    try {
      const selections = localStorage.getItem(this.STORAGE_KEYS.GARMENT_SELECTIONS);
      return selections ? JSON.parse(selections) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des sélections:', error);
      return [];
    }
  }
  
  /**
   * Récupère les sélections par type de vêtement
   * @param {string} garmentType - Type de vêtement
   * @returns {Array} Liste des sélections filtrées
   */
  getSelectionsByGarmentType(garmentType) {
    const selections = this.getAllGarmentSelections();
    return selections.filter(selection => selection.garmentType === garmentType);
  }
  
  /**
   * Récupère une sélection par son ID
   * @param {string} selectionId - ID de la sélection
   * @returns {Object|null} Données de la sélection ou null
   */
  getSelectionById(selectionId) {
    const selections = this.getAllGarmentSelections();
    return selections.find(selection => selection.id === selectionId) || null;
  }
  
  /**
   * Supprime une sélection
   * @param {string} selectionId - ID de la sélection à supprimer
   * @returns {boolean} Succès de la suppression
   */
  deleteSelection(selectionId) {
    try {
      const selections = this.getAllGarmentSelections();
      const filteredSelections = selections.filter(selection => selection.id !== selectionId);
      
      localStorage.setItem(this.STORAGE_KEYS.GARMENT_SELECTIONS, JSON.stringify(filteredSelections));
      
      console.log('Sélection supprimée:', selectionId);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la sélection:', error);
      return false;
    }
  }

  // ========== MÉTHODES SPÉCIALISÉES PAR VÊTEMENT ==========
  
  /**
   * Sauvegarde un design de T-shirt avec ses spécifications
   * @param {Object} designData - Données du design T-shirt
   * @returns {string} ID du design sauvegardé
   */
  saveTshirtDesign(designData) {
    try {
      const designs = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.TSHIRT_DESIGNS) || '[]');
      const design = {
        id: this.generateId(),
        type: 'tshirt',
        garmentName: 'T-Shirt',
        fit: designData.fit || 'custom',
        fabric: designData.fabric || null,
        colourway: designData.colourway || null,
        necklabel: designData.necklabel || null,
        corelabel: designData.corelabel || null,
        embellishment: designData.embellishment || null,
        finishings: designData.finishings || null,
        quantity: designData.quantity || 1,
        packaging: designData.packaging || null,
        delivery: designData.delivery || null,
        sizeData: designData.sizeData || {},
        uploadedImage: designData.uploadedImage || null,
        measurements: designData.measurements || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      designs.push(design);
      localStorage.setItem(this.STORAGE_KEYS.TSHIRT_DESIGNS, JSON.stringify(designs));
      console.log('Design T-shirt sauvegardé:', design.id);
      return design.id;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du design T-shirt:', error);
      throw error;
    }
  }
  
  /**
   * Sauvegarde un design de Pull avec ses spécifications
   * @param {Object} designData - Données du design Pull
   * @returns {string} ID du design sauvegardé
   */
  savePullDesign(designData) {
    try {
      const designs = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PULL_DESIGNS) || '[]');
      const design = {
        id: this.generateId(),
        type: 'pull',
        garmentName: 'Pull',
        fit: designData.fit || 'custom',
        fabric: designData.fabric || null,
        colourway: designData.colourway || null,
        necklabel: designData.necklabel || null,
        corelabel: designData.corelabel || null,
        embellishment: designData.embellishment || null,
        finishings: designData.finishings || null,
        quantity: designData.quantity || 1,
        packaging: designData.packaging || null,
        delivery: designData.delivery || null,
        sizeData: designData.sizeData || {},
        uploadedImage: designData.uploadedImage || null,
        measurements: designData.measurements || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      designs.push(design);
      localStorage.setItem(this.STORAGE_KEYS.PULL_DESIGNS, JSON.stringify(designs));
      console.log('Design Pull sauvegardé:', design.id);
      return design.id;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du design Pull:', error);
      throw error;
    }
  }
  
  /**
   * Récupère tous les designs d'un type de vêtement spécifique
   * @param {string} garmentType - Type de vêtement (tshirt, pull, hoodie, etc.)
   * @returns {Array} Liste des designs
   */
  getDesignsByGarmentType(garmentType) {
    try {
      const storageKey = this.STORAGE_KEYS[`${garmentType.toUpperCase()}_DESIGNS`];
      if (!storageKey) {
        console.warn(`Type de vêtement non supporté: ${garmentType}`);
        return [];
      }
      
      return JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch (error) {
      console.error(`Erreur lors de la récupération des designs ${garmentType}:`, error);
      return [];
    }
  }
  
  /**
   * Met à jour un design existant
   * @param {string} garmentType - Type de vêtement
   * @param {string} designId - ID du design
   * @param {Object} updateData - Données à mettre à jour
   * @returns {boolean} Succès de la mise à jour
   */
  updateDesign(garmentType, designId, updateData) {
    try {
      const storageKey = this.STORAGE_KEYS[`${garmentType.toUpperCase()}_DESIGNS`];
      if (!storageKey) {
        console.warn(`Type de vêtement non supporté: ${garmentType}`);
        return false;
      }
      
      const designs = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const designIndex = designs.findIndex(design => design.id === designId);
      
      if (designIndex !== -1) {
        designs[designIndex] = {
          ...designs[designIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem(storageKey, JSON.stringify(designs));
        console.log(`Design ${garmentType} mis à jour:`, designId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du design ${garmentType}:`, error);
      return false;
    }
  }
  
  /**
   * Supprime un design
   * @param {string} garmentType - Type de vêtement
   * @param {string} designId - ID du design
   * @returns {boolean} Succès de la suppression
   */
  deleteDesign(garmentType, designId) {
    try {
      const storageKey = this.STORAGE_KEYS[`${garmentType.toUpperCase()}_DESIGNS`];
      if (!storageKey) {
        console.warn(`Type de vêtement non supporté: ${garmentType}`);
        return false;
      }
      
      const designs = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const filteredDesigns = designs.filter(design => design.id !== designId);
      
      if (filteredDesigns.length !== designs.length) {
        localStorage.setItem(storageKey, JSON.stringify(filteredDesigns));
        console.log(`Design ${garmentType} supprimé:`, designId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Erreur lors de la suppression du design ${garmentType}:`, error);
      return false;
    }
  }
  
  /**
   * Récupère un design spécifique par son ID
   * @param {string} garmentType - Type de vêtement
   * @param {string} designId - ID du design
   * @returns {Object|null} Design trouvé ou null
   */
  getDesignById(garmentType, designId) {
    try {
      const designs = this.getDesignsByGarmentType(garmentType);
      return designs.find(design => design.id === designId) || null;
    } catch (error) {
      console.error(`Erreur lors de la récupération du design ${garmentType}:`, error);
      return null;
    }
  }
  
  /**
   * Récupère les statistiques des designs par type de vêtement
   * @returns {Object} Statistiques
   */
  getDesignStatistics() {
    try {
      const stats = {};
      const garmentTypes = ['tshirt', 'pull', 'hoodie', 'crewneck', 'longsleeve', 'ziphoodie'];
      
      garmentTypes.forEach(type => {
        const designs = this.getDesignsByGarmentType(type);
        stats[type] = {
          total: designs.length,
          withImages: designs.filter(d => d.uploadedImage).length,
          byFit: designs.reduce((acc, d) => {
            acc[d.fit] = (acc[d.fit] || 0) + 1;
            return acc;
          }, {})
        };
      });
      
      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return {};
    }
  }

  /**
   * Calcule la taille approximative du stockage
   * @returns {string} Taille formatée
   */
  calculateStorageSize() {
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
        }
      }
      
      // Convertir en unités lisibles
      if (totalSize < 1024) return totalSize + ' B';
      if (totalSize < 1024 * 1024) return (totalSize / 1024).toFixed(2) + ' KB';
      return (totalSize / (1024 * 1024)).toFixed(2) + ' MB';
    } catch (error) {
      return 'Inconnu';
    }
  }
}

// Instance singleton de la base de données
const database = new Database();

export default database;

// Exports nommés pour faciliter l'utilisation
export {
  Database
};