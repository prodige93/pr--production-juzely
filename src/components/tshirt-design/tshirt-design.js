import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import database from '../../utils/database';
import designProgressionService from '../../services/design-progression-service';
import QuoteSystem from '../quote-system/quote-system';
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
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [selectedColourway, setSelectedColourway] = useState(null);
  const [selectedNecklabel, setSelectedNecklabel] = useState(null);
  const [selectedCorelabel, setSelectedCorelabel] = useState(null);
  const [selectedEmbellishment, setSelectedEmbellishment] = useState(null);
  const [selectedFinishings, setSelectedFinishings] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPackaging, setSelectedPackaging] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [editableSizeData, setEditableSizeData] = useState({});
  const [isModified, setIsModified] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectionId, setSelectionId] = useState(null);
  const [comments, setComments] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('fit');
  const [currentProgressionId, setCurrentProgressionId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Fonction pour créer les données de design actuelles
  const getCurrentDesignData = useCallback(() => {
    return {
      fit: selectedFit,
      fabric: selectedFabric,
      colourway: selectedColourway,
      necklabel: selectedNecklabel,
      corelabel: selectedCorelabel,
      embellishment: selectedEmbellishment,
      finishings: selectedFinishings,
      quantity: selectedQuantity,
      packaging: selectedPackaging,
      delivery: selectedDelivery,
      sizeData: editableSizeData,
      uploadedImage: uploadedImage,
      measurements: [],
      comments: comments
    };
  }, [selectedFit, selectedFabric, selectedColourway, selectedNecklabel, selectedCorelabel, selectedEmbellishment, selectedFinishings, selectedQuantity, selectedPackaging, selectedDelivery, editableSizeData, uploadedImage, comments]);

  // Fonction pour sauvegarder automatiquement la progression
  const autoSaveProgression = useCallback(() => {
    try {
      const designData = getCurrentDesignData();
      
      if (currentProgressionId) {
        // Mettre à jour la progression existante
        const success = designProgressionService.updateProgression(currentProgressionId, designData, false);
        if (success) {
          setLastAutoSave(new Date());
          setHasUnsavedChanges(false);
          console.log('Progression auto-sauvegardée:', currentProgressionId);
        }
      } else {
        // Créer une nouvelle progression
        const progressionId = designProgressionService.saveProgression('tshirt', designData, false);
        setCurrentProgressionId(progressionId);
        setLastAutoSave(new Date());
        setHasUnsavedChanges(false);
        console.log('Nouvelle progression créée:', progressionId);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde automatique:', error);
    }
  }, [getCurrentDesignData, currentProgressionId]);

  // Fonction pour sauvegarder manuellement (bouton Save & Next)
  const manualSaveProgression = useCallback(() => {
    try {
      const designData = getCurrentDesignData();
      
      if (currentProgressionId) {
        // Mettre à jour la progression existante
        const success = designProgressionService.updateProgression(currentProgressionId, designData, true);
        if (success) {
          setLastAutoSave(new Date());
          setHasUnsavedChanges(false);
          alert('Design sauvegardé avec succès!');
          console.log('Progression manuellement sauvegardée:', currentProgressionId);
        }
      } else {
        // Créer une nouvelle progression
        const progressionId = designProgressionService.saveProgression('tshirt', designData, true);
        setCurrentProgressionId(progressionId);
        setLastAutoSave(new Date());
        setHasUnsavedChanges(false);
        alert('Nouveau design sauvegardé avec succès!');
        console.log('Nouvelle progression manuellement créée:', progressionId);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde manuelle:', error);
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  }, [getCurrentDesignData, currentProgressionId]);

  // Marquer les changements comme non sauvegardés quand les données changent
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [selectedFit, selectedFabric, selectedColourway, selectedNecklabel, selectedCorelabel, selectedEmbellishment, selectedFinishings, selectedQuantity, selectedPackaging, selectedDelivery, editableSizeData, uploadedImage, comments]);

  // Sauvegarde automatique après un délai d'inactivité
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timeoutId = setTimeout(() => {
        autoSaveProgression();
      }, 3000); // Sauvegarde après 3 secondes d'inactivité

      return () => clearTimeout(timeoutId);
    }
  }, [hasUnsavedChanges, autoSaveProgression]);

  // Démarrer la sauvegarde automatique périodique
  useEffect(() => {
    designProgressionService.startAutoSave(() => {
      if (hasUnsavedChanges) {
        autoSaveProgression();
      }
    });

    return () => {
      designProgressionService.stopAutoSave();
    };
  }, [hasUnsavedChanges, autoSaveProgression]);

  // Restaurer les données de progression si on vient de "Continuer"
  useEffect(() => {
    if (location.state && location.state.progressionId && location.state.designData) {
      const { progressionId, designData } = location.state;
      
      // Restaurer l'ID de progression
      setCurrentProgressionId(progressionId);
      
      // Restaurer toutes les données du design
      if (designData.fit) setSelectedFit(designData.fit);
      if (designData.fabric) setSelectedFabric(designData.fabric);
      if (designData.colourway) setSelectedColourway(designData.colourway);
      if (designData.necklabel) setSelectedNecklabel(designData.necklabel);
      if (designData.corelabel) setSelectedCorelabel(designData.corelabel);
      if (designData.embellishment) setSelectedEmbellishment(designData.embellishment);
      if (designData.finishings) setSelectedFinishings(designData.finishings);
      if (designData.quantity) setSelectedQuantity(designData.quantity);
      if (designData.packaging) setSelectedPackaging(designData.packaging);
      if (designData.delivery) setSelectedDelivery(designData.delivery);
      if (designData.sizeData) setEditableSizeData(designData.sizeData);
      if (designData.uploadedImage) setUploadedImage(designData.uploadedImage);
      if (designData.comments) setComments(designData.comments);
      
      // Marquer comme non modifié puisqu'on vient de charger
      setHasUnsavedChanges(false);
      
      console.log('Progression restaurée:', progressionId, designData);
    }
  }, [location.state]);
  
  const handleMyOrdersClick = () => {
    navigate('/');
  };

  // Fonction pour afficher les designs sauvegardés
  const showSavedDesigns = () => {
    try {
      const savedDesigns = database.getDesignsByGarmentType('tshirt');
      if (savedDesigns.length === 0) {
        alert('Aucun design T-shirt sauvegardé trouvé.');
        return;
      }
      
      let designsList = 'Designs T-shirt sauvegardés:\n\n';
      savedDesigns.forEach((design, index) => {
        designsList += `${index + 1}. ID: ${design.id}\n`;
        designsList += `   Coupe: ${design.fit}\n`;
        designsList += `   Tissu: ${design.fabric || 'Non sélectionné'}\n`;
        designsList += `   Coloris: ${design.colourway || 'Non sélectionné'}\n`;
        designsList += `   Créé le: ${new Date(design.createdAt).toLocaleDateString('fr-FR')}\n`;
        designsList += `   Modifié le: ${new Date(design.updatedAt).toLocaleDateString('fr-FR')}\n\n`;
      });
      
      alert(designsList);
    } catch (error) {
      console.error('Erreur lors de la récupération des designs:', error);
      alert('Erreur lors de la récupération des designs sauvegardés.');
    }
  };
  
  const handleBackToSelection = () => {
    navigate('/design');
  };

  // Définition des mesures
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
            size: file.size,
            preview: preview
          });
          setImagePreview(preview);
          setHasUnsavedChanges(true);
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

   // Reset all size data to 0
   const resetSizeData = () => {
     const resetData = {};
     Object.keys(editableSizeData).forEach(size => {
       resetData[size] = {};
       measurements.forEach(measurement => {
         resetData[size][measurement.key] = '0';
       });
     });
     setEditableSizeData(resetData);
     setIsModified(true);
     
     // Sélectionner automatiquement le premier champ après reset
     setTimeout(() => {
       const firstInput = document.querySelector('.size-table input[type="number"]');
       if (firstInput) {
         firstInput.focus();
         firstInput.select();
       }
     }, 100);
   };
   
  // Handle quote generation
  const handleGenerateQuote = async () => {
    if (!selectedFit) {
      alert("Veuillez sélectionner un 'Fit' avant de générer un devis.");
      return;
    }

    const quoteData = {
      client: {
        name: 'Client Name', // Remplacer par les vraies données client
        email: 'client@example.com',
      },
      garment: {
        type: 'tshirt',
        name: 'T-Shirt',
        fit: selectedFit,
        quantity: selectedQuantity,
        sizes: editableSizeData, // Données de taille
        measurements: measurements.map(m => ({
          ...m,
          values: Object.keys(editableSizeData).reduce((acc, size) => {
            acc[size] = editableSizeData[size][m.key] || 0;
            return acc;
          }, {}),
        })),
      },
      customization: {
        fabric: selectedFabric,
        colourway: selectedColourway,
        necklabel: selectedNecklabel,
        corelabel: selectedCorelabel,
        embellishment: selectedEmbellishment,
        finishings: selectedFinishings,
        uploadedImage: uploadedImage ? uploadedImage.id : null,
        comments: comments,
      },
      image_metadata: uploadedImage ? {
        name: uploadedImage.name,
        type: uploadedImage.type,
        size: uploadedImage.size,
      } : null,
      pricing: {
        totalPrice: 0, // Calculer le prix total
        currency: 'EUR',
      },
      delivery: {
        packaging: selectedPackaging,
        address: '123 Rue de Paris, 75001 Paris', // Remplacer par l'adresse de livraison
      },
      metadata: {
        selectionId: selectionId,
        isModified: isModified,
      },
    };

    try {
      const quoteId = await database.createQuote('tshirt', quoteData);
      if (quoteId) {
        alert(`Devis généré avec succès ! ID du devis : ${quoteId}`);
        setActiveTab('fabric'); // Rediriger vers l'onglet Fabric
        // navigate('/my-orders'); // Optionnel: rediriger vers la page des commandes
      } else {
        alert('Erreur lors de la génération du devis. Aucun ID retourné.');
      }
    } catch (error) {
      console.error('Erreur lors de la génération du devis:', error);
      alert(`Une erreur est survenue : ${error.message}`);
    }
  };

  const fitOptions = [
    { id: 'oversized', label: 'Oversized Fit' },
    { id: 'regular', label: 'Regular Fit' },
    { id: 'slim', label: 'Slim Fit' },
    { id: 'custom', label: 'Custom Fit' },
    { id: 'cropped', label: 'Cropped (1/2 Sleeve) Fit' }
  ];

  // Fonction pour rendre le contenu selon l'onglet actif
  const renderTabContent = () => {
    switch (activeTab) {
      case 'fit':
        return renderFitContent();
      case 'fabric':
        return renderFabricContent();
      case 'colourway':
        return renderColourwayContent();
      case 'necklabel':
        return renderNecklabelContent();
      case 'corelabel':
        return renderCorelabelContent();
      case 'embellishment':
        return renderEmbellishmentContent();
      case 'finishings':
        return renderFinishingsContent();
      case 'quantity':
        return renderQuantityContent();
      case 'packaging':
        return renderPackagingContent();
      case 'delivery':
        return renderDeliveryContent();
      case 'quote':
        return renderQuoteContent();
      default:
        return renderFitContent();
    }
  };

  // Contenu de l'onglet Devis
  const renderQuoteContent = () => {
    // Préparer les sélections pour le système de devis
    const selections = {
      fabric: selectedFabric,
      colourway: selectedColourway,
      embellishment: selectedEmbellishment,
      finishings: selectedFinishings,
      packaging: selectedPackaging,
      delivery: selectedDelivery,
      quantity: selectedQuantity,
      isCustomSize: selectedFit === 'custom',
      isRushOrder: false // Peut être ajouté comme option
    };

    return (
      <div className="tab-content">
        <h3>Devis pour votre T-Shirt</h3>
        <div className="quote-container">
          <QuoteSystem 
            garmentType="tshirt"
            selections={selections}
            onQuoteCalculated={(quote) => {
              console.log('Devis calculé:', quote);
            }}
            showDetailedBreakdown={true}
            autoCalculate={true}
          />
        </div>
        
        {/* Résumé des sélections */}
        <div className="selections-summary">
          <h4>📋 Résumé de vos sélections</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <strong>Fit:</strong> {selectedFit || 'Non sélectionné'}
            </div>
            <div className="summary-item">
              <strong>Tissu:</strong> {selectedFabric || 'Non sélectionné'}
            </div>
            <div className="summary-item">
              <strong>Coloris:</strong> {selectedColourway || 'Non sélectionné'}
            </div>
            <div className="summary-item">
              <strong>Embellissement:</strong> {selectedEmbellishment || 'Non sélectionné'}
            </div>
            <div className="summary-item">
              <strong>Finitions:</strong> {selectedFinishings || 'Non sélectionné'}
            </div>
            <div className="summary-item">
              <strong>Emballage:</strong> {selectedPackaging || 'Non sélectionné'}
            </div>
            <div className="summary-item">
              <strong>Livraison:</strong> {selectedDelivery || 'Non sélectionné'}
            </div>
            <div className="summary-item">
              <strong>Quantité:</strong> {selectedQuantity}
            </div>
            {uploadedImage && (
              <div className="summary-item">
                <strong>Image:</strong> {uploadedImage.name}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Contenu de l'onglet Fit
  const renderFitContent = () => {
    return (
      <>
        <div className="fit-selection">
          <h3>Sélectionnez le fit de votre T-Shirt</h3>
          <div className="fit-options">
            <div className="fit-options-container" style={{ transform: `translateX(-${currentSlide * 220}px)` }}>
              {fitOptions.map((option, index) => (
                <label 
                  key={option.id} 
                  className={`fit-option ${selectedFit === option.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedFit(option.id);
                    setIsModified(true);
                  }}
                >
                  <input
                    type="radio"
                    name="fit"
                    value={option.id}
                    checked={selectedFit === option.id}
                    onChange={() => {}}
                    style={{ display: 'none' }}
                  />
                  <div className="fit-icon"></div>
                  <span className="fit-label">{option.label}</span>
                </label>
              ))}
            </div>
            
            <div className="slide-controls">
              <button 
                className="slide-button"
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
              >
                ←
              </button>
              
              <div className="slide-indicators">
                <div className="indicator-track">
                  {fitOptions.map((option, dotIndex) => {
                    const selectedIndex = fitOptions.findIndex(opt => opt.id === selectedFit);
                    const totalElements = fitOptions.length;
                    const spacing = 20;
                    const trackWidth = (totalElements - 1) * spacing;
                    const startPosition = -trackWidth / 2;
                    const pointPosition = startPosition + (dotIndex * spacing);
                    const isActive = dotIndex === selectedIndex;
                    
                    return (
                      <div
                        key={dotIndex}
                        className={`slide-indicator ${isActive ? 'active' : ''}`}
                        style={{
                          transform: `translateX(${pointPosition}px)`,
                          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                        }}
                        onClick={() => {
                          setSelectedFit(option.id);
                          setIsModified(true);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              
              <button 
                className="slide-button"
                onClick={() => setCurrentSlide(Math.min(Math.ceil(fitOptions.length / 3) - 1, currentSlide + 1))}
                disabled={currentSlide >= Math.ceil(fitOptions.length / 3) - 1}
              >
                →
              </button>
            </div>
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
              <path d="M50 60 L50 40 Q50 30 60 30 L80 30 Q90 20 110 20 Q130 20 140 30 L160 30 Q170 30 170 40 L170 60 L150 80 L150 220 Q150 230 140 230 L60 230 Q50 230 50 220 L50 80 Z" 
                    fill="#f8f9fa" 
                    stroke="#333" 
                    strokeWidth="2"/>
              <ellipse cx="40" cy="70" rx="15" ry="25" fill="#f8f9fa" stroke="#333" strokeWidth="2"/>
              <ellipse cx="180" cy="70" rx="15" ry="25" fill="#f8f9fa" stroke="#333" strokeWidth="2"/>
              <ellipse cx="110" cy="35" rx="20" ry="10" fill="white" stroke="#333" strokeWidth="2"/>
            </svg>
          </div>
        </div>

        <div className="size-chart-section">
          <div className="size-chart-header">
            <h3>Tableau des tailles T-Shirt (en cm)</h3>
            <button 
              onClick={resetSizeData}
              className="reset-sizes-button"
              type="button"
            >
              Reset des tailles
            </button>
          </div>
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
          <div className="comments-section">
            <label htmlFor="comments" className="comments-label">Demandes spéciales ou commentaires</label>
            <textarea
              id="comments"
              className="comments-textarea"
              value={comments}
              onChange={(e) => {
                setComments(e.target.value);
                setIsModified(true);
              }}
              placeholder="Ajoutez vos commentaires ou demandes spéciales ici..."
              rows={4}
            />
          </div>
          <button 
            onClick={handleGenerateQuote}
            className="generate-quote-button"
            disabled={!isModified && !uploadedImage}
          >
            Save & Next
          </button>
          {selectionId && (
            <p className="selection-info">ID de sélection: {selectionId}</p>
          )}
        </div>
      </>
    );
  };

  // Handle fabric save and next

  const handleFabricSaveNext = () => {
    if (!selectedFabric) {
      alert("Veuillez sélectionner un tissu avant de continuer.");
      return;
    }
    
    try {
      manualSaveProgression();
      const currentId = currentProgressionId || selectionId;
      
      alert(`Tissu sauvegardé avec succès! ID de sélection: ${currentId}`);
      setActiveTab('colourway'); // Rediriger vers l'onglet Colourway
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  // Contenu de l'onglet Fabric
  const renderFabricContent = () => {
    const fabricOptions = [
      { id: 'coton-200', label: '200gsm, 100%, Coton' },
      { id: 'coton-240', label: '240gsm, 100%, Coton' },
      { id: 'coton-270', label: '270gsm, 100%, Coton' },
      { id: 'coton-340', label: '340gsm, 100%, Coton' }
    ];
    
    return (
      <div className="tab-content">
        <h3>Sélectionnez le tissu</h3>
        <div className="actions-section">
          <div className="options-grid">
            {fabricOptions.map((option, index) => (
              <label key={`${option.id}-${index}`} className={`option-card ${selectedFabric === option.id ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="fabric"
                  value={option.id}
                  checked={selectedFabric === option.id}
                  onChange={() => {
                    setSelectedFabric(option.id);
                    setIsModified(true);
                  }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <button 
            onClick={handleFabricSaveNext}
            className="generate-quote-button"
            disabled={!selectedFabric}
          >
            Save & Next
          </button>
          {selectionId && (
            <p className="selection-info">ID de sélection: {selectionId}</p>
          )}
        </div>
      </div>
    );
  };

  const renderColourwayContent = () => {
    const colourwayOptions = [
      { id: 'white', label: 'Blanc' },
      { id: 'black', label: 'Noir' },
      { id: 'navy', label: 'Bleu Marine' },
      { id: 'grey', label: 'Gris' },
      { id: 'red', label: 'Rouge' }
    ];
    
    return (
      <div className="tab-content">
        <h3>Sélectionnez la couleur</h3>
        <div className="options-grid">
          {colourwayOptions.map(option => (
            <label key={option.id} className={`option-card ${selectedColourway === option.id ? 'selected' : ''}`}>
              <input
                type="radio"
                name="colourway"
                value={option.id}
                checked={selectedColourway === option.id}
                onChange={() => {
                  setSelectedColourway(option.id);
                  setIsModified(true);
                }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderNecklabelContent = () => {
    const necklabelOptions = [
      { id: 'none', label: 'Aucune étiquette' },
      { id: 'standard', label: 'Étiquette standard' },
      { id: 'custom', label: 'Étiquette personnalisée' }
    ];
    
    return (
      <div className="tab-content">
        <h3>Étiquette de cou</h3>
        <div className="options-grid">
          {necklabelOptions.map(option => (
            <label key={option.id} className={`option-card ${selectedNecklabel === option.id ? 'selected' : ''}`}>
              <input
                type="radio"
                name="necklabel"
                value={option.id}
                checked={selectedNecklabel === option.id}
                onChange={() => {
                  setSelectedNecklabel(option.id);
                  setIsModified(true);
                }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderCorelabelContent = () => {
    const corelabelOptions = [
      { id: 'none', label: 'Aucune étiquette' },
      { id: 'standard', label: 'Étiquette standard' },
      { id: 'custom', label: 'Étiquette personnalisée' }
    ];
    
    return (
      <div className="tab-content">
        <h3>Étiquette principale</h3>
        <div className="options-grid">
          {corelabelOptions.map(option => (
            <label key={option.id} className={`option-card ${selectedCorelabel === option.id ? 'selected' : ''}`}>
              <input
                type="radio"
                name="corelabel"
                value={option.id}
                checked={selectedCorelabel === option.id}
                onChange={() => {
                  setSelectedCorelabel(option.id);
                  setIsModified(true);
                }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderEmbellishmentContent = () => {
    const embellishmentOptions = [
      { id: 'none', label: 'Aucun' },
      { id: 'embroidery', label: 'Broderie' },
      { id: 'print', label: 'Impression' },
      { id: 'patch', label: 'Patch' }
    ];
    
    return (
      <div className="tab-content">
        <h3>Embellissement</h3>
        <div className="options-grid">
          {embellishmentOptions.map(option => (
            <label key={option.id} className={`option-card ${selectedEmbellishment === option.id ? 'selected' : ''}`}>
              <input
                type="radio"
                name="embellishment"
                value={option.id}
                checked={selectedEmbellishment === option.id}
                onChange={() => {
                  setSelectedEmbellishment(option.id);
                  setIsModified(true);
                }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderFinishingsContent = () => {
    const finishingsOptions = [
      { id: 'standard', label: 'Finition standard' },
      { id: 'premium', label: 'Finition premium' },
      { id: 'vintage', label: 'Finition vintage' }
    ];
    
    return (
      <div className="tab-content">
        <h3>Finitions</h3>
        <div className="options-grid">
          {finishingsOptions.map(option => (
            <label key={option.id} className={`option-card ${selectedFinishings === option.id ? 'selected' : ''}`}>
              <input
                type="radio"
                name="finishings"
                value={option.id}
                checked={selectedFinishings === option.id}
                onChange={() => {
                  setSelectedFinishings(option.id);
                  setIsModified(true);
                }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderQuantityContent = () => {
    return (
      <div className="tab-content">
        <h3>Quantité</h3>
        <div className="quantity-input">
          <label htmlFor="quantity">Nombre de pièces :</label>
          <input
            type="number"
            id="quantity"
            min="1"
            max="10000"
            value={selectedQuantity}
            onChange={(e) => {
              setSelectedQuantity(parseInt(e.target.value) || 1);
              setIsModified(true);
            }}
          />
        </div>
      </div>
    );
  };

  const renderPackagingContent = () => {
    const packagingOptions = [
      { id: 'standard', label: 'Emballage standard' },
      { id: 'premium', label: 'Emballage premium' },
      { id: 'eco', label: 'Emballage écologique' }
    ];
    
    return (
      <div className="tab-content">
        <h3>Emballage</h3>
        <div className="options-grid">
          {packagingOptions.map(option => (
            <label key={option.id} className={`option-card ${selectedPackaging === option.id ? 'selected' : ''}`}>
              <input
                type="radio"
                name="packaging"
                value={option.id}
                checked={selectedPackaging === option.id}
                onChange={() => {
                  setSelectedPackaging(option.id);
                  setIsModified(true);
                }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderDeliveryContent = () => {
    const deliveryOptions = [
      { id: 'standard', label: 'Livraison standard (7-10 jours)' },
      { id: 'express', label: 'Livraison express (3-5 jours)' },
      { id: 'urgent', label: 'Livraison urgente (1-2 jours)' }
    ];
    
    return (
      <div className="tab-content">
        <h3>Livraison</h3>
        <div className="options-grid">
          {deliveryOptions.map(option => (
            <label key={option.id} className={`option-card ${selectedDelivery === option.id ? 'selected' : ''}`}>
              <input
                type="radio"
                name="delivery"
                value={option.id}
                checked={selectedDelivery === option.id}
                onChange={() => {
                  setSelectedDelivery(option.id);
                  setIsModified(true);
                }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="tshirt-design-container">
      <div className="tshirt-design-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBackToSelection}>← Sélection</button>
          <button className="back-button" onClick={handleMyOrdersClick}>← My orders</button>
          <button className="back-button" onClick={showSavedDesigns}>📋 Designs sauvegardés</button>
        </div>
        <div className="header-right">
          <button 
            className="save-next-button" 
            onClick={manualSaveProgression}
            disabled={!hasUnsavedChanges}
          >
            💾 Save & Next
          </button>
          {lastAutoSave && (
            <span className="auto-save-indicator">
              Auto-sauvé: {new Date(lastAutoSave).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
      
      <div className="header-tabs">
          <span 
            className={`tab ${activeTab === 'fit' ? 'active' : ''}`}
            onClick={() => setActiveTab('fit')}
          >
            Fit - T-Shirt
          </span>
          <span 
            className={`tab ${activeTab === 'fabric' ? 'active' : ''}`}
            onClick={() => setActiveTab('fabric')}
          >
            Fabric
          </span>
          <span 
            className={`tab ${activeTab === 'colourway' ? 'active' : ''}`}
            onClick={() => setActiveTab('colourway')}
          >
            Colourway
          </span>
          <span 
            className={`tab ${activeTab === 'necklabel' ? 'active' : ''}`}
            onClick={() => setActiveTab('necklabel')}
          >
            Necklabel
          </span>
          <span 
            className={`tab ${activeTab === 'corelabel' ? 'active' : ''}`}
            onClick={() => setActiveTab('corelabel')}
          >
            Corelabel
          </span>
          <span 
            className={`tab ${activeTab === 'embellishment' ? 'active' : ''}`}
            onClick={() => setActiveTab('embellishment')}
          >
            Embellishment
          </span>
          <span 
            className={`tab ${activeTab === 'finishings' ? 'active' : ''}`}
            onClick={() => setActiveTab('finishings')}
          >
            Finishings
          </span>
          <span 
            className={`tab ${activeTab === 'quantity' ? 'active' : ''}`}
            onClick={() => setActiveTab('quantity')}
          >
            Quantity
          </span>
          <span 
            className={`tab ${activeTab === 'packaging' ? 'active' : ''}`}
            onClick={() => setActiveTab('packaging')}
          >
            Packaging
          </span>
          <span 
            className={`tab ${activeTab === 'delivery' ? 'active' : ''}`}
            onClick={() => setActiveTab('delivery')}
          >
            Delivery
          </span>
          <span 
            className={`tab ${activeTab === 'quote' ? 'active' : ''}`}
            onClick={() => setActiveTab('quote')}
          >
            💰 Devis
          </span>
        </div>

      <div className="tshirt-design-content">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default TshirtDesign;