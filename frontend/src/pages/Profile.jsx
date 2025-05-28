import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import {
    FaUserCircle, FaEnvelope, FaIdBadge, FaWallet, FaEdit,
    FaSignOutAlt, FaCheckCircle, FaTimesCircle, FaRegCalendarAlt, FaCalendarCheck
} from 'react-icons/fa'; // Added FaRegCalendarAlt, FaCalendarCheck for dates

const Profile = () => {
    const navigate = useNavigate();
    const { profile, auth, isLoading, logout, updateTotalMoney } = useAuthStore();
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [newBudget, setNewBudget] = useState(auth?.user?.totalBudget || 0);
    const [showSaveMessage, setShowSaveMessage] = useState(false);
    const [saveMessageText, setSaveMessageText] = useState('');
    const [saveMessageType, setSaveMessageType] = useState(''); // 'success' or 'error'

    useEffect(() => {
        profile(); // Fetch profile data on component mount
    }, [profile]);

    // Update newBudget state if auth.user.totalBudget changes (e.g., after initial load or update)
    useEffect(() => {
        if (auth.user?.totalBudget !== undefined) {
            setNewBudget(auth.user.totalBudget);
        }
    }, [auth.user?.totalBudget]);

    const handleBudgetUpdate = async () => {
        if (!isNaN(parseFloat(newBudget))) {
            try {
                await updateTotalMoney({
                    totalBudget: Number(newBudget)
                });
                await profile(); // Refresh auth data to reflect changes
                setSaveMessageText('Budget updated successfully!');
                setSaveMessageType('success');
                setShowSaveMessage(true);
            } catch (error) {
                console.error('Error updating budget:', error);
                setSaveMessageText('Failed to update budget. Please try again.');
                setSaveMessageType('error');
                setShowSaveMessage(true);
            } finally {
                setIsEditingBudget(false);
                setTimeout(() => setShowSaveMessage(false), 3000);
            }
        } else {
            setSaveMessageText('Invalid budget amount.');
            setSaveMessageType('error');
            setShowSaveMessage(true);
            setTimeout(() => setShowSaveMessage(false), 3000);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-2xl font-semibold text-gray-700 animate-pulse">Loading profile...</div>
            </div>
        );
    }

    const user = auth.user;

    // Helper function to format dates
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            console.error("Error formatting date:", e);
            return 'Invalid Date';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.005] border border-gray-100">
                <div className="p-8 sm:p-10">
                    {/* Profile Header */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                            <FaUserCircle className="text-purple-500 text-4xl" />
                            User Profile
                        </h2>
                    </div>

                    {/* Save/Error Message */}
                    {showSaveMessage && (
                        <div className={`p-4 mb-6 rounded-xl flex items-center gap-3
                            ${saveMessageType === 'success' ? 'bg-green-100 text-green-700 border border-green-400' : 'bg-red-100 text-red-700 border border-red-400'}`}>
                            {saveMessageType === 'success' ? <FaCheckCircle className="text-xl" /> : <FaTimesCircle className="text-xl" />}
                            <p className="font-medium">{saveMessageText}</p>
                        </div>
                    )}

                    {/* User Information Section */}
                    <div className="space-y-6 mb-10">
                        {/* Name */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl shadow-sm">
                            <FaUserCircle className="text-indigo-500 text-2xl flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Name</p>
                                <p className="text-lg font-semibold text-gray-800">{user?.name || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl shadow-sm">
                            <FaEnvelope className="text-blue-500 text-2xl flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Email Address</p>
                                <p className="text-lg font-semibold text-gray-800">{user?.email || 'N/A'}</p>
                            </div>
                        </div>

                        {/* User ID (UID/ _id) */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl shadow-sm">
                            <FaIdBadge className="text-teal-500 text-2xl flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">User ID</p>
                                {/* Displaying _id as per your provided data structure */}
                                <p className="text-sm font-mono text-gray-800 break-all select-all">{user?._id || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Total Budget (with edit functionality) */}
                        <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl shadow-sm">
                            <div className="flex items-center gap-4">
                                <FaWallet className="text-purple-500 text-2xl flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Budget</p>
                                    {isEditingBudget ? (
                                        <input
                                            type="number"
                                            value={newBudget}
                                            onChange={(e) => setNewBudget(e.target.value)}
                                            onBlur={handleBudgetUpdate}
                                            onKeyPress={(e) => e.key === 'Enter' && handleBudgetUpdate()}
                                            className="text-lg font-semibold border-b-2 border-purple-400 bg-transparent outline-none w-32 sm:w-40 text-gray-800"
                                            autoFocus
                                        />
                                    ) : (
                                        <p className="text-lg font-semibold text-gray-800">
                                            ${(user?.totalBudget || 0).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {!isEditingBudget && (
                                <button
                                    onClick={() => setIsEditingBudget(true)}
                                    className="text-purple-600 hover:text-purple-800 transition-colors duration-200 p-2 rounded-full hover:bg-purple-50"
                                    aria-label="Edit budget"
                                >
                                    <FaEdit className="text-xl" />
                                </button>
                            )}
                        </div>

                        {/* Remaining Budget (Display Only) */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl shadow-sm">
                            <FaWallet className="text-green-500 text-2xl flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Remaining Budget</p>
                                <p className="text-lg font-semibold text-gray-800">
                                    ${(user?.remainingBudget || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Created At */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl shadow-sm">
                            <FaRegCalendarAlt className="text-orange-500 text-2xl flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Account Created</p>
                                <p className="text-lg font-semibold text-gray-800">{formatDate(user?.createdAt)}</p>
                            </div>
                        </div>

                        {/* Updated At */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl shadow-sm">
                            <FaCalendarCheck className="text-pink-500 text-2xl flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                                <p className="text-lg font-semibold text-gray-800">{formatDate(user?.updatedAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-3"
                        >
                            <FaSignOutAlt className="text-xl" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;