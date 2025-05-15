import React from 'react';
import '../styles/Modal.css';

const Modal = ({ task, onClose, darkMode }) => {
  if (!task) return null;

  return (
    <div className={`modal-overlay ${darkMode ? 'dark' : 'light'}`}>
      <div className={`modal-content ${darkMode ? 'dark' : 'light'}`}>
        <h2>Détails de la tâche</h2>
        <p><strong>Titre:</strong> {task.title}</p>
        <p><strong>Colonne:</strong> {task.column}</p>
        <button onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
};

export default Modal;
