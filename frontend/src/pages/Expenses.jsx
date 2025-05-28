import React, { useState } from 'react';
import useExpenseStore from '../store/useExpenseStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker'; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Import DatePicker styles

// Import React Icons for better visual feedback
import { FaDollarSign, FaPen, FaListAlt, FaCalendarAlt, FaPlusCircle, FaWallet, FaTimesCircle } from 'react-icons/fa';
import { RiMoneyDollarCircleFill } from 'react-icons/ri'; // More prominent dollar icon for amount
import { MdCategory } from 'react-icons/md'; // Category icon

const Expenses = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        amount: '',
        category: '',
        date: new Date(), // Initialize date with current date for convenience
    });
    const { addExpense } = useExpenseStore();
    const { auth, isLoading } = useAuthStore();
    const [showError, setShowError] = useState(false); // State to control error message visibility

    if (isLoading) {
        return (
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!form.title || !form.amount || !form.category || !form.date) {
            alert('Please fill in all fields.'); // Simple alert, could be a better UI message
            return;
        }

        if (auth.user?.totalBudget === 0 || !auth.user?.totalBudget) { // Check for undefined or 0 budget
            setShowError(true); // Show the specific error message
            setTimeout(() => setShowError(false), 5000); // Hide after 5 seconds
            return;
        }

        try {
            // Format the date to 'YYYY-MM-DD' string before sending, if your backend expects that.
            // If your backend handles Date objects directly, you might not need to format it here.
            const expenseData = {
                ...form,
                amount: Number(form.amount), // Ensure amount is a number
                date: form.date.toISOString().split('T')[0], // Format to YYYY-MM-DD
            };
            await addExpense(expenseData);
            setForm({
                title: "",
                amount: "",
                category: "",
                date: new Date(), // Reset date to current date for next entry
            });
            navigate('/home'); // Navigate back to home or a success page
        } catch (error) {
            console.error('Error adding expense:', error);
            // Optionally show an error message to the user
            alert('Failed to add expense. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.01] border border-gray-100">
                <div className="p-8 sm:p-10">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                            <FaPlusCircle className="text-purple-500 text-3xl" />
                            Add New Expense
                        </h2>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 font-medium">Your Total Budget</p>
                            <p className="text-2xl font-bold text-purple-600 flex items-center justify-end">
                                <FaWallet className="text-xl mr-1 text-purple-500" />
                                ${auth.user?.totalBudget?.toLocaleString() || '0.00'}
                            </p>
                        </div>
                    </div>

                    {showError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 flex items-center justify-between" role="alert">
                            <span className="block sm:inline">Your total budget is 0. Please set a budget first.</span>
                            <button onClick={() => setShowError(false)} className="text-red-700 hover:text-red-900 focus:outline-none">
                                <FaTimesCircle className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title Input */}
                        <div className="relative group">
                            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">Expense Title</label>
                            <div className="bg-gray-50 rounded-xl flex items-center px-4 py-3 border border-transparent focus-within:border-purple-400 focus-within:ring-1 focus-within:ring-purple-400 transition-all duration-200">
                                <FaPen className="text-gray-400 group-focus-within:text-purple-500 transition-colors text-lg flex-shrink-0 mr-3" />
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    placeholder="e.g., Groceries from Monday"
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
                            <div className="bg-gray-50 rounded-xl flex items-center px-4 py-3 border border-transparent focus-within:border-purple-400 focus-within:ring-1 focus-within:ring-purple-400 transition-all duration-200">
                                <RiMoneyDollarCircleFill className="text-gray-400 group-focus-within:text-purple-500 transition-colors text-2xl flex-shrink-0 mr-2" />
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    placeholder="0.00"
                                    value={form.amount}
                                    onChange={handleChange}
                                    className="w-full bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 text-base"
                                    step="0.01" // Allow decimal amounts
                                    required
                                />
                            </div>
                        </div>

                        {/* Category Select */}
                        <div className="relative group">
                            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                            <div className="bg-gray-50 rounded-xl flex items-center px-4 py-3 border border-transparent focus-within:border-purple-400 focus-within:ring-1 focus-within:ring-purple-400 transition-all duration-200">
                                <MdCategory className="text-gray-400 group-focus-within:text-purple-500 transition-colors text-2xl flex-shrink-0 mr-2" />
                                <select
                                    id="category"
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    className="w-full bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 text-base appearance-none cursor-pointer" // appearance-none to hide default arrow
                                    required
                                >
                                    <option value="" disabled>Select a Category</option>
                                    <option value="food">Food & Drinks</option>
                                    <option value="housing">Housing</option>
                                    <option value="transport">Transport</option>
                                    <option value="entertainment">Entertainment</option>
                                    <option value="bills">Bills</option>
                                    <option value="other">Other</option> {/* Added 'other' for miscellaneous */}
                                </select>
                                {/* Custom arrow for select */}
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        </div>

                        {/* Date Picker */}
                        <div className="relative group">
                            <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                            <div className="bg-gray-50 rounded-xl flex items-center px-4 py-3 border border-transparent focus-within:border-purple-400 focus-within:ring-1 focus-within:ring-purple-400 transition-all duration-200">
                                <FaCalendarAlt className="text-gray-400 group-focus-within:text-purple-500 transition-colors text-lg flex-shrink-0 mr-3" />
                                <DatePicker
                                    id="date"
                                    selected={form.date}
                                    onChange={handleDateChange}
                                    dateFormat="MMM dd, yyyy"
                                    className="w-full bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 text-base cursor-pointer"
                                    maxDate={new Date()} // Prevent selecting future dates
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                        >
                            <FaPlusCircle className="text-xl" />
                            Add Expense
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Expenses;