import { useReservationSystem } from "../hooks/useReservationSystem";
import "./popup.css";

/**
 * TODO : Compléter la composante pour permettre l'annulation d'une réservation.
 * @param {string} reservationId : identifiant de la réservation à annuler
 * @param {HTMLElement} content : contenu du popup sous forme de contenu HTML arbitraire
 * @param {Function} handleClose : fonction à appeler pour fermer le popup 
 * @returns {JSX.Element} : Popup pour annuler une réservation
 */
const Popup = ({ reservationId, content, handleClose }) => {
  const { cancelReservation, error } = useReservationSystem();

  // TODO : envoyer une requête pour annuler la réservation.
  // Recharger la page après une annulation réussie.
  const handleCancel = async () => {
    try {
      await cancelReservation(reservationId); // Annulation de la réservation 
      alert("Réservation annulée avec succès");
      window.location.reload();  // Recharger la page après une annulation réussie
    } catch (error) {
      alert("Erreur lors de l'annulation de la réservation");
    }
  };

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="title-container">
          <h2>Réservation</h2>
          <button className="close-btn" onClick={handleClose}> &times; </button>
        </div>
        <h3>{content}</h3>
        <button className="cancel-btn" onClick={handleCancel}> Annuler</button>
      </div>
    </div>
  );
};

export default Popup;
