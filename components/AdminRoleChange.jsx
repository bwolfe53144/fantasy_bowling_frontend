import { useState } from "react";
import { changeUserRole } from "../src/utils/api.js";

const AdminRoleChange = ({ users }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Modal state
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const openAlert = (msg) => {
    setAlertMessage(msg);
    setShowAlertModal(true);
  };

  const handleChangeRole = async () => {
    try {
      await changeUserRole({
        userId: selectedUserId,
        role: selectedRole,
      });
      openAlert('Role updated successfully!');
    } catch (error) {
      console.error('Error changing role:', error);
      openAlert('Error changing role. See console for details.');
    }
  };

  return (
    <div className="admin-section admin-column">
      <h2>Change User Role</h2>

      <label>Choose User:</label>
      <select
        value={selectedUserId}
        onChange={(e) => setSelectedUserId(e.target.value)}
        className="admin-input"
      >
        <option value="">-- Select User --</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>

      <label>Choose Role:</label>
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        className="admin-input"
      >
        <option value="">-- Select Role --</option>
        <option value="ADMIN">ADMIN</option>
        <option value="MANAGER">MANAGER</option>
        <option value="MEMBER">MEMBER</option>
        <option value="NEW">NEW</option>
      </select>

      <button
        className="admin-button"
        onClick={handleChangeRole}
        disabled={!selectedUserId || !selectedRole}
      >
        Change Role
      </button>

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h2>Notice</h2>
            <p>{alertMessage}</p>
            <div className="modalActions">
              <button
                onClick={() => setShowAlertModal(false)}
                className="modal-cancel-button"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoleChange;