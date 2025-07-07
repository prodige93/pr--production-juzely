import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import QuotePDF from './QuotePDF';

const LazyPDFDownloadButton = ({ quote, selections, className = 'pdf-btn' }) => {
  if (!quote) {
    return (
      <button className={className} disabled>
        📄 Télécharger le devis PDF
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<QuotePDF quote={quote} selections={selections} />}
      fileName={`devis-juzely-${new Date().getTime()}.pdf`}
      className={className}
    >
      {({ blob, url, loading, error }) => {
        if (error) {
          return '❌ Erreur PDF';
        }
        return loading ? '⏳ Génération du PDF...' : '📄 Télécharger le devis PDF';
      }}
    </PDFDownloadLink>
  );
};

export default LazyPDFDownloadButton;