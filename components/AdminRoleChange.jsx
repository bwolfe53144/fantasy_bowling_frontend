import { useState, useEffect } from "react";
import { changeUserRole, getUsers } from "../src/utils/api.js";

const AdminRoleChange = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        setUsers(res.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleChangeRole = async () => {
    try {
      await changeUserRole({
        userId: selectedUserId,
        role: selectedRole,
      });
      alert('Role updated successfully!');
    } catch (error) {
      console.error('Error changing role:', error);
      alert('Error changing role. See console for details.');
    }
  };

  return (
    <div className="admin-section admin-column">
      <h2>Change Team Role</h2>
      <label>Choose Team Member:</label>
      <select
        value={selectedUserId || ''}
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
        value={selectedRole || ''}
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
    </div>
  );
};

export default AdminRoleChange;