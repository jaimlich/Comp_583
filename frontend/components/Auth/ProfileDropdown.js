import React from 'react';

const ProfileDropdown = ({ user, onLogout }) => {
  return (
    <div className="profile-dropdown">
      <button>{user.email.split('@')[0]}</button>
      <div className="dropdown-content">
        <button>View Profile</button>
        <button>My Bookings</button>
        <button onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
