import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, subMonths, subYears, isWithinInterval, parseISO, startOfYear, endOfYear, startOfMonth, endOfMonth } from 'date-fns';
import { FaUtensils, FaCar, FaHome, FaFilm, FaArrowUp, FaDollarSign, FaEdit, FaChartLine, FaChartPie, FaListAlt, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa'; // Added FaMoneyBillWave
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Import the renamed store
import { useAuthStore } from '../store/useAuthStore';
import useExpenseStore from '../store/useExpenseStore';

const Home = () => {
    // Destructure incomes from the new store
    const { getAllExpenses, expenses, incomes, isLoading: financialLoading, updateTotalMoney, getIncomes } = useExpenseStore();
    const { profile, auth, isLoading: authLoading } = useAuthStore();
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [newBudget, setNewBudget] = useState(auth?.user?.totalBudget || 0);
    const [timeRange, setTimeRange] = useState('Month'); // Default to 'Month'
    const [customStartDate, setCustomStartDate] = useState(null);
    const [customEndDate, setCustomEndDate] = useState(null);

    // Combine loading states for a single loading spinner
    const isLoading = financialLoading || authLoading;

    
    
    useEffect(() => {
        getAllExpenses();
        getIncomes(); // Fetch incomes when component mounts
        profile(); // Fetch user profile (to get updated budget)
    }, [getAllExpenses, getIncomes, profile]); // Add getIncomes to dependency array
    console.log(incomes);
    
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    const safeIncomes = Array.isArray(incomes) ? incomes : []; // Ensure incomes is an array

    const totalOverallExpenses = safeExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const totalOverallIncomes = safeIncomes.reduce((sum, inc) => sum + (inc.amount || 0), 0); // Calculate total incomes

    // The `auth.user?.totalBudget` from your backend typically already includes all incomes added.
    // So, remaining budget is simply the current total budget minus total expenses.
    const remainingBudget = (auth.user?.totalBudget || 0) - totalOverallExpenses;

    // Reusable filter function for both expenses and incomes based on selected time range
    const filterTransactionsByTimeRange = (data, range, customSDate, customEDate) => {
        const now = new Date();
        let startDate = null;
        let endDate = now;

        switch (range) {
            case 'Week':
                startDate = subDays(now, 7);
                break;
            case 'Month':
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
                break;
            case 'Year':
                startDate = startOfYear(now);
                endDate = endOfYear(now);
                break;
            case 'Previous Year':
                const prevYear = subYears(now, 1);
                startDate = startOfYear(prevYear);
                endDate = endOfYear(prevYear);
                break;
            case 'Custom':
                startDate = customSDate;
                endDate = customEDate;
                break;
            default:
                return data;
        }

        if (!startDate || !endDate) {
            return []; // Return empty if custom range selected but dates are missing
        }

        return data.filter(item => {
            const itemDate = parseISO(item.date);
            return isWithinInterval(itemDate, { start: startDate, end: endDate });
        });
    };

    const filteredExpenses = filterTransactionsByTimeRange(safeExpenses, timeRange, customStartDate, customEndDate);
    const filteredIncomes = filterTransactionsByTimeRange(safeIncomes, timeRange, customStartDate, customEndDate);

    // Prepare chart data for expenses
    const expenseChartData = filteredExpenses.reduce((acc, exp) => {
        let name;
        const expenseDate = parseISO(exp.date);

        if (timeRange === 'Week') {
            name = format(expenseDate, 'EEE, MMM dd');
        } else if (timeRange === 'Month') {
            name = format(expenseDate, 'MMM dd');
        } else if (timeRange === 'Year' || timeRange === 'Previous Year') {
            name = format(expenseDate, 'MMM yyyy'); // Group by month and year
        } else if (timeRange === 'Custom') {
            // Group by day for shorter custom ranges (e.g., up to 90 days), else by month
            if (customStartDate && customEndDate && (customEndDate.getTime() - customStartDate.getTime()) / (1000 * 60 * 60 * 24) <= 90) {
                name = format(expenseDate, 'MMM dd');
            } else {
                name = format(expenseDate, 'MMM yyyy');
            }
        } else {
            name = format(expenseDate, 'yyyy-MM-dd'); // Fallback for any other case
        }

        const existing = acc.find(item => item.name === name);
        if (existing) {
            existing.total += exp.amount || 0;
        } else {
            acc.push({ name, total: exp.amount || 0 });
        }
        return acc;
    }, []).sort((a, b) => {
        // Robust date sorting for chart data labels
        const dateA = parseISO(a.name) || new Date(a.name);
        const dateB = parseISO(b.name) || new Date(b.name);
        return dateA.getTime() - dateB.getTime();
    });

    // Prepare chart data for incomes (similar logic to expenses)
    const incomeChartData = filteredIncomes.reduce((acc, inc) => {
        let name;
        const incomeDate = parseISO(inc.date);

        if (timeRange === 'Week') {
            name = format(incomeDate, 'EEE, MMM dd');
        } else if (timeRange === 'Month') {
            name = format(incomeDate, 'MMM dd');
        } else if (timeRange === 'Year' || timeRange === 'Previous Year') {
            name = format(incomeDate, 'MMM yyyy');
        } else if (timeRange === 'Custom') {
            if (customStartDate && customEndDate && (customEndDate.getTime() - customStartDate.getTime()) / (1000 * 60 * 60 * 24) <= 90) {
                name = format(incomeDate, 'MMM dd');
            } else {
                name = format(incomeDate, 'MMM yyyy');
            }
        } else {
            name = format(incomeDate, 'yyyy-MM-dd');
        }

        const existing = acc.find(item => item.name === name);
        if (existing) {
            existing.total += inc.amount || 0;
        } else {
            acc.push({ name, total: inc.amount || 0 });
        }
        return acc;
    }, []).sort((a, b) => {
        const dateA = parseISO(a.name) || new Date(a.name);
        const dateB = parseISO(b.name) || new Date(b.name);
        return dateA.getTime() - dateB.getTime();
    });


    // Category data for Pie Chart (still based on ALL expenses for overall breakdown)
    const categoryData = [
        { name: 'Food', value: safeExpenses.filter(e => e.category === 'food').reduce((sum, e) => sum + (e.amount || 0), 0), color: '#F94144', icon: <FaUtensils /> },
        { name: 'Housing', value: safeExpenses.filter(e => e.category === 'housing').reduce((sum, e) => sum + (e.amount || 0), 0), color: '#577590', icon: <FaHome /> },
        { name: 'Transport', value: safeExpenses.filter(e => e.category === 'transport').reduce((sum, e) => sum + (e.amount || 0), 0), color: '#F8961E', icon: <FaCar /> },
        { name: 'Entertainment', value: safeExpenses.filter(e => e.category === 'entertainment').reduce((sum, e) => sum + (e.amount || 0), 0), color: '#90BE6D', icon: <FaFilm /> },
        { name: 'Bills', value: safeExpenses.filter(e => e.category === 'bills').reduce((sum, e) => sum + (e.amount || 0), 0), color: '#3fdfbc', icon: <FaDollarSign /> },
        { name: 'Other', value: safeExpenses.filter(e => !['food', 'housing', 'transport', 'entertainment', 'bills'].includes(e.category)).reduce((sum, e) => sum + (e.amount || 0), 0), color: '#6c757d', icon: <FaListAlt /> },
    ];

    // Combine recent expenses and incomes, sort by date, and take the latest 5
    // Add a 'type' property to distinguish between income and expense
    const allTransactions = [
        ...safeExpenses.map(t => ({ ...t, type: 'expense' })),
        ...safeIncomes.map(t => ({ ...t, type: 'income' }))
    ];

    const recentTransactions = allTransactions
        .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
        .slice(0, 5);

    const handleBudgetUpdate = async () => {
        if (!isNaN(parseFloat(newBudget))) {
            try {
                await updateTotalMoney({ totalBudget: Number(newBudget) });
                await profile(); // Re-fetch user profile to get the updated budget from the backend
            } catch (error) {
                console.error('Error updating budget:', error);
            }
        }
        setIsEditingBudget(false);
    };

    const getLargestCategory = () => {
        const relevantCategories = categoryData.filter(cat => cat.value > 0);
        if (relevantCategories.length === 0) return 'N/A';
        const largest = relevantCategories.reduce((prev, current) =>
            (prev.value > current.value) ? prev : current
        );
        return largest.name;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="text-2xl font-semibold text-gray-700 animate-pulse">Loading financial data...</div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen text-gray-800">
            {/* Budget Section */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100 transform hover:scale-[1.005] transition-transform duration-300 ease-in-out">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-extrabold text-purple-700 flex items-center gap-3">
                        <FaDollarSign className="text-4xl text-purple-500" />
                        Budget Overview
                    </h1>
                    <button
                        onClick={() => {
                            setIsEditingBudget(!isEditingBudget);
                            if (!isEditingBudget) setNewBudget(auth.user?.totalBudget || 0);
                        }}
                        className="text-purple-600 hover:text-purple-800 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                        <FaEdit className="text-xl" />
                        <span className="font-medium">Edit Budget</span>
                    </button>
                </div>

                {isEditingBudget ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                        <label htmlFor="budget-input" className="sr-only">New Budget Amount</label>
                        <input
                            id="budget-input"
                            type="number"
                            value={newBudget}
                            onChange={(e) => setNewBudget(e.target.value)}
                            onBlur={handleBudgetUpdate}
                            onKeyPress={(e) => e.key === 'Enter' && handleBudgetUpdate()}
                            className="text-4xl font-bold border-b-4 border-purple-500 bg-gray-50 p-2 rounded-md outline-none w-full sm:w-60 text-center transition-all duration-300 focus:border-purple-700"
                            autoFocus
                            placeholder="Set your budget"
                        />
                        <button
                            onClick={handleBudgetUpdate}
                            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all duration-300 shadow-md hover:shadow-lg text-lg font-semibold"
                        >
                            Save
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4"> {/* Changed to 3 columns */}
                        <div className="bg-purple-50 p-6 rounded-2xl shadow-inner flex flex-col items-start justify-center">
                            <p className="text-lg text-purple-700 font-semibold mb-2">Total Budget</p>
                            <h2 className="text-5xl font-extrabold text-purple-600">
                                ${(auth.user?.totalBudget || 0).toLocaleString()}
                            </h2>
                        </div>
                        <div className={`p-6 rounded-2xl shadow-inner flex flex-col items-start justify-center
                            ${remainingBudget >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            <p className="text-lg font-semibold mb-2">Remaining Budget</p>
                            <h2 className="text-5xl font-extrabold">
                                ${remainingBudget.toLocaleString()}
                            </h2>
                        </div>
                        {/* New Total Income Card */}
                        <div className="bg-blue-50 p-6 rounded-2xl shadow-inner flex flex-col items-start justify-center">
                            <p className="text-lg text-blue-700 font-semibold mb-2">Total Income</p>
                            <h2 className="text-5xl font-extrabold text-blue-600">
                                ${totalOverallIncomes.toLocaleString()}
                            </h2>
                        </div>
                    </div>
                )}
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-500 to-blue-600 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between items-start transition-transform duration-300 hover:scale-[1.01]">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <FaChartLine className="text-3xl opacity-80" />
                        Total Spending
                    </h2>
                    <p className="text-5xl font-extrabold">${totalOverallExpenses.toLocaleString()}</p>
                    <p className="text-sm opacity-85 mt-2">Across all recorded expenses</p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-xl flex flex-col justify-between items-start transition-transform duration-300 hover:scale-[1.01]">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaArrowUp className="text-3xl text-green-500" />
                        Top Category
                    </h2>
                    <p className="text-4xl font-extrabold text-green-600">{getLargestCategory()}</p>
                    <p className="text-sm text-gray-500 mt-2">Your largest expense area</p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-xl flex flex-col justify-between items-start transition-transform duration-300 hover:scale-[1.01]">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaHome className="text-3xl text-blue-500" />
                        Average Monthly
                    </h2>
                    <p className="text-4xl font-extrabold text-blue-600">
                        {/* Calculate average based on ALL expenses for an overall average using distinct months */}
                        {(totalOverallExpenses / (new Set(safeExpenses.map(exp => format(parseISO(exp.date), 'yyyy-MM'))).size || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Average spending per month</p>
                </div>
            </div>

            {/* Main Chart Section - Spending Trends */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaChartLine className="text-purple-600" />
                        Spending Trends
                    </h2>
                    <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-full shadow-inner">
                        {['Week', 'Month', 'Year', 'Previous Year', 'Custom'].map((item) => (
                            <button
                                key={item}
                                onClick={() => {
                                    setTimeRange(item);
                                    if (item !== 'Custom') {
                                        setCustomStartDate(null);
                                        setCustomEndDate(null);
                                    }
                                }}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out
                                    ${item === timeRange
                                        ? 'bg-purple-600 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Date Picker Section for Spending Trends */}
                {timeRange === 'Custom' && (
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 p-4 bg-purple-50 rounded-xl shadow-inner">
                        <FaCalendarAlt className="text-purple-600 text-xl flex-shrink-0" />
                        <label htmlFor="start-date-expense" className="sr-only">Start Date</label>
                        <DatePicker
                            id="start-date-expense"
                            selected={customStartDate}
                            onChange={(date) => setCustomStartDate(date)}
                            selectsStart
                            startDate={customStartDate}
                            endDate={customEndDate}
                            placeholderText="Start Date"
                            className="w-full sm:w-auto p-2 border border-purple-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                            dateFormat="MMM dd, yyyy"
                        />
                        <span className="text-gray-600 font-medium">to</span>
                        <label htmlFor="end-date-expense" className="sr-only">End Date</label>
                        <DatePicker
                            id="end-date-expense"
                            selected={customEndDate}
                            onChange={(date) => setCustomEndDate(date)}
                            selectsEnd
                            startDate={customStartDate}
                            endDate={customEndDate}
                            minDate={customStartDate}
                            placeholderText="End Date"
                            className="w-full sm:w-auto p-2 border border-purple-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                            dateFormat="MMM dd, yyyy"
                        />
                    </div>
                )}

                {filteredExpenses.length > 0 ? (
                    <div className="h-72 sm:h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={expenseChartData}>
                                <defs>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    padding={{ left: 20, right: 20 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3', stroke: '#a1a1aa' }}
                                    contentStyle={{
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '12px',
                                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                                        padding: '12px',
                                        backdropFilter: 'blur(5px)'
                                    }}
                                    labelStyle={{ color: '#333', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#6366f1' }}
                                    formatter={(value) => `$${value.toLocaleString()}`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 1, stroke: '#fff' }}
                                    activeDot={{ r: 7, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-72 sm:h-96 flex items-center justify-center text-gray-500 text-lg">
                        No expenses recorded for the selected period.
                        {timeRange === 'Custom' && (!customStartDate || !customEndDate) && <p className="mt-2 text-sm">Please select a start and end date for your custom range.</p>}
                    </div>
                )}
            </div>

            {/* Main Chart Section - Income Trends (NEW SECTION) */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaMoneyBillWave className="text-blue-600" />
                        Income Trends
                    </h2>
                    {/* Time range buttons (re-using the same timeRange state for both charts) */}
                    <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-full shadow-inner">
                        {['Week', 'Month', 'Year', 'Previous Year', 'Custom'].map((item) => (
                            <button
                                key={`income-time-range-${item}`} // Unique key
                                onClick={() => {
                                    setTimeRange(item);
                                    if (item !== 'Custom') {
                                        setCustomStartDate(null);
                                        setCustomEndDate(null);
                                    }
                                }}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out
                                    ${item === timeRange
                                        ? 'bg-blue-600 text-white shadow-md' // Blue color for income charts
                                        : 'text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Date Picker Section for Income Trends */}
                {timeRange === 'Custom' && (
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 p-4 bg-blue-50 rounded-xl shadow-inner"> {/* Blue background for income date pickers */}
                        <FaCalendarAlt className="text-blue-600 text-xl flex-shrink-0" />
                        <label htmlFor="start-date-income" className="sr-only">Start Date</label>
                        <DatePicker
                            id="start-date-income"
                            selected={customStartDate}
                            onChange={(date) => setCustomStartDate(date)}
                            selectsStart
                            startDate={customStartDate}
                            endDate={customEndDate}
                            placeholderText="Start Date"
                            className="w-full sm:w-auto p-2 border border-blue-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            dateFormat="MMM dd, yyyy"
                        />
                        <span className="text-gray-600 font-medium">to</span>
                        <label htmlFor="end-date-income" className="sr-only">End Date</label>
                        <DatePicker
                            id="end-date-income"
                            selected={customEndDate}
                            onChange={(date) => setCustomEndDate(date)}
                            selectsEnd
                            startDate={customStartDate}
                            endDate={customEndDate}
                            minDate={customStartDate}
                            placeholderText="End Date"
                            className="w-full sm:w-auto p-2 border border-blue-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            dateFormat="MMM dd, yyyy"
                        />
                    </div>
                )}

                {filteredIncomes.length > 0 ? (
                    <div className="h-72 sm:h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={incomeChartData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} /> {/* Blue color for income line */}
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    padding={{ left: 20, right: 20 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3', stroke: '#a1a1aa' }}
                                    contentStyle={{
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '12px',
                                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                                        padding: '12px',
                                        backdropFilter: 'blur(5px)'
                                    }}
                                    labelStyle={{ color: '#333', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#2563eb' }}
                                    formatter={(value) => `$${value.toLocaleString()}`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#2563eb', strokeWidth: 1, stroke: '#fff' }}
                                    activeDot={{ r: 7, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-72 sm:h-96 flex items-center justify-center text-gray-500 text-lg">
                        No income recorded for the selected period.
                        {timeRange === 'Custom' && (!customStartDate || !customEndDate) && <p className="mt-2 text-sm">Please select a start and end date for your custom range.</p>}
                    </div>
                )}
            </div>


            {/* Bottom Section: Category Breakdown & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FaChartPie className="text-pink-500" />
                        Category Breakdown (Expenses)
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                        {totalOverallExpenses > 0 ? (
                            <div className="w-48 h-48 sm:w-56 sm:h-56 flex-shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData.filter(cat => cat.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={4}
                                            dataKey="value"
                                            isAnimationActive={true}
                                            label={({ percent }) =>
                                                `${(percent * 100).toFixed(0)}%`
                                            }
                                            labelLine={false}
                                            blendStroke
                                        >
                                            {categoryData.filter(cat => cat.value > 0).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} strokeWidth={2} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                borderRadius: '12px',
                                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                                                border: '1px solid #e0e0e0',
                                                padding: '12px',
                                                backdropFilter: 'blur(5px)'
                                            }}
                                            formatter={(value, name) => [`$${value.toLocaleString()}`, name]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="w-full text-center text-gray-500 text-lg">
                                No expenses to categorize.
                            </div>
                        )}

                        <div className="flex-1 w-full space-y-3">
                            {categoryData.map((category) => (
                                <div
                                    key={category.name}
                                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 shadow-sm"
                                >
                                    <div className="p-3 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: category.color }}>
                                        {React.cloneElement(category.icon, { className: 'text-2xl' })}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-lg text-gray-700">{category.name}</p>
                                        <p className="text-sm text-gray-500">${category.value.toLocaleString()}</p>
                                    </div>
                                    <span className="text-lg font-bold" style={{ color: category.color }}>
                                        {totalOverallExpenses > 0 ?
                                            `${((category.value / totalOverallExpenses) * 100).toFixed(1)}%` :
                                            '0.0%'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FaListAlt className="text-teal-500" />
                        Recent Transactions
                    </h3>
                    <div className="space-y-4">
                        {recentTransactions.length > 0 ? (
                            recentTransactions.map((transaction) => {
                                // Determine icon and color based on transaction type (expense or income)
                                const isExpense = transaction.type === 'expense';
                                const category = categoryData.find(c => c.name.toLowerCase() === transaction.category) || categoryData.find(c => c.name === 'Other');
                                const transactionColor = isExpense ? (category?.color || '#6c757d') : '#28a745'; // Green for income
                                const transactionIcon = isExpense ? (category?.icon || <FaDollarSign className="text-2xl" />) : <FaMoneyBillWave className="text-2xl" />;

                                return (
                                    <div
                                        key={transaction._id}
                                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 shadow-sm"
                                    >
                                        <div
                                            className="p-3 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                                            style={{ backgroundColor: transactionColor }}
                                        >
                                            {transactionIcon}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-lg text-gray-700 truncate">{transaction.title}</p>
                                            <p className="text-sm text-gray-500">
                                                {format(parseISO(transaction.date), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                        <span
                                            className="font-bold text-lg flex-shrink-0"
                                            style={{ color: transactionColor }}
                                        >
                                            {isExpense ? `-$${transaction.amount?.toLocaleString() || '0'}` : `+$${transaction.amount?.toLocaleString() || '0'}`}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center text-gray-500 text-lg py-10">
                                No recent transactions recorded.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;