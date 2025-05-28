// src/pages/AddIncome.jsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

// Import React Icons for better visual feedback
import { FaMoneyBillWave, FaPen, FaCalendarAlt, FaPlusCircle, FaWallet } from 'react-icons/fa';
import { RiMoneyDollarCircleFill } from 'react-icons/ri'; // More prominent dollar icon
import useExpenseStore from '../store/useExpenseStore';

const AddIncome = () => {
    const navigate = useNavigate();
    const { auth, isLoading } = useAuthStore();
    const  {addIncome} = useExpenseStore()
    const [form, setForm] = useState({
        title: '',
        amount: '',
        date: new Date(), // Initialize date with current date
    });

    if (isLoading) {
        return (
            // This specific loading div will remain light mode too, as dark: classes are removed
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-2xl font-semibold text-gray-700 animate-pulse">Loading user data...</div>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleDateChange = (date) => {
        setForm({ ...form, date }); // DatePicker returns a Date object
    };

    // This function is intentionally left empty as per your request
    const handleAddIncome = (e) => {
        e.preventDefault();
        addIncome(form  )
        console.log("Attempting to add income (function is empty):", form);
        
    };

    return (
        // All 'dark:' classes removed from this component
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center text-gray-800">
            <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.01] border border-gray-100">
                <div className="p-8 sm:p-10">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                            <FaMoneyBillWave className="text-green-500 text-3xl" />
                            Add New Income
                        </h2>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 font-medium">Your Total Budget</p>
                            <p className="text-2xl font-bold text-purple-600 flex items-center justify-end">
                                <FaWallet className="text-xl mr-1 text-purple-500" />
                                ${auth.user?.totalBudget?.toLocaleString() || '0.00'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleAddIncome} className="space-y-6">
                        {/* Title Input */}
                        <div className="relative group">
                            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">Income Source</label>
                            <div className="bg-gray-50 rounded-xl flex items-center px-4 py-3 border border-transparent focus-within:border-green-400 focus-within:ring-1 focus-within:ring-green-400 transition-all duration-200">
                                <FaPen className="text-gray-400 group-focus-within:text-green-500 transition-colors text-lg flex-shrink-0 mr-3" />
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    placeholder="e.g., Monthly Salary"
                                    value={form.title}
                                    onChange={handleChange}
                                    className="w-full bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 text-base"
                                    required
                                />
                            </div>
                        </div>

                        {/* Amount Input */}
                        <div className="relative group">
                            <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
                            <div className="bg-gray-50 rounded-xl flex items-center px-4 py-3 border border-transparent focus-within:border-green-400 focus-within:ring-1 focus-within:ring-green-400 transition-all duration-200">
                                <RiMoneyDollarCircleFill className="text-gray-400 group-focus-within:text-green-500 transition-colors text-2xl flex-shrink-0 mr-2" />
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    placeholder="0.00"
                                    value={form.amount}
                                    onChange={handleChange}
                                    className="w-full bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 text-base"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>

                        {/* Date Picker */}
                        <div className="relative group">
                            <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                            <div className="bg-gray-50 rounded-xl flex items-center px-4 py-3 border border-transparent focus-within:border-green-400 focus-within:ring-1 focus-within:ring-green-400 transition-all duration-200">
                                <FaCalendarAlt className="text-gray-400 group-focus-within:text-green-500 transition-colors text-lg flex-shrink-0 mr-3" />
                                <DatePicker
                                    id="date"
                                    selected={form.date}
                                    onChange={handleDateChange}
                                    dateFormat="MMM dd, yyyy"
                                    className="w-full bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 text-base cursor-pointer"
                                    maxDate={new Date()}
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                        >
                            <FaPlusCircle className="text-xl" />
                            Add Income
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddIncome;