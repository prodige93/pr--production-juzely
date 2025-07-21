import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import database from '../../utils/database';
import designProgressionService from '../../services/design-progression-service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { init, send } from '@emailjs/browser';
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
      'XS': { bodyLenght: 67, chest: 55, bottom: 55, shoulders: 57, armhole: 21, sleeveLenghtOutside: 16, sleeveArmOpenning: 20, sleevelenghtInside: 11 },
      'S': { bodyLenght: 69, chest: 57, bottom: 57, shoulders: 59, armhole: 23, sleeveLenghtOutside: 17, sleeveArmOpenning: 21, sleevelenghtInside: 12 },
      'M': { bodyLenght: 71, chest: 59, bottom: 59, shoulders: 61, armhole: 25, sleeveLenghtOutside: 18, sleeveArmOpenning: 22, sleevelenghtInside: 13 },
      'L': { bodyLenght: 73, chest: 61, bottom: 61, shoulders: 63, armhole: 27, sleeveLenghtOutside: 19, sleeveArmOpenning: 23, sleevelenghtInside: 14 },
      'XL': { bodyLenght: 75, chest: 63, bottom: 63, shoulders: 65, armhole: 29, sleeveLenghtOutside: 20, sleeveArmOpenning: 24, sleevelenghtInside: 15 }
    }
  },
  regular: {
    name: 'Regular',
    data: {
      'XS': { bodyLenght: 61, chest: 50, bottom: 50, shoulders: 41, armhole: 23, sleeveLenghtOutside: 21, sleeveArmOpenning: 16, sleevelenghtInside: 12 },
      'S': { bodyLenght: 63, chest: 52, bottom: 52, shoulders: 43, armhole: 24, sleeveLenghtOutside: 22, sleeveArmOpenning: 17, sleevelenghtInside: 13 },
      'M': { bodyLenght: 65, chest: 54, bottom: 54, shoulders: 45, armhole: 25, sleeveLenghtOutside: 23, sleeveArmOpenning: 18, sleevelenghtInside: 14 },
      'L': { bodyLenght: 67, chest: 56, bottom: 56, shoulders: 47, armhole: 26, sleeveLenghtOutside: 24, sleeveArmOpenning: 19, sleevelenghtInside: 15 },
      'XL': { bodyLenght: 69, chest: 58, bottom: 58, shoulders: 49, armhole: 27, sleeveLenghtOutside: 25, sleeveArmOpenning: 20, sleevelenghtInside: 16 }
    }
  },
  boxy: {
    name: 'Boxy',
    data: {
      'XS': { bodyLenght: 60, chest: 53, bottom: 53, shoulders: 60, armhole: 24, sleeveLenghtOutside: 18, sleeveArmOpenning: 19, sleevelenghtInside: 13 },
      'S': { bodyLenght: 62, chest: 55, bottom: 55, shoulders: 62, armhole: 25, sleeveLenghtOutside: 19, sleeveArmOpenning: 20, sleevelenghtInside: 14 },
      'M': { bodyLenght: 64, chest: 57, bottom: 57, shoulders: 64, armhole: 26, sleeveLenghtOutside: 20, sleeveArmOpenning: 21, sleevelenghtInside: 15 },
      'L': { bodyLenght: 66, chest: 59, bottom: 59, shoulders: 66, armhole: 27, sleeveLenghtOutside: 21, sleeveArmOpenning: 22, sleevelenghtInside: 16 },
      'XL': { bodyLenght: 68, chest: 61, bottom: 61, shoulders: 68, armhole: 28, sleeveLenghtOutside: 22, sleeveArmOpenning: 23, sleevelenghtInside: 17 }
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
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPackaging, setSelectedPackaging] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  // Variables d'état pour les options Extra
  const [selectedHangtag, setSelectedHangtag] = useState('aucun');
  const [selectedPackagingExtra, setSelectedPackagingExtra] = useState('polybag-offert');
  const [selectedDelavage, setSelectedDelavage] = useState('sans');
  const [selectedStickers, setSelectedStickers] = useState('sans');
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
  const [destinataireEmail, setDestinataireEmail] = useState('');

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
      quantity: selectedQuantity,
      packaging: selectedPackaging,
      delivery: selectedDelivery,
      // Options Extra
      hangtag: selectedHangtag,
      packagingExtra: selectedPackagingExtra,
      delavage: selectedDelavage,
      stickers: selectedStickers,
      sizeData: editableSizeData,
      uploadedImage: uploadedImage,
      measurements: [],
      comments: comments
    };
  }, [selectedFit, selectedFabric, customFabric, selectedColourway, selectedNecklabel, selectedCorelabel, selectedEmbellishment, isBroderie3D, isPuffPrint, selectedQuantity, selectedPackaging, selectedDelivery, selectedHangtag, selectedPackagingExtra, selectedDelavage, selectedStickers, editableSizeData, uploadedImage, comments]);

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
  }, [selectedFit, selectedFabric, customFabric, selectedColourway, selectedNecklabel, selectedCorelabel, selectedEmbellishment, isBroderie3D, isPuffPrint, selectedQuantity, selectedPackaging, selectedDelivery, selectedHangtag, selectedPackagingExtra, selectedDelavage, selectedStickers, editableSizeData, uploadedImage, comments]);

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
    // Ne pas réinitialiser si on vient de restaurer une progression
    if (!location.state || !location.state.progressionId) {
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
    }
  }, [location.state]);
  
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
        name: 'Nom du Client', // Remplacer par les vraies données client
      email: 'client@exemple.com',
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
        // Mettre à jour le statut de la progression si existante
        if (currentProgressionId) {
          designProgressionService.updateProgressionStatus(currentProgressionId, 'bulk');
        }
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
      case 'packaging':
        return renderPackagingContent();
      case 'delivery':
        return renderDeliveryContent();
      case 'extra':
        return renderExtraContent();
      case 'quote':
        return renderQuoteContent();
      default:
        return renderFitContent();
    }
  };

  // Fonctions utilitaires pour le système de devis
  const calculateUnitPrice = (quantity) => {
    const basePrice = 15; // Prix de base
    if (quantity >= 100) return basePrice * 0.8; // -20%
    if (quantity >= 50) return basePrice * 0.85; // -15%
    if (quantity >= 20) return basePrice * 0.9; // -10%
    return basePrice;
  };

  const generateQuoteNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `DEV-${year}${month}${day}-${random}`;
  };

  const downloadPDF = async () => {
    try {
      const currentDate = new Date();
      const validityDate = new Date(currentDate);
      validityDate.setMonth(validityDate.getMonth() + 1);
      
      const unitPrice = calculateUnitPrice(selectedQuantity);
      const totalHT = unitPrice * selectedQuantity;
      const tvaRate = 0;
      const totalTTC = totalHT;

      // Créer un élément temporaire avec le contenu PDF complet
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = `
        <div style="
          background-color: white;
          padding: 40px;
          font-family: Arial, sans-serif;
          font-size: 14px;
          line-height: 1.4;
          color: #333;
          width: 800px;
        ">
          <!-- En-tête avec logo et informations -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">
            <div style="flex: 1;">
              <div style="font-size: 24px; font-weight: bold; color: #2c3e50; margin-bottom: 10px;">
                STUDIO JUZELY
              </div>
              <div style="font-size: 14px; color: #666;">
                juleslefevre@juzely.eu
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">
                Date du devis : ${currentDate.toLocaleDateString('fr-FR')}
              </div>
              <div style="font-size: 14px; color: #666;">
                N° ${generateQuoteNumber()}
              </div>
            </div>
          </div>

          <!-- Informations client -->
          <div style="margin-bottom: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
            <div style="font-weight: bold; margin-bottom: 10px;">Informations client :</div>
            <div>Nom : ___________________________</div>
            <div>Prénom : ___________________________</div>
            <div>Adresse : ___________________________</div>
            <div>Code postal : ___________________________</div>
            <div>Ville : ___________________________</div>
            <div>Pays : ___________________________</div>
          </div>

          <!-- Tableau des samples -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #2c3e50; color: white;">
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">N° Sample</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Description</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Quantité</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">PU HT</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">TVA %</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Total HT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px;">001</td>
                <td style="border: 1px solid #ddd; padding: 12px;">
                  <div><strong>T-Shirt ${selectedFit}</strong></div>
                  <div>Tissu: ${selectedFabric === 'custom' ? customFabric : selectedFabric || 'Non spécifié'}</div>
                  <div>Coloris: ${selectedColourway || 'Non spécifié'}</div>
                  <div>Marquage: ${selectedEmbellishment || 'Aucun'}</div>
                  ${isBroderie3D ? '<div>+ Broderie 3D</div>' : ''}
                  ${isPuffPrint ? '<div>+ Puff print</div>' : ''}
                  ${selectedHangtag !== 'aucun' ? `<div>Hangtag: ${selectedHangtag}</div>` : ''}
                  ${selectedPackagingExtra !== 'polybag-offert' ? `<div>Packaging: ${selectedPackagingExtra}</div>` : ''}
                  ${selectedDelavage !== 'sans' ? `<div>Délavage: ${selectedDelavage}</div>` : ''}
                  ${selectedStickers !== 'sans' ? `<div>Stickers: ${selectedStickers}</div>` : ''}
                </td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${selectedQuantity}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${unitPrice.toFixed(2)} €</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${tvaRate}%</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${totalHT.toFixed(2)} €</td>
              </tr>
            </tbody>
          </table>

          <!-- Totaux -->
          <div style="text-align: right; margin-bottom: 30px;">
            <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">
              Total net HT : ${totalHT.toFixed(2)} €
            </div>
            <div style="font-size: 18px; font-weight: bold; color: #2c3e50;">
              Montant total TTC : ${totalTTC.toFixed(2)} €
            </div>
          </div>

          <!-- Signature -->
          <div style="margin-bottom: 30px; text-align: center;">
            <div style="margin-bottom: 10px;">Lu et approuvé, bon pour accord</div>
            <div style="margin-bottom: 5px;">Signature du client :</div>
            <div style="border: 1px solid #ddd; height: 60px; width: 200px; margin: 0 auto;"></div>
          </div>

          <!-- Conditions -->
          <div style="font-size: 12px; color: #666;">
            <div style="margin-bottom: 5px;">
              <strong>Date de validité :</strong> ${validityDate.toLocaleDateString('fr-FR')}
            </div>
            <div style="margin-bottom: 5px;">
              <strong>Moyen de règlement :</strong> virement bancaire, carte bancaire
            </div>
            <div style="margin-bottom: 5px;">
              <strong>Délai de règlement :</strong> à la commande
            </div>
            <div style="margin-bottom: 5px;">
              <strong>Mode de TVA :</strong> TVA non applicable, art 293 B du CGI
            </div>
            <div style="margin-bottom: 5px;">
              <strong>Banque :</strong> Revolut
            </div>
            <div style="margin-bottom: 5px;">
              <strong>BIC :</strong> REVOFRP2
            </div>
            <div>
              <strong>IBAN :</strong> FR76 2823 3000 0100 1960 4921 651
            </div>
          </div>
        </div>
      `;

      // Positionner l'élément hors de la vue
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Supprimer l'élément temporaire
      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const quoteNumber = generateQuoteNumber();
      pdf.save(`devis-juzely-${quoteNumber}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF');
    }
  };

  const sendQuoteByEmail = async () => {
    const email = destinataireEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      alert('Veuillez saisir un email destinataire.');
      return;
    }
    if (!emailRegex.test(email)) {
      alert('Veuillez saisir une adresse email valide.');
      return;
    }
    try {
      // Prépare les paramètres attendus par le template EmailJS
      const templateParams = {
        to_email: email, // doit correspondre exactement au champ du template EmailJS
        to_name: 'Destinataire',
        from_name: 'Studio Juzely',
        from_email: 'eliassrachid@gmail.com',
        subject: 'Devis Juzely',
        order_id: Math.floor(Math.random() * 1000000),
        message: 'Merci pour votre demande de devis.'
      };
      // Log pour debug
      console.log('Envoi EmailJS avec :', templateParams);
      // Envoi via EmailJS
      const result = await send(
        'service_c6mhnml', // Service ID
        'template_rhcqa2l', // Template ID
        templateParams,
        'B6T2kYYHHXxJnShTc' // Public Key
      );
      console.log('Résultat EmailJS:', result);
      alert('Email envoyé avec succès !');
    } catch (emailError) {
      console.error('Erreur EmailJS:', emailError);
      alert(`⚠️ Erreur EmailJS: ${emailError?.text || emailError?.message || JSON.stringify(emailError)}`);
    }
  };

  // Contenu de l'onglet Devis
  const renderQuoteContent = () => {
    const unitPrice = calculateUnitPrice(selectedQuantity);
    const totalHT = unitPrice * selectedQuantity;
    const totalTTC = totalHT;

    return (
      <div className="tab-content">
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h3>Générer votre devis</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Ajustez la quantité et cliquez sur l'un des boutons ci-dessous
          </p>
          <div className="email-actions">
            <button 
              onClick={downloadPDF}
              className="email-action-btn blue-btn"
            >
              📄 Télécharger le devis PDF
            </button>
            <button 
              onClick={sendQuoteByEmail}
              className="email-action-btn green-btn"
            >
              <span style={{display: 'block', fontWeight: 500}}>📧 Envoyer automatiquement à</span>
              {destinataireEmail && (
                <span style={{display: 'block', fontSize: '15px', color: '#fff', wordBreak: 'break-all'}}>
                  {destinataireEmail}
                </span>
              )}
            </button>
          </div>
          <input
            type="email"
            placeholder="Email du destinataire"
            value={destinataireEmail}
            onChange={e => setDestinataireEmail(e.target.value)}
            className="email-input"
          />
        </div>

        {/* Slider de quantité */}
        <div className="quantity-slider-container" style={{ marginBottom: '30px' }}>
          <h4 style={{ marginBottom: '20px', color: '#2c3e50', textAlign: 'center' }}>📊 Ajuster la quantité</h4>
          <div className="quantity-display">
            <span className="quantity-value">{selectedQuantity}</span>
            <span className="quantity-unit">pièces</span>
          </div>
          <div className="slider-container">
            <input
              type="range"
              id="quantity-slider-quote"
              min="1"
              max="1000"
              step="1"
              value={selectedQuantity}
              onChange={(e) => {
                setSelectedQuantity(parseInt(e.target.value));
                setIsModified(true);
              }}
              className="quantity-slider"
            />
            <div className="slider-labels">
              <span>1</span>
              <span>100</span>
              <span>500</span>
              <span>1000</span>
            </div>
          </div>
          <div className="quantity-info">
            <p>Glissez le curseur pour ajuster la quantité</p>
            <p className="price-info">Prix unitaire estimé : {unitPrice.toFixed(2)} €</p>
          </div>
        </div>

        {/* Résumé des sélections */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h4 style={{ marginBottom: '15px', color: '#2c3e50' }}>📋 Résumé de votre commande</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
            <div><strong>Coupe:</strong> {selectedFit || 'Non sélectionné'}</div>
            <div><strong>Tissu:</strong> {selectedFabric === 'custom' ? (customFabric || 'Personnalisé - Non spécifié') : (selectedFabric || 'Non sélectionné')}</div>
            <div><strong>Coloris:</strong> {selectedColourway || 'Non sélectionné'}</div>
            <div><strong>Marquage:</strong> {selectedEmbellishment || 'Non sélectionné'}</div>
            <div><strong>Quantité:</strong> {selectedQuantity}</div>
            <div><strong>Prix unitaire:</strong> {unitPrice.toFixed(2)} €</div>
          </div>
          {(isBroderie3D || isPuffPrint) && (
            <div style={{ marginTop: '10px', fontSize: '14px' }}>
              <strong>Options spéciales:</strong>
              {isBroderie3D && <span style={{ marginLeft: '10px', color: '#007bff' }}>• Broderie 3D</span>}
              {isPuffPrint && <span style={{ marginLeft: '10px', color: '#007bff' }}>• Puff print</span>}
            </div>
          )}
          {(selectedHangtag !== 'aucun' || selectedPackagingExtra !== 'polybag-offert' || selectedDelavage !== 'sans' || selectedStickers !== 'sans') && (
            <div style={{ marginTop: '10px', fontSize: '14px' }}>
              <strong>Options Extra:</strong>
              {selectedHangtag !== 'aucun' && <div style={{ marginLeft: '10px', color: '#28a745' }}>• Hangtag: {selectedHangtag}</div>}
              {selectedPackagingExtra !== 'polybag-offert' && <div style={{ marginLeft: '10px', color: '#28a745' }}>• Packaging: {selectedPackagingExtra}</div>}
              {selectedDelavage !== 'sans' && <div style={{ marginLeft: '10px', color: '#28a745' }}>• Délavage: {selectedDelavage}</div>}
              {selectedStickers !== 'sans' && <div style={{ marginLeft: '10px', color: '#28a745' }}>• Stickers: {selectedStickers}</div>}
            </div>
          )}
        </div>

        {/* Total */}
        <div style={{ 
          backgroundColor: '#e9ecef', 
          padding: '15px', 
          borderRadius: '8px',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
            Total: {totalTTC.toFixed(2)} € TTC
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            TVA non applicable, art 293 B du CGI
          </div>
        </div>

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#d1ecf1', 
          borderRadius: '8px',
          fontSize: '14px',
          color: '#0c5460'
        }}>
          <strong>ℹ️ Information:</strong> Le devis détaillé avec l'en-tête Studio Juzely, les informations client et toutes les conditions sera généré dans le PDF téléchargeable.
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
      { id: 'white', label: 'Blanc', color: '#FFFFFF' },
      { id: 'off-white', label: 'Blanc cassé', color: '#F5F5DC' },
      { id: 'black', label: 'Noir', color: '#000000' },
      { id: 'custom', label: 'Custom', color: null }
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
                  <span className="color-option-content">
                    <span className="color-label">{option.label}</span>
                    {option.color && (
                      <span 
                        className="color-swatch" 
                        style={{ 
                          backgroundColor: option.color,
                          border: option.id === 'white' ? '1px solid #ddd' : 'none'
                        }}
                      ></span>
                    )}
                    {option.id === 'custom' && (
                      <span className="custom-indicator">⚙️</span>
                    )}
                  </span>
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
                  // Désactiver les options spéciales si "Aucun" est sélectionné
                  setIsBroderie3D(false);
                  setIsPuffPrint(false);
                  setIsModified(true);
                }}
              />
              <span className="embellishment-title">{title}</span>
            </label>
          </div>
        );
      }

      // Vérifier si une option de cette section est sélectionnée
      const isSectionSelected = selectedEmbellishment && selectedEmbellishment.startsWith(type);
      
      // Déterminer si l'option spéciale est activée pour cette section
      const isSpecialOptionEnabled = (type === 'embroidery' && isBroderie3D) || (type === 'serigraphie' && isPuffPrint);

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
                    const newSelection = `${type}-${size.id}`;
                    setSelectedEmbellishment(newSelection);
                    
                    // Désactiver les options spéciales des autres sections
                    if (type !== 'embroidery') {
                      setIsBroderie3D(false);
                    }
                    if (type !== 'serigraphie') {
                      setIsPuffPrint(false);
                    }
                    
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
            <div className={`special-option ${!isSectionSelected ? 'disabled' : ''}`}>
              <label className={`checkbox-option ${!isSectionSelected ? 'disabled' : ''}`}>
                <input
                  type="checkbox"
                  disabled={!isSectionSelected}
                  checked={isSpecialOptionEnabled}
                  onChange={(e) => {
                    if (!isSectionSelected) {
                      // Afficher un message d'information
                      alert(`Veuillez d'abord sélectionner une taille dans la section ${title} pour activer ${specialOptionLabel}.`);
                      return;
                    }
                    
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
      { id: 'rapide', label: 'Livraison rapide (3-5 jours)' },
      { id: 'standard', label: 'Livraison standard (8-10 jours)' },
      { id: 'economique', label: 'Livraison économique (40-50 jours)' }
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

  const renderExtraContent = () => {
    const hangtagOptions = [
      { id: 'aucun', label: 'Aucun' },
      { id: 'standard', label: 'Standard' },
      { id: 'custom', label: 'Custom' }
    ];

    const packagingExtraOptions = [
      { id: 'polybag-offert', label: 'Polybag offert' },
      { id: 'polybag-custom', label: 'Polybag custom' },
      { id: 'full-custom', label: 'Full custom' }
    ];

    const delavageOptions = [
      { id: 'sans', label: 'Sans' },
      { id: 'standard', label: 'Standard' },
      { id: 'custom', label: 'Custom' }
    ];

    const stickersOptions = [
      { id: 'sans', label: 'Sans' },
      { id: 'pack-standard', label: 'Pack standard de 1000 unités custom' }
    ];

    return (
      <div className="tab-content">
        <div className="extra-container">
          <h3>⭐ Options Extra</h3>
          
          {/* Hangtag */}
          <div className="extra-section">
            <h4>🏷️ Hangtag</h4>
            <div className="options-grid">
              {hangtagOptions.map(option => (
                <label key={option.id} className={`option-card ${selectedHangtag === option.id ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="hangtag"
                    value={option.id}
                    checked={selectedHangtag === option.id}
                    onChange={() => {
                      setSelectedHangtag(option.id);
                      setIsModified(true);
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Packaging */}
          <div className="extra-section">
            <h4>📦 Packaging</h4>
            <div className="options-grid">
              {packagingExtraOptions.map(option => (
                <label key={option.id} className={`option-card ${selectedPackagingExtra === option.id ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="packagingExtra"
                    value={option.id}
                    checked={selectedPackagingExtra === option.id}
                    onChange={() => {
                      setSelectedPackagingExtra(option.id);
                      setIsModified(true);
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Délavage */}
          <div className="extra-section">
            <h4>🌊 Délavage</h4>
            <div className="options-grid">
              {delavageOptions.map(option => (
                <label key={option.id} className={`option-card ${selectedDelavage === option.id ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="delavage"
                    value={option.id}
                    checked={selectedDelavage === option.id}
                    onChange={() => {
                      setSelectedDelavage(option.id);
                      setIsModified(true);
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Stickers */}
          <div className="extra-section">
            <h4>🏷️ Stickers</h4>
            <div className="options-grid">
              {stickersOptions.map(option => (
                <label key={option.id} className={`option-card ${selectedStickers === option.id ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="stickers"
                    value={option.id}
                    checked={selectedStickers === option.id}
                    onChange={() => {
                      setSelectedStickers(option.id);
                      setIsModified(true);
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    init('B6T2kYYHHXxJnShTc');
  }, []);

  // Ajout d'un effet pour passer le statut à 'sample' dès la première modification
  useEffect(() => {
    if (currentProgressionId && hasUnsavedChanges) {
      // Récupérer la progression pour vérifier le statut
      const progression = designProgressionService.getProgressionById(currentProgressionId);
      if (progression && progression.status === 'draft') {
        designProgressionService.updateProgressionStatus(currentProgressionId, 'sample');
      }
    }
  }, [hasUnsavedChanges, currentProgressionId]);

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
            className={`tab ${activeTab === 'extra' ? 'active' : ''}`}
            onClick={() => setActiveTab('extra')}
          >
            ⭐ Extra
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