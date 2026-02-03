import React from 'react';
import './Sidebar.css';

function Sidebar({ children }) {
  return (
    <div className="sidebar">
      {children}
    </div>
  );
}

export default Sidebar;
