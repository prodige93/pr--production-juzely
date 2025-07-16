import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import database from '../../utils/database';
import designProgressionService from '../../services/design-progression-service';
import QuoteSystem from '../quote-system/quote-system';
import './tshirt-design.css';

// Size data definition outside component to avoid re-creation on each render
const tshirtSizeData = {
  'XS': { bodyLenght: 65, chest: 52, bottom: 52, shoulders: 19, armhole: 23, sleeveLenghtOutside: 19, sleeveArmOpenning: 2.5, sleevelenghtInside: 18.5 },
  'S': { bodyLenght: 67, chest: 54, bottom: 54, shoulders: 20, armhole: 23.5, sleeveLenghtOutside: 19.5, sleeveArmOpenning: 2.5, sleevelenghtInside: 18.5 },
  'M': { bodyLenght: 69, chest: 56, bottom: 56, shoulders: 21, armhole: 24, sleeveLenghtOutside: 20, sleeveArmOpenning: 2.5, sleevelenghtInside: 18.5 },
  'L': { bodyLenght: 71, chest: 58, bottom: 58, shoulders: 22, armhole: 24.5, sleeveLenghtOutside: 20.5, sleeveArmOpenning: 2.5, sleevelenghtInside: 18.5 },
  'XL': { bodyLenght: 73, chest: 60, bottom: 60, shoulders: 23, armhole: 25, sleeveLenghtOutside: 21, sleeveArmOpenning: 2.5, sleevelenghtInside: 18.5 }
};

// Templates de tailles prédéfinies pour chaque fit
const predefinedSizeTemplates = {
  oversized: {
    name: 'Oversized',
    data: {
      'XS': { bodyLenght: 70, chest: 58, bottom: 58, shoulders: 22, armhole: 26, sleeveLenghtOutside: 22, sleeveArmOpenning: 2.5, sleevelenghtInside: 19 },
      'S': { bodyLenght: 72, chest: 60, bottom: 60, shoulders: 23, armhole: 26.5, sleeveLenghtOutside: 22.5, sleeveArmOpenning: 2.5, sleevelenghtInside: 19 },
      'M': { bodyLenght: 74, chest: 62, bottom: 62, shoulders: 24, armhole: 27, sleeveLenghtOutside: 23, sleeveArmOpenning: 2.5, sleevelenghtInside: 19 },
      'L': { bodyLenght: 76, chest: 64, bottom: 64, shoulders: 25, armhole: 27.5, sleeveLenghtOutside: 23.5, sleeveArmOpenning: 2.5, sleevelenghtInside: 19 },
      'XL': { bodyLenght: 78, chest: 66, bottom: 66, shoulders: 26, armhole: 28, sleeveLenghtOutside: 24, sleeveArmOpenning: 2.5, sleevelenghtInside: 19 }
    }
  },
  regular: {
    name: 'Regular',
    data: {
      'XS': { bodyLenght: 61, chest: 50, bottom: 50, shoulders: 19, armhole: 23, sleeveLenghtOutside: 19, sleeveArmOpenning: 2.5, sleevelenghtInside: 18.5 },
      'S': { bodyLenght: 67, chest: 54, bottom: 54, shoulders: 20, armhole: 23.5, sleeveLenghtOutside: 19.5, sleeveArmOpenning: 2.5, sleevelenghtInside: 18.5 },
      'M': { bodyLenght: 69, chest: 56, bottom: 56, shoulders: 21, armhole: 24, sleeveLenghtOutside: 20, sleeveArmOpenning: 2.5, sleevelenghtInside: 18.5 },
      'L': { bodyLenght: 71, chest: 58, bottom: 58, shoulders: 22, armhole: 24.5, sleeveLenghtOutside: 20.5, sleeveArmOpenning: 2.5, sleevelenghtInside: 18.5 },
      'XL': { bodyLenght: 73, chest: 60, bottom: 60, shoulders: 23, armhole: 25, sleeveLenghtOutside: 21, sleeveArmOpenning: 2.5, sleevelenghtInside: 18.5 }
    }
  },
  boxy: {
    name: 'Boxy',
    data: {
      'XS': { bodyLenght: 68, chest: 56, bottom: 56, shoulders: 21, armhole: 25, sleeveLenghtOutside: 20, sleeveArmOpenning: 2.5, sleevelenghtInside: 18.5 },
      'S': { bodyLenght: 70, chest: 58, bottom: 58, shoulders: 22, armhole: 25.5, sleeveLenghtOutside: 20.5, sleeveArmOpenning: 2.5, sleevelenghtInside: 18.5 },
      'M': { bodyLenght: 72, chest: 60, bottom: 60, shoulders: 23, armhole: 26, sleeveLenghtOutside: 21, sleeveArmOpenning: 2.5, sleevelenghtInside: 18.5 },
      'L': { bodyLenght: 74, chest: 62, bottom: 62, shoulders: 24, armhole: 26.5, sleeveLenghtOutside: 21.5, sleeveArmOpenning: 2.5, sleevelenghtInside: 18.5 },
      'XL': { bodyLenght: 76, chest: 64, bottom: 64, shoulders: 25, armhole: 27, sleeveLenghtOutside: 22, sleeveArmOpenning: 2.5, sleevelenghtInside: 18.5 }
    }
  },
  custom: {
    name: 'Custom',
    data: tshirtSizeData // Utilise les données par défaut pour custom
  }
};

function TshirtDesign() {
  const [selectedFit, setSelectedFit] = useState('custom');
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [customFabric, setCustomFabric] = useState('');
  const [selectedColourway, setSelectedColourway] = useState(null);
  const [selectedNecklabel, setSelectedNecklabel] = useState(null);
  const [selectedWashlabel, setSelectedWashlabel] = useState(null);
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
  // États pour les options spéciales de marquage
  const [isBroderie3D, setIsBroderie3D] = useState(false);
  const [isPuffPrint, setIsPuffPrint] = useState(false);
  // const [currentSlide, setCurrentSlide] = useState(0);
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
      fabric: selectedFabric === 'custom' ? customFabric : selectedFabric,
      colourway: selectedColourway,
      necklabel: selectedNecklabel,
      corelabel: selectedCorelabel,
      embellishment: selectedEmbellishment,
      broderie3D: isBroderie3D,
      puffPrint: isPuffPrint,
      finishings: selectedFinishings,
      quantity: selectedQuantity,
      packaging: selectedPackaging,
      delivery: selectedDelivery,
      sizeData: editableSizeData,
      uploadedImage: uploadedImage,
      measurements: [],
      comments: comments
    };
  }, [selectedFit, selectedFabric, customFabric, selectedColourway, selectedNecklabel, selectedCorelabel, selectedEmbellishment, isBroderie3D, isPuffPrint, selectedFinishings, selectedQuantity, selectedPackaging, selectedDelivery, editableSizeData, uploadedImage, comments]);

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
  }, [selectedFit, selectedFabric, customFabric, selectedColourway, selectedNecklabel, selectedCorelabel, selectedEmbellishment, isBroderie3D, isPuffPrint, selectedFinishings, selectedQuantity, selectedPackaging, selectedDelivery, editableSizeData, uploadedImage, comments]);

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
      if (designData.fabric) {
        if (designData.fabric !== 'coton-230' && designData.fabric !== 'coton-270' && designData.fabric !== 'coton-340') {
          setSelectedFabric('custom');
          setCustomFabric(designData.fabric);
        } else {
          setSelectedFabric(designData.fabric);
        }
      }
      if (designData.colourway) setSelectedColourway(designData.colourway);
      if (designData.necklabel) setSelectedNecklabel(designData.necklabel);
      if (designData.corelabel) setSelectedCorelabel(designData.corelabel);
      if (designData.embellishment) setSelectedEmbellishment(designData.embellishment);
      if (designData.broderie3D) setIsBroderie3D(designData.broderie3D);
      if (designData.puffPrint) setIsPuffPrint(designData.puffPrint);
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
    { id: 'A', label: 'Body Length', key: 'bodyLenght' },
    { id: 'B', label: 'Chest', key: 'chest' },
    { id: 'C', label: 'Bottom', key: 'bottom' },
    { id: 'D', label: 'Shoulders', key: 'shoulders' },
    { id: 'E', label: 'Armhole', key: 'armhole' },
    { id: 'F', label: 'Sleeve lenght OUTSIDE', key: 'sleeveLenghtOutside' },
    { id: 'G', label: 'Sleeve arm OPENNING', key: 'sleeveArmOpenning' },
    { id: 'H', label: 'Sleeve lenght INSIDE', key: 'sleevelenghtInside' }
  ];

  // Handle fit change and apply predefined sizes
  const handleFitChange = (fitType) => {
    setSelectedFit(fitType);
    
    // Appliquer le template de tailles correspondant
    if (predefinedSizeTemplates[fitType]) {
      const template = predefinedSizeTemplates[fitType];
      // Copie profonde des données du template
      const newSizeData = JSON.parse(JSON.stringify(template.data));
      setEditableSizeData(newSizeData);
      setIsModified(true);
      setHasUnsavedChanges(true); // Déclencher la sauvegarde automatique
      console.log(`Template ${template.name} appliqué:`, newSizeData);
    }
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
        washlabel: selectedWashlabel,
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

  // const fitOptions = [
  //   { id: 'oversized', label: 'Oversized Fit' },
  //   { id: 'regular', label: 'Regular Fit' },
  //   { id: 'slim', label: 'Slim Fit' },
  //   { id: 'custom', label: 'Custom Fit' },
  //   { id: 'cropped', label: 'Cropped (1/2 Sleeve) Fit' }
  // ];

  // Fonction pour rendre le contenu selon l'onglet actif
  const renderTabContent = () => {
    switch (activeTab) {
      case 'fit':
        return renderFitContent();
      case 'fabric-colourway':
        return renderFabricColourwayContent();
      case 'labels':
        return renderLabelsContent();
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
      isRushOrder: false, // Peut être ajouté comme option
      selectedFit: selectedFit,
      editableSizeData: editableSizeData
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
              <strong>Tissu:</strong> {selectedFabric === 'custom' ? (customFabric || 'Custom - Non spécifié') : (selectedFabric || 'Non sélectionné')}
            </div>
            <div className="summary-item">
              <strong>Coloris:</strong> {selectedColourway || 'Non sélectionné'}
            </div>
            <div className="summary-item">
              <strong>Étiquette de cou:</strong> {selectedNecklabel || 'Non sélectionné'}
            </div>
            <div className="summary-item">
              <strong>Étiquette de lavage:</strong> {selectedWashlabel || 'Non sélectionné'}
            </div>
            <div className="summary-item">
              <strong>Embellissement:</strong> {selectedEmbellishment || 'Non sélectionné'}
              {isBroderie3D && <span className="special-option-indicator"> + Broderie 3D</span>}
              {isPuffPrint && <span className="special-option-indicator"> + Puff print</span>}
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
        <div className="size-chart-section">
          <div className="size-chart-header">
            <h3>Tableau des tailles T-Shirt (en cm)</h3>
            <div className="size-chart-actions">
              <div className="predefined-sizes-buttons">
                {Object.entries(predefinedSizeTemplates).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => handleFitChange(key)}
                    className={`predefined-size-button ${selectedFit === key ? 'active' : ''}`}
                    type="button"
                    title={`Appliquer les tailles ${template.name}`}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
              <button 
                onClick={resetSizeData}
                className="reset-sizes-button"
                type="button"
                title="Réinitialiser toutes les tailles à 0"
              >
                Reset
              </button>
            </div>
          </div>
          <div className="table-container">
            <div className="table-wrapper">
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
            
            <div className="tshirt-image-container">
              <h4 className="tshirt-image-title">Guide des mesures</h4>
              <div className="tshirt-image-placeholder">
                 <img 
                   src="/tshirt-guide.svg" 
                   alt="Guide des mesures du t-shirt" 
                   className="tshirt-svg"
                   width="250" 
                   height="300"
                 />
               </div>
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

  // Handle fabric and colourway save and next
  const handleFabricColourwaySaveNext = () => {
    if (!selectedFabric && !selectedColourway) {
      alert("Veuillez sélectionner au moins un tissu ou un coloris avant de continuer.");
      return;
    }
    
    try {
      manualSaveProgression();
      const currentId = currentProgressionId || selectionId;
      
      let message = "Sélection sauvegardée avec succès!";
      if (selectedFabric && selectedColourway) {
        message = "Tissu et coloris sauvegardés avec succès!";
      } else if (selectedFabric) {
        message = "Tissu sauvegardé avec succès!";
      } else if (selectedColourway) {
        message = "Coloris sauvegardé avec succès!";
      }
      
      alert(`${message} ID de sélection: ${currentId}`);
      setActiveTab('embellishment'); // Rediriger vers l'onglet suivant
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  const handleLabelsSaveNext = () => {
    if (!selectedNecklabel && !selectedWashlabel) {
      alert("Veuillez sélectionner au moins une étiquette avant de continuer.");
      return;
    }
    
    try {
      manualSaveProgression();
      const currentId = currentProgressionId || selectionId;
      
      let message = "Sélection sauvegardée avec succès!";
      if (selectedNecklabel && selectedWashlabel) {
        message = "Étiquettes sauvegardées avec succès!";
      } else if (selectedNecklabel) {
        message = "Étiquette de cou sauvegardée avec succès!";
      } else if (selectedWashlabel) {
        message = "Étiquette de lavage sauvegardée avec succès!";
      }
      
      alert(`${message} ID de sélection: ${currentId}`);
      setActiveTab('embellishment'); // Rediriger vers l'onglet suivant
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  // Contenu de l'onglet Fabric & Colourway fusionné
  const renderFabricColourwayContent = () => {
    const fabricOptions = [
      { id: 'coton-230', label: '230 gsm – 100% coton' },
      { id: 'coton-270', label: '270 gsm – 100% coton' },
      { id: 'coton-340', label: '340 gsm – 100% coton' },
      { id: 'custom', label: 'Custom' }
    ];
    
    const colourwayOptions = [
      { id: 'white', label: 'Blanc' },
      { id: 'off-white', label: 'Blanc cassé' },
      { id: 'black', label: 'Noir' },
      { id: 'custom', label: 'Custom' }
    ];
    
    return (
      <div className="tab-content">
        <div className="fabric-colourway-container">
          {/* Section Tissu */}
          <div className="fabric-section">
            <h3>Sélectionnez le tissu</h3>
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
            
            {/* Champ de saisie pour tissu personnalisé */}
            {selectedFabric === 'custom' && (
              <div className="custom-input-section">
                <label htmlFor="custom-fabric">Spécifiez votre tissu :</label>
                <input
                  id="custom-fabric"
                  type="text"
                  value={customFabric}
                  onChange={(e) => {
                    setCustomFabric(e.target.value);
                    setIsModified(true);
                  }}
                  placeholder="Ex: 280 gsm - 100% coton bio"
                  className="custom-fabric-input"
                />
              </div>
            )}
          </div>
          
          {/* Section Coloris */}
          <div className="colourway-section">
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
        </div>
        
        {/* Actions */}
        <div className="actions-section">
          <button 
            onClick={handleFabricColourwaySaveNext}
            className="generate-quote-button"
            disabled={!selectedFabric && !selectedColourway}
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

  const renderLabelsContent = () => {
    const necklabelOptions = [
      { id: 'none', label: 'Aucune étiquette' },
      { id: 'standard', label: 'Étiquette standard' },
      { id: 'custom', label: 'Étiquette personnalisée' }
    ];
    
    const washlabelOptions = [
      { id: 'none', label: 'Aucune étiquette' },
      { id: 'standard', label: 'Étiquette standard' },
      { id: 'eco', label: 'Étiquette écologique' },
      { id: 'custom', label: 'Étiquette personnalisée' }
    ];
    
    return (
      <div className="tab-content">
        <div className="fabric-colourway-container">
          {/* Section Étiquette de cou */}
          <div className="fabric-section">
            <h3>Sélectionnez l'étiquette de col</h3>
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
          
          {/* Section Étiquette de lavage */}
          <div className="colourway-section">
            <h3>Sélectionnez l'étiquette de lavage</h3>
            <div className="options-grid">
              {washlabelOptions.map(option => (
                <label key={option.id} className={`option-card ${selectedWashlabel === option.id ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="washlabel"
                    value={option.id}
                    checked={selectedWashlabel === option.id}
                    onChange={() => {
                      setSelectedWashlabel(option.id);
                      setIsModified(true);
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="actions-section">
          <button 
            onClick={handleLabelsSaveNext}
            className="generate-quote-button"
            disabled={!selectedNecklabel && !selectedWashlabel}
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

  const renderEmbellishmentContent = () => {
    const renderEmbellishmentSection = (type, title, sizes, hasSpecialOption = false, specialOptionLabel = '') => {
      if (type === 'none') {
        return (
          <div className="embellishment-type-section">
            <label className={`option-card embellishment-main ${selectedEmbellishment === 'none' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="embellishment"
                value="none"
                checked={selectedEmbellishment === 'none'}
                onChange={() => {
                  setSelectedEmbellishment('none');
                  setIsModified(true);
                }}
              />
              <span className="embellishment-title">{title}</span>
            </label>
          </div>
        );
      }

      return (
        <div className="embellishment-type-section">
          <h4 className="embellishment-type-title">{title}</h4>
          
          {/* Tailles */}
          <div className="embellishment-sizes">
            {sizes.map(size => (
              <label key={`${type}-${size.id}`} className={`option-card size-option ${selectedEmbellishment === `${type}-${size.id}` ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="embellishment"
                  value={`${type}-${size.id}`}
                  checked={selectedEmbellishment === `${type}-${size.id}`}
                  onChange={() => {
                    setSelectedEmbellishment(`${type}-${size.id}`);
                    setIsModified(true);
                  }}
                />
                <span className="size-label">{size.label}</span>
                <span className="size-description">{size.description}</span>
              </label>
            ))}
          </div>

          {/* Option spéciale */}
          {hasSpecialOption && (
            <div className="special-option">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={
                    (type === 'embroidery' && isBroderie3D) ||
                    (type === 'serigraphie' && isPuffPrint)
                  }
                  onChange={(e) => {
                    if (type === 'embroidery') {
                      setIsBroderie3D(e.target.checked);
                    } else if (type === 'serigraphie') {
                      setIsPuffPrint(e.target.checked);
                    }
                    setIsModified(true);
                  }}
                />
                <span>{specialOptionLabel}</span>
              </label>
            </div>
          )}
        </div>
      );
    };

    const sizes = [
      { id: '100cm2', label: '100 cm²', description: '(10x10 cm)' },
      { id: '400cm2', label: '400 cm²', description: '(20x20 cm)' },
      { id: 'plus400cm2', label: '>400 cm²', description: '' }
    ];
    
    return (
      <div className="tab-content">
        <div className="embellishment-container">
          {/* Aucun */}
          {renderEmbellishmentSection('none', 'Aucun')}
          
          {/* Broderie */}
          {renderEmbellishmentSection('embroidery', 'Broderie', sizes, true, 'Broderie 3D')}
          
          {/* Sérigraphie */}
          {renderEmbellishmentSection('serigraphie', 'Sérigraphie', sizes, true, 'Puff print')}
          
          {/* DTF */}
          {renderEmbellishmentSection('dtf', 'DTF (transfert/flocage)', sizes)}
          
          {/* DTG */}
          {renderEmbellishmentSection('dtg', 'DTG (impression directe)', sizes)}
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
        <h3>Sélectionnez les finitions</h3>
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
        <h3>Sélectionnez la quantité</h3>
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
        <h3>Sélectionnez l'emballage</h3>
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
        <h3>Sélectionnez la livraison</h3>
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
Coupe - T-Shirt
          </span>
          <span 
            className={`tab ${activeTab === 'fabric-colourway' ? 'active' : ''}`}
            onClick={() => setActiveTab('fabric-colourway')}
          >
Tissu & Couleur
          </span>
          <span 
            className={`tab ${activeTab === 'labels' ? 'active' : ''}`}
            onClick={() => setActiveTab('labels')}
          >
            Étiquettes
          </span>
          <span 
            className={`tab ${activeTab === 'embellishment' ? 'active' : ''}`}
            onClick={() => setActiveTab('embellishment')}
          >
Marquage
          </span>
          <span 
            className={`tab ${activeTab === 'finishings' ? 'active' : ''}`}
            onClick={() => setActiveTab('finishings')}
          >
Finitions
          </span>
          <span 
            className={`tab ${activeTab === 'quantity' ? 'active' : ''}`}
            onClick={() => setActiveTab('quantity')}
          >
Quantité
          </span>
          <span 
            className={`tab ${activeTab === 'packaging' ? 'active' : ''}`}
            onClick={() => setActiveTab('packaging')}
          >
Emballage
          </span>
          <span 
            className={`tab ${activeTab === 'delivery' ? 'active' : ''}`}
            onClick={() => setActiveTab('delivery')}
          >
Livraison
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