import { acceptTrade, declineTrade } from "../src/utils/api";

export const useTradeActions = (showConfirmModal, showResultModal) => {
    const handleAcceptTrade = async (tradeId) => {
      const confirmed = await showConfirmModal({
        title: "Confirm Accept",
        message: "Are you sure you want to accept this trade?",
        confirmText: "Yes",
        cancelText: "No",
        showCancel: true,
      });
      if (!confirmed) return;
  
      try {
        await acceptTrade(tradeId);
        await showResultModal({
          title: "Trade Accepted!",
          message: "You have successfully accepted this trade.",
          confirmText: "OK",
        });
      } catch (err) {
        console.error(err);
        await showResultModal({
          title: "Error",
          message: "Failed to accept trade.",
          confirmText: "OK",
        });
      } finally {
        window.location.href = "/profile";
      }
    };
  
    const handleDeclineTrade = async (tradeId) => {
      const confirmed = await showConfirmModal({
        title: "Confirm Decline",
        message: "Are you sure you want to decline this trade?",
        confirmText: "Yes",
        cancelText: "No",
        showCancel: true,
      });
      if (!confirmed) return;
  
      try {
        await declineTrade(tradeId);
        await showResultModal({
          title: "Trade Declined",
          message: "You have declined this trade.",
          confirmText: "OK",
        });
      } catch (err) {
        console.error(err);
        await showResultModal({
          title: "Error",
          message: "Failed to decline trade.",
          confirmText: "OK",
        });
      } finally {
        window.location.href = "/profile";
      }
    };
  
    const handleCancelTrade = async (tradeId) => {
      const confirmed = await showConfirmModal({
        title: "Confirm Cancel",
        message: "Are you sure you want to cancel this trade?",
        confirmText: "Yes",
        cancelText: "No",
        showCancel: true,
      });
      if (!confirmed) return;
  
      try {
        await declineTrade(tradeId);
        await showResultModal({
          title: "Trade Cancelled",
          message: "Your trade has been cancelled.",
          confirmText: "OK",
        });
      } catch (err) {
        console.error(err);
        await showResultModal({
          title: "Error",
          message: "Failed to cancel trade.",
          confirmText: "OK",
        });
      } finally {
        window.location.href = "/profile";
      }
    };
  
    return { handleAcceptTrade, handleDeclineTrade, handleCancelTrade };
  };