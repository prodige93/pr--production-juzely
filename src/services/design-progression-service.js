// Service pour gérer les progressions de design avec sauvegarde automatique

class DesignProgressionService {
  constructor() {
    this.STORAGE_KEY = 'design_progressions';
    this.AUTO_SAVE_INTERVAL = 30000; // 30 secondes
    this.autoSaveTimer = null;
  }

  /**
   * Génère un ID unique pour une progression
   * @param {string} garmentType - Type de vêtement
   * @returns {string} ID unique
   */
  generateProgressionId(garmentType) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6);
    return `${garmentType}_prog_${timestamp}_${random}`;
  }

  /**
   * Sauvegarde automatique d'une progression
   * @param {string} garmentType - Type de vêtement
   * @param {Object} designData - Données du design
   * @param {boolean} isManual - Si c'est une sauvegarde manuelle
   * @returns {string} ID de la progression
   */
  saveProgression(garmentType, designData, isManual = false) {
    try {
      const progressionId = this.generateProgressionId(garmentType);
      const now = new Date().toISOString();
      
      const progression = {
        id: progressionId,
        garmentType,
        designData: { ...designData },
        createdAt: now,
        updatedAt: now,
        isManualSave: isManual,
        status: 'draft',
        version: 1,
        title: this.generateTitle(garmentType, designData),
        thumbnail: this.generateThumbnail(designData)
      };

      const progressions = this.getAllProgressions();
      progressions.push(progression);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progressions));
      
      console.log(`Progression sauvegardée: ${progressionId} (${isManual ? 'manuel' : 'auto'})`);
      return progressionId;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de progression:', error);
      throw error;
    }
  }

  /**
   * Met à jour une progression existante
   * @param {string} progressionId - ID de la progression
   * @param {Object} designData - Nouvelles données
   * @param {boolean} isManual - Si c'est une sauvegarde manuelle
   * @returns {boolean} Succès de la mise à jour
   */
  updateProgression(progressionId, designData, isManual = false) {
    try {
      const progressions = this.getAllProgressions();
      const index = progressions.findIndex(p => p.id === progressionId);
      
      if (index !== -1) {
        progressions[index] = {
          ...progressions[index],
          designData: { ...designData },
          updatedAt: new Date().toISOString(),
          isManualSave: isManual,
          version: progressions[index].version + 1,
          title: this.generateTitle(progressions[index].garmentType, designData),
          thumbnail: this.generateThumbnail(designData)
        };
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progressions));
        console.log(`Progression mise à jour: ${progressionId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de progression:', error);
      return false;
    }
  }

  /**
   * Récupère toutes les progressions
   * @returns {Array} Liste des progressions
   */
  getAllProgressions() {
    try {
      const progressions = localStorage.getItem(this.STORAGE_KEY);
      return progressions ? JSON.parse(progressions) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des progressions:', error);
      return [];
    }
  }

  /**
   * Récupère les progressions par type de vêtement
   * @param {string} garmentType - Type de vêtement
   * @returns {Array} Liste des progressions filtrées
   */
  getProgressionsByGarmentType(garmentType) {
    return this.getAllProgressions()
      .filter(p => p.garmentType === garmentType)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  /**
   * Récupère une progression par ID
   * @param {string} progressionId - ID de la progression
   * @returns {Object|null} Progression ou null
   */
  getProgressionById(progressionId) {
    const progressions = this.getAllProgressions();
    return progressions.find(p => p.id === progressionId) || null;
  }

  /**
   * Supprime une progression
   * @param {string} progressionId - ID de la progression
   * @returns {boolean} Succès de la suppression
   */
  deleteProgression(progressionId) {
    try {
      const progressions = this.getAllProgressions();
      const filteredProgressions = progressions.filter(p => p.id !== progressionId);
      
      if (filteredProgressions.length !== progressions.length) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredProgressions));
        console.log(`Progression supprimée: ${progressionId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la suppression de progression:', error);
      return false;
    }
  }

  /**
   * Génère un titre pour la progression
   * @param {string} garmentType - Type de vêtement
   * @param {Object} designData - Données du design
   * @returns {string} Titre généré
   */
  generateTitle(garmentType, designData) {
    const garmentNames = {
      'tshirt': 'T-Shirt',
      'hoodie': 'Hoodie',
      'pull': 'Pull',
      'crewneck': 'Crewneck',
      'longsleeve': 'Longsleeve',
      'ziphoodie': 'Zip Hoodie'
    };
    
    const garmentName = garmentNames[garmentType] || garmentType;
    const fabric = designData.fabric || 'Standard';
    const colorway = designData.colorway || 'Default';
    
    return `${garmentName} ${fabric} - ${colorway}`;
  }

  /**
   * Génère une miniature pour la progression
   * @param {Object} designData - Données du design
   * @returns {string} URL de la miniature ou placeholder
   */
  generateThumbnail(designData) {
    if (designData.uploadedImage && designData.uploadedImage.preview) {
      return designData.uploadedImage.preview;
    }
    
    // Générer une miniature basée sur les couleurs sélectionnées
    const color = designData.colorway || '#6c757d';
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="${color}"/>
        <text x="50" y="55" text-anchor="middle" fill="white" font-size="12" font-family="Arial">
          ${designData.fabric || 'Design'}
        </text>
      </svg>
    `)}`;
  }

  /**
   * Démarre la sauvegarde automatique
   * @param {Function} saveCallback - Fonction de sauvegarde
   */
  startAutoSave(saveCallback) {
    this.stopAutoSave(); // Arrêter le timer existant
    
    this.autoSaveTimer = setInterval(() => {
      if (typeof saveCallback === 'function') {
        saveCallback();
      }
    }, this.AUTO_SAVE_INTERVAL);
    
    console.log('Sauvegarde automatique démarrée');
  }

  /**
   * Arrête la sauvegarde automatique
   */
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
      console.log('Sauvegarde automatique arrêtée');
    }
  }

  /**
   * Nettoie les anciennes progressions
   * @param {number} maxProgressions - Nombre maximum de progressions à conserver
   */
  cleanupOldProgressions(maxProgressions = 50) {
    try {
      const progressions = this.getAllProgressions();
      
      if (progressions.length > maxProgressions) {
        // Trier par date de mise à jour (plus récent en premier)
        const sortedProgressions = progressions
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, maxProgressions);
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sortedProgressions));
        console.log(`${progressions.length - maxProgressions} anciennes progressions supprimées`);
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage des progressions:', error);
    }
  }

  /**
   * Exporte les progressions
   * @returns {Object} Données d'export
   */
  exportProgressions() {
    return {
      progressions: this.getAllProgressions(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }

  /**
   * Importe les progressions
   * @param {Object} data - Données à importer
   * @returns {boolean} Succès de l'importation
   */
  importProgressions(data) {
    try {
      if (data.progressions && Array.isArray(data.progressions)) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.progressions));
        console.log('Progressions importées avec succès');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de l\'importation des progressions:', error);
      return false;
    }
  }
}

// Instance singleton
const designProgressionService = new DesignProgressionService();
export default designProgressionService;