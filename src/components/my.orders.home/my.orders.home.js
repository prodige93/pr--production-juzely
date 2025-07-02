import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import designProgressionService from '../../services/design-progression-service';
import './my.orders.home.css';

function Orders() {
  const [activeTab, setActiveTab] = useState(1);
  const [savedProgressions, setSavedProgressions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Charger les progressions sauvegardées
  useEffect(() => {
    const loadProgressions = () => {
      try {
        const progressions = designProgressionService.getAllProgressions();
        setSavedProgressions(progressions);
      } catch (error) {
        console.error('Erreur lors du chargement des progressions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgressions();
  }, []);

  const handleTabClick = (tabIndex) => {
    setActiveTab(tabIndex);
  };
  
  const handleStartDesignClick = () => {
    navigate("/design");
  };
  
  const handleMyOrdersClick = () => {
    navigate("/");
  };

  // Continuer une progression existante
  const handleContinueProgression = (progression) => {
    // Naviguer vers le design correspondant avec l'ID de progression
    const designPath = `/${progression.garmentType}-design`;
    navigate(designPath, { state: { progressionId: progression.id, designData: progression.designData } });
  };

  // Supprimer une progression
  const handleDeleteProgression = (progressionId, event) => {
    event.stopPropagation();
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette progression ?')) {
      try {
        const success = designProgressionService.deleteProgression(progressionId);
        if (success) {
          setSavedProgressions(prev => prev.filter(p => p.id !== progressionId));
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la progression.');
      }
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Générer un numéro de progression basé sur l'ID
  const getProgressionNumber = (progressionId) => {
    const match = progressionId.match(/_prog_(\d+)_/);
    return match ? `#${match[1].slice(-5)}` : `#${progressionId.slice(-5)}`;
  };
  /** DIV DU BOUTTON DRAFT 1 A ADD NEW COLLECTION */
  return (
    <div className="page-container">
      <div className="h5-orders">
        <h5 onClick={handleMyOrdersClick} style={{cursor: 'pointer'}}>My Orders</h5>
          <div className="button-bubble">
            <button className="button-chat">Chat</button>
            <button className="button-chat" onClick={handleStartDesignClick}>Start design</button>
            <button className="button-chat">Start new collection</button>
          </div>
      </div>
      <div className="orders-tabs" data-active={activeTab}>
        <button
          className={`tab-button ${activeTab === 1 ? "active" : ""}`}
          onClick={() => handleTabClick(1)}
        >
          Drafts 
        </button>
        <button
          className={`tab-button ${activeTab === 2 ? "active" : ""}`}
          onClick={() => handleTabClick(2)}
        >
          Samples
        </button>
        <button
          className={`tab-button ${activeTab === 3 ? "active" : ""}`}
          onClick={() => handleTabClick(3)}
        >
          Bulks
        </button>
      </div>
      <div className="orders-content">
        {activeTab === 1 && (
          <div className="tab-frame">
            {loading ? (
              <div className="loading-message">Chargement des progressions...</div>
            ) : savedProgressions.length > 0 ? (
              <>
                {savedProgressions
                  .filter(p => p.status === 'draft')
                  .map((progression) => (
                    <div 
                      key={progression.id} 
                      className="progression-card"
                      onClick={() => handleContinueProgression(progression)}
                    >
                      <div className="progression-header">
                        <div className="progression-number">{getProgressionNumber(progression.id)}</div>
                        <div className="progression-type">{progression.garmentType.charAt(0).toUpperCase() + progression.garmentType.slice(1)}</div>
                        <button 
                          className="delete-btn"
                          onClick={(e) => handleDeleteProgression(progression.id, e)}
                          title="Supprimer"
                        >
                          ×
                        </button>
                      </div>
                      <div className="progression-content">
                        <div className="progression-thumbnail">
                          <img src={progression.thumbnail} alt="Aperçu" />
                        </div>
                        <div className="progression-details">
                          <div className="progression-title">{progression.title}</div>
                          <div className="progression-date">{formatDate(progression.updatedAt)}</div>
                          <div className="progression-status">
                            {progression.isManualSave ? '💾 Sauvegarde manuelle' : '🔄 Sauvegarde auto'}
                          </div>
                        </div>
                      </div>
                      <div className="progression-footer">
                        <span className="continue-text">Continuer</span>
                      </div>
                    </div>
                  ))
                }
                <button className="button-frame start-new" onClick={handleStartDesignClick}>
                  + Start design
                </button>
                <button className="button-frame start-new">
                  + Start new collection
                </button>
              </>
            ) : (
              <>
                <button className="button-frame" onClick={handleStartDesignClick}>
                  Start design
                </button>
                <button className="button-frame">
                  Start new collection
                </button>
              </>
            )}
          </div>
        )}
        {activeTab === 2 && (
          <div className="tab-frame">
            {loading ? (
              <div className="loading-message">Chargement des échantillons...</div>
            ) : savedProgressions.filter(p => p.status === 'sample').length > 0 ? (
              savedProgressions
                .filter(p => p.status === 'sample')
                .map((progression) => (
                  <div 
                    key={progression.id} 
                    className="progression-card"
                    onClick={() => handleContinueProgression(progression)}
                  >
                    <div className="progression-header">
                      <div className="progression-number">{getProgressionNumber(progression.id)}</div>
                      <div className="progression-type">{progression.garmentType.charAt(0).toUpperCase() + progression.garmentType.slice(1)}</div>
                    </div>
                    <div className="progression-content">
                      <div className="progression-thumbnail">
                        <img src={progression.thumbnail} alt="Aperçu" />
                      </div>
                      <div className="progression-details">
                        <div className="progression-title">{progression.title}</div>
                        <div className="progression-date">{formatDate(progression.updatedAt)}</div>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="empty-message">Aucun échantillon disponible</div>
            )}
          </div>
        )}
        {activeTab === 3 && (
          <div className="tab-frame">
            {loading ? (
              <div className="loading-message">Chargement des commandes en gros...</div>
            ) : savedProgressions.filter(p => p.status === 'bulk').length > 0 ? (
              savedProgressions
                .filter(p => p.status === 'bulk')
                .map((progression) => (
                  <div 
                    key={progression.id} 
                    className="progression-card"
                    onClick={() => handleContinueProgression(progression)}
                  >
                    <div className="progression-header">
                      <div className="progression-number">{getProgressionNumber(progression.id)}</div>
                      <div className="progression-type">{progression.garmentType.charAt(0).toUpperCase() + progression.garmentType.slice(1)}</div>
                    </div>
                    <div className="progression-content">
                      <div className="progression-thumbnail">
                        <img src={progression.thumbnail} alt="Aperçu" />
                      </div>
                      <div className="progression-details">
                        <div className="progression-title">{progression.title}</div>
                        <div className="progression-date">{formatDate(progression.updatedAt)}</div>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="empty-message">Aucune commande en gros disponible</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
