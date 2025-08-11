import { useState } from "react";
import { changeUserRole } from "../src/utils/api.js";
import Modal from "./Modal";
import { useModal } from "../hooks/useModal";

const AdminRoleChange = ({ users }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [modalProps, showModal] = useModal();

  const handleChangeRole = async () => {
    if (!selectedUserId || !selectedRole) {
      await showModal({
        title: "Missing Selection",
        message: "Please select both a user and a role before continuing.",
        confirmText: "OK",
        showCancel: false,
      });
      return;
    }

    try {
      await changeUserRole({
        userId: selectedUserId,
        role: selectedRole,
      });
      await showModal({
        title: "Success",
        message: "Role updated successfully!",
        confirmText: "OK",
        showCancel: false,
      });
      setSelectedUserId('');
      setSelectedRole('');
    } catch (error) {
      console.error('Error changing role:', error);
      await showModal({
        title: "Error",
        message: "Error changing role. See console for details.",
        confirmText: "OK",
        showCancel: false,
      });
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

      {modalProps && <Modal {...modalProps} />}
    </div>
  );
};

export default AdminRoleChange;