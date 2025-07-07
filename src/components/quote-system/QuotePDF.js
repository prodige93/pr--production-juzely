import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from '@react-pdf/renderer';

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#2196f3',
    paddingBottom: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196f3',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 12,
    color: '#666666'
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  label: {
    fontSize: 11,
    color: '#666666',
    flex: 1
  },
  value: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    textAlign: 'right'
  },
  priceSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 5
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: 1,
    borderTopColor: '#2196f3'
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196f3'
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196f3'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#999999',
    borderTop: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10
  },
  // Styles pour le tableau des tailles
  sizeTable: {
    marginTop: 10
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e9ecef',
    padding: 5,
    borderBottom: 1,
    borderBottomColor: '#dee2e6'
  },
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    borderBottom: 1,
    borderBottomColor: '#f0f0f0'
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    textAlign: 'center',
    padding: 2
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 2
  },
  sizeInfo: {
    backgroundColor: '#fff3e0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderLeft: 3,
    borderLeftColor: '#ff9800'
  },
  predefinedSizeInfo: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderLeft: 3,
    borderLeftColor: '#2196f3'
  }
});

const QuotePDF = ({ quote, selections }) => {
  // Fonction pour générer le contenu des tailles
  const renderSizeContent = () => {
    if (!quote.sizeInfo) return null;

    const { selectedFit, isCustomSize, sizeData } = quote.sizeInfo;

    if (isCustomSize || selectedFit === 'custom') {
      // Tailles personnalisées - tableau détaillé
      if (!sizeData || Object.keys(sizeData).length === 0) {
        return (
          <View style={styles.sizeInfo}>
            <Text style={styles.sectionTitle}>📏 Informations de taille</Text>
            <Text style={styles.label}>Type: Tailles personnalisées (aucune donnée disponible)</Text>
          </View>
        );
      }

      const sizes = Object.keys(sizeData);
      const measurements = Object.keys(sizeData[sizes[0]] || {});

      return (
        <View style={styles.sizeInfo}>
          <Text style={styles.sectionTitle}>📏 Informations de taille</Text>
          <Text style={styles.label}>Type: Tailles personnalisées</Text>
          
          <View style={styles.sizeTable}>
            {/* En-tête du tableau */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellHeader}>Mesures</Text>
              {sizes.map(size => (
                <Text key={size} style={styles.tableCellHeader}>{size}</Text>
              ))}
            </View>
            
            {/* Lignes du tableau */}
            {measurements.map(measurement => (
              <View key={measurement} style={styles.tableRow}>
                <Text style={styles.tableCell}>{measurement}</Text>
                {sizes.map(size => (
                  <Text key={size} style={styles.tableCell}>
                    {sizeData[size][measurement] || '0'} cm
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </View>
      );
    } else {
      // Taille prédéfinie - nom simple
      const sizeNames = {
        'oversized': 'Oversized',
        'regular': 'Regular',
        'slim': 'Slim',
        'cropped': 'Cropped'
      };

      return (
        <View style={styles.predefinedSizeInfo}>
          <Text style={styles.sectionTitle}>📏 Informations de taille</Text>
          <Text style={styles.label}>
            Taille prédéfinie: {sizeNames[selectedFit] || selectedFit.toUpperCase()}
          </Text>
        </View>
      );
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>DEVIS JUZELY</Text>
          <Text style={styles.subtitle}>
            Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
          </Text>
        </View>

        {/* Informations de taille */}
        {renderSizeContent()}

        {/* Détails du produit */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Détails du produit</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Type de vêtement:</Text>
            <Text style={styles.value}>T-shirt</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tissu:</Text>
            <Text style={styles.value}>{quote.fabricName || 'Non spécifié'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Coloris:</Text>
            <Text style={styles.value}>{quote.colourwayName || 'Non spécifié'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Embellissement:</Text>
            <Text style={styles.value}>{quote.embellishmentName || 'Aucun'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Finitions:</Text>
            <Text style={styles.value}>{quote.finishingsName || 'Standard'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Emballage:</Text>
            <Text style={styles.value}>{quote.packagingName || 'Standard'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Livraison:</Text>
            <Text style={styles.value}>{quote.deliveryName || 'Standard'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Quantité:</Text>
            <Text style={styles.value}>{selections?.quantity || 1} pièce(s)</Text>
          </View>
        </View>

        {/* Composition du prix */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Composition du prix</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Coût du tissu:</Text>
            <Text style={styles.value}>{quote.fabricCost?.toFixed(2) || '0.00'} €</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Coût du coloris:</Text>
            <Text style={styles.value}>{quote.colourwayCost?.toFixed(2) || '0.00'} €</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Coût embellissement:</Text>
            <Text style={styles.value}>{quote.embellishmentCost?.toFixed(2) || '0.00'} €</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Coût finitions:</Text>
            <Text style={styles.value}>{quote.finishingsCost?.toFixed(2) || '0.00'} €</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Coût emballage:</Text>
            <Text style={styles.value}>{quote.packagingCost?.toFixed(2) || '0.00'} €</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Coût livraison:</Text>
            <Text style={styles.value}>{quote.deliveryCost?.toFixed(2) || '0.00'} €</Text>
          </View>
          {quote.quantityDiscount > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Remise quantité:</Text>
              <Text style={styles.value}>-{quote.quantityDiscount?.toFixed(2)} €</Text>
            </View>
          )}
        </View>

        {/* Prix total */}
        <View style={styles.priceSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>PRIX TOTAL:</Text>
            <Text style={styles.totalValue}>{quote.totalPrice?.toFixed(2) || '0.00'} €</Text>
          </View>
        </View>

        {/* Pied de page */}
        <Text style={styles.footer}>
          Ce devis est valable 30 jours à compter de sa date d'émission.
          Pour toute question, contactez-nous à contact@juzely.com
        </Text>
      </Page>
    </Document>
  );
};

export default QuotePDF;