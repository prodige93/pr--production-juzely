import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import database from '../../utils/database';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './ziphoodie-design.css';

// Données de tailles prédéfinies pour les zip-hoodies
const predefinedSizeTemplates = {
  standard: {
    name: 'Regular',
    data: {
      XS: { totalLength: 65, chestWidth: 52, bottomWidth: 52, sleeveLength: 19, armhole: 23, sleeveOpening: 19, neckRibLength: 2.5, neckOpening: 18.5, shoulderToShoulder: 51 },
      S: { totalLength: 67, chestWidth: 54, bottomWidth: 54, sleeveLength: 20, armhole: 23.5, sleeveOpening: 19.5, neckRibLength: 2.5, neckOpening: 18.5, shoulderToShoulder: 53 },
      M: { totalLength: 69, chestWidth: 56, bottomWidth: 56, sleeveLength: 21, armhole: 24, sleeveOpening: 20, neckRibLength: 2.5, neckOpening: 18.5, shoulderToShoulder: 55 },
      L: { totalLength: 71, chestWidth: 58, bottomWidth: 58, sleeveLength: 22, armhole: 24.5, sleeveOpening: 20.5, neckRibLength: 2.5, neckOpening: 18.5, shoulderToShoulder: 57 },
      XL: { totalLength: 73, chestWidth: 60, bottomWidth: 60, sleeveLength: 23, armhole: 25, sleeveOpening: 21, neckRibLength: 2.5, neckOpening: 18.5, shoulderToShoulder: 59 }
    }
  },
  oversized: {
    name: 'Oversized',
    data: {
      XS: { totalLength: 75, chestWidth: 62, bottomWidth: 62, sleeveLength: 25, armhole: 28, sleeveOpening: 24, neckRibLength: 3, neckOpening: 20, shoulderToShoulder: 56 },
      S: { totalLength: 77, chestWidth: 64, bottomWidth: 64, sleeveLength: 26, armhole: 28.5, sleeveOpening: 24.5, neckRibLength: 3, neckOpening: 20, shoulderToShoulder: 58 },
      M: { totalLength: 79, chestWidth: 66, bottomWidth: 66, sleeveLength: 27, armhole: 29, sleeveOpening: 25, neckRibLength: 3, neckOpening: 20, shoulderToShoulder: 60 },
      L: { totalLength: 81, chestWidth: 68, bottomWidth: 68, sleeveLength: 28, armhole: 29.5, sleeveOpening: 25.5, neckRibLength: 3, neckOpening: 20, shoulderToShoulder: 62 },
      XL: { totalLength: 83, chestWidth: 70, bottomWidth: 70, sleeveLength: 29, armhole: 30, sleeveOpening: 26, neckRibLength: 3, neckOpening: 20, shoulderToShoulder: 64 }
    }
  },
  slim: {
    name: 'Slim',
    data: {
      XS: { totalLength: 30, chestWidth: 30, bottomWidth: 30, sleeveLength: 30, armhole: 30, sleeveOpening: 30, neckRibLength: 30, neckOpening: 30, shoulderToShoulder: 30 },
      S: { totalLength: 30, chestWidth: 30, bottomWidth: 30, sleeveLength: 30, armhole: 30, sleeveOpening: 30, neckRibLength: 30, neckOpening: 30, shoulderToShoulder: 30 },
      M: { totalLength: 30, chestWidth: 30, bottomWidth: 30, sleeveLength: 30, armhole: 30, sleeveOpening: 30, neckRibLength: 30, neckOpening: 30, shoulderToShoulder: 30 },
      L: { totalLength: 30, chestWidth: 30, bottomWidth: 30, sleeveLength: 30, armhole: 30, sleeveOpening: 30, neckRibLength: 30, neckOpening: 30, shoulderToShoulder: 30 },
      XL: { totalLength: 30, chestWidth: 30, bottomWidth: 30, sleeveLength: 30, armhole: 30, sleeveOpening: 30, neckRibLength: 30, neckOpening: 30, shoulderToShoulder: 30 }
    }
  },
  custom: {
    name: 'Custom',
    data: {
      XS: { totalLength: 50, chestWidth: 50, bottomWidth: 50, sleeveLength: 50, armhole: 50, sleeveOpening: 50, neckRibLength: 50, neckOpening: 50, shoulderToShoulder: 50 },
      S: { totalLength: 50, chestWidth: 40, bottomWidth: 50, sleeveLength: 50, armhole: 50, sleeveOpening: 50, neckRibLength: 50, neckOpening: 50, shoulderToShoulder: 50 },
      M: { totalLength: 50, chestWidth: 50, bottomWidth: 50, sleeveLength: 50, armhole: 50, sleeveOpening: 50, neckRibLength: 50, neckOpening: 50, shoulderToShoulder: 50 },
      L: { totalLength: 50, chestWidth: 50, bottomWidth: 50, sleeveLength: 50, armhole: 50, sleeveOpening: 50, neckRibLength: 50, neckOpening: 50, shoulderToShoulder: 50 },
      XL: { totalLength: 50, chestWidth: 50, bottomWidth: 50, sleeveLength: 50, armhole: 50, sleeveOpening: 50, neckRibLength: 50, neckOpening: 18.5, shoulderToShoulder: 50 }
    }
  }
};

function ZiphoodieDesign() {
  const navigate = useNavigate();
  const [selectedFit, setSelectedFit] = useState('Regular');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [selectionId, setSelectionId] = useState(null);
  
  // Size chart data
  const [editableSizeData, setEditableSizeData] = useState({
    XS: { totalLength: 65, chestWidth: 52, bottomWidth: 52, sleeveLength: 19, armhole: 23, sleeveOpening: 19, neckRibLength: 2.5, neckOpening: 18.5, shoulderToShoulder: 51 },
    S: { totalLength: 67, chestWidth: 54, bottomWidth: 54, sleeveLength: 20, armhole: 23.5, sleeveOpening: 19.5, neckRibLength: 2.5, neckOpening: 18.5, shoulderToShoulder: 53 },
    M: { totalLength: 69, chestWidth: 56, bottomWidth: 56, sleeveLength: 21, armhole: 24, sleeveOpening: 20, neckRibLength: 2.5, neckOpening: 18.5, shoulderToShoulder: 55 },
    L: { totalLength: 71, chestWidth: 58, bottomWidth: 58, sleeveLength: 22, armhole: 24.5, sleeveOpening: 20.5, neckRibLength: 2.5, neckOpening: 18.5, shoulderToShoulder: 57 },
    XL: { totalLength: 73, chestWidth: 60, bottomWidth: 60, sleeveLength: 23, armhole: 25, sleeveOpening: 21, neckRibLength: 2.5, neckOpening: 18.5, shoulderToShoulder: 59 }
  });

  const measurements = [
    { key: 'totalLength', label: 'Total Length', unit: 'cm' },
    { key: 'chestWidth', label: 'Chest Width', unit: 'cm' },
    { key: 'bottomWidth', label: 'Bottom Width', unit: 'cm' },
    { key: 'sleeveLength', label: 'Sleeve Length', unit: 'cm' },
    { key: 'armhole', label: 'Armhole', unit: 'cm' },
    { key: 'sleeveOpening', label: 'Sleeve Opening', unit: 'cm' },
    { key: 'neckRibLength', label: 'Neck Rib Length', unit: 'cm' },
    { key: 'neckOpening', label: 'Neck Opening', unit: 'cm' },
    { key: 'shoulderToShoulder', label: 'Shoulder-to-Shoulder', unit: 'cm' }
  ];

  const fitOptions = ['Slim', 'Regular', 'Oversized', 'Custom'];

  useEffect(() => {
    // Get the latest garment selection
    const selections = database.getGarmentSelections();
    if (selections.length > 0) {
      const latestSelection = selections[selections.length - 1];
      if (latestSelection.garmentType === 'ziphoodie') {
        setSelectionId(latestSelection.id);
      }
    }
    
    // Initialiser les données de taille avec des valeurs par défaut si elles sont vides
    if (Object.keys(editableSizeData).length === 0) {
      const initialData = {};
      Object.keys(predefinedSizeTemplates.custom.data).forEach(size => {
        initialData[size] = {};
        measurements.forEach(measurement => {
          initialData[size][measurement.key] = 0;
        });
      });
      setEditableSizeData(initialData);
    }
  }, []);

  // Handle fit selection
  const handleFitChange = (fit) => {
    setSelectedFit(fit);
    setIsModified(true);
    
    // Appliquer automatiquement les tailles correspondantes au fit sélectionné
    let templateKey = '';
    switch(fit.toLowerCase()) {
      case 'slim':
        templateKey = 'slim';
        break;
      case 'regular':
        templateKey = 'standard';
        break;
      case 'oversized':
        templateKey = 'oversized';
        break;
      case 'custom':
        templateKey = 'custom';
        break;
      default:
        templateKey = 'standard';
    }
    
    const template = predefinedSizeTemplates[templateKey];
    if (template) {
      // Créer une copie profonde des données pour éviter les références
      const newSizeData = {};
      Object.keys(template.data).forEach(size => {
        newSizeData[size] = { ...template.data[size] };
      });
      setEditableSizeData(newSizeData);
      
      // Sélectionner automatiquement le premier champ après application
      setTimeout(() => {
        const firstInput = document.querySelector('.size-table input[type="number"]');
        if (firstInput) {
          firstInput.focus();
          firstInput.select();
        }
      }, 100);
    }
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

  // Appliquer un template de tailles prédéfinies
  const applyPredefinedSizes = (templateKey) => {
    const template = predefinedSizeTemplates[templateKey];
    if (template) {
      setEditableSizeData(template.data);
      setIsModified(true);
      
      // Sélectionner automatiquement le premier champ après application
      setTimeout(() => {
        const firstInput = document.querySelector('.size-table input[type="number"]');
        if (firstInput) {
          firstInput.focus();
          firstInput.select();
        }
      }, 100);
    }
  };

  // Réinitialiser toutes les tailles à 0
  const resetSizeData = () => {
    const resetData = {};
    Object.keys(editableSizeData).forEach(size => {
      resetData[size] = {};
      measurements.forEach(measurement => {
        resetData[size][measurement.key] = 0;
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
   
   // Générer et télécharger le devis en PDF
   const handleDownloadQuotePDF = () => {
     const quoteElement = document.querySelector('.size-chart-section');
     if (!quoteElement) {
       alert('Impossible de générer le PDF. Élément non trouvé.');
       return;
     }
     
     // Créer les données du devis
     const quoteData = {
       garmentType: 'ziphoodie',
       garmentName: 'Zip-Hoodie',
       fit: selectedFit,
       sizeData: editableSizeData,
       date: new Date().toLocaleDateString(),
       id: `QUOTE-ZIP-${Date.now()}`
     };
     
     // Créer un élément temporaire pour le PDF
     const pdfContainer = document.createElement('div');
     pdfContainer.style.padding = '20px';
     pdfContainer.style.position = 'absolute';
     pdfContainer.style.left = '-9999px';
     document.body.appendChild(pdfContainer);
     
     // Créer le contenu du PDF
     pdfContainer.innerHTML = `
       <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
         <div style="text-align: center; margin-bottom: 20px;">
           <h1 style="color: #333;">Juzely - Devis Zip-Hoodie</h1>
           <p>Date: ${quoteData.date} | Référence: ${quoteData.id}</p>
         </div>
         
         <div style="margin-bottom: 20px;">
           <h2>Informations</h2>
           <p><strong>Type de vêtement:</strong> ${quoteData.garmentName}</p>
           <p><strong>Fit:</strong> ${quoteData.fit}</p>
         </div>
         
         <div>
           <h2>Tableau des tailles (en cm)</h2>
           <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
             <thead>
               <tr style="background-color: #f2f2f2;">
                 <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Mesures</th>
                 ${Object.keys(editableSizeData).map(size => 
                   `<th style="border: 1px solid #ddd; padding: 8px; text-align: center;">${size}</th>`
                 ).join('')}
               </tr>
             </thead>
             <tbody>
               ${measurements.map(measurement => `
                 <tr>
                   <td style="border: 1px solid #ddd; padding: 8px;"><strong>${measurement.label}</strong></td>
                   ${Object.keys(editableSizeData).map(size => 
                     `<td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${editableSizeData[size][measurement.key] || 0}</td>`
                   ).join('')}
                 </tr>
               `).join('')}
             </tbody>
           </table>
         </div>
       </div>
     `;
     
     // Générer le PDF
     html2canvas(pdfContainer, { scale: 2 }).then(canvas => {
       const imgData = canvas.toDataURL('image/png');
       const pdf = new jsPDF('p', 'mm', 'a4');
       const pdfWidth = pdf.internal.pageSize.getWidth();
       const pdfHeight = pdf.internal.pageSize.getHeight();
       const imgWidth = canvas.width;
       const imgHeight = canvas.height;
       const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
       const imgX = (pdfWidth - imgWidth * ratio) / 2;
       const imgY = 30;
       
       pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
       pdf.save(`Devis_Zip-Hoodie_${quoteData.fit}_${quoteData.date.replace(/\//g, '-')}.pdf`);
       
       // Nettoyer
       document.body.removeChild(pdfContainer);
     }).catch(error => {
       console.error('Erreur lors de la génération du PDF:', error);
       alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
       document.body.removeChild(pdfContainer);
     });
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
              <button className="btn-orange" onClick={handleDownloadQuotePDF}>Télécharger PDF</button>
            </div>
          </div>

          <div className="size-chart-section">
            <div className="size-chart-header">
              <h3>Tableau des tailles Zip-Hoodie (en cm)</h3>
              <div className="size-chart-actions">
                <div className="predefined-sizes-buttons">
                  {Object.entries(predefinedSizeTemplates).map(([key, template]) => (
                    <button
                      key={key}
                      onClick={() => applyPredefinedSizes(key)}
                      className="predefined-size-button"
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
         <button 
           onClick={handleDownloadQuotePDF}
           className="download-pdf-button"
           style={{ marginLeft: '10px', backgroundColor: '#ff9800', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
         >
           Télécharger Devis PDF
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