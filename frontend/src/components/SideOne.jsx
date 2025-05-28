import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Import specific icons you want to use from react-icons
import { FaDollarSign, FaPlusCircle, FaUserCircle, FaSignOutAlt, FaChartBar } from 'react-icons/fa';
import { useAuthStore } from '../store/useAuthStore'; // Assuming you have a logout function here

const SideOne = () => {
  const navigate = useNavigate();
  const location = useLocation(); // To get the current path
  const { logout } = useAuthStore(); // Assuming you have a logout function in your auth store

  const navItems = [
    { name: 'Dashboard', path: '/', icon: FaChartBar },
    { name: 'Expenses', path: '/expenses', icon: FaDollarSign },
    { name: 'Add Income', path: '/add-income', icon: FaPlusCircle },
    { name: 'Profile', path: '/profile', icon: FaUserCircle },
  ];

  const handleLogout = () => {
    logout(); // Call the logout function from your store
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <div className='h-screen bg-[#D1D0FB] flex flex-col items-end py-8 gap-4'> {/* Adjusted py-8 and gap-4 for better spacing */}
      {/* Map through navItems to render navigation links */}
      {navItems.map((item) => (
        <div
          key={item.name} // Unique key for each item
          className={`
                        flex gap-2 Text w-[25vw] h-[80px] items-center justify-start p-10
                        cursor-pointer transition-colors duration-200
                        ${location.pathname === item.path
              ? 'bg-white text-purple-700 font-bold shadow-md' // Active state: white background, purple text, shadow
              : 'bg-[#D1D0FB] text-gray-800 hover:bg-white hover:text-purple-700' // Inactive state: sidebar background, hover to white
            }
                    `}
          onClick={() => navigate(item.path)}
        >
          {React.createElement(item.icon, { className: 'w-[30px] h-[30px] object-contain' })}
          <p>{item.name}</p>
        </div>
      ))}

      {/* Logout Button - placed separately at the bottom */}
    </div>
  );
}

export default SideOne;