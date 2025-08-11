import { useState, useCallback } from "react";

export function useModal() {
  const [modalProps, setModalProps] = useState(null);

  const showModal = useCallback(({ title, message, confirmText, cancelText, showCancel }) => {
    return new Promise((resolve) => {
      const handleConfirm = () => {
        setModalProps(null);
        resolve(true);
      };
      const handleCancel = () => {
        setModalProps(null);
        resolve(false);
      };

      setModalProps({
        title,
        message,
        confirmText,
        cancelText,
        showCancel,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
      });
    });
  }, []);

  return [modalProps, showModal];
}