import React from "react";

const Modal = ({ title, message, onConfirm, onCancel, confirmText = "OK", cancelText = "Cancel", showCancel = false }) => {
  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modalActions">
          <button onClick={onConfirm} className="modal-confirm-button">{confirmText}</button>
          {showCancel && <button onClick={onCancel} className="modal-cancel-button">{cancelText}</button>}
        </div>
      </div>
    </div>
  );
};

export default Modal;