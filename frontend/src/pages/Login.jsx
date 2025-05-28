import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const Login = () => {
    const { login } = useAuthStore();
    const [formData, setFormData] = useState({
        email : "",
        password : ""
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Add login logic here
        login(formData)
        console.log(formData);
        


    };

    return (
        <div className="flex items-center justify-center h-screen bg-[#D1D0FB]">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-10 rounded-lg shadow-md w-full max-w-md space-y-6"
            >
                <div className="flex flex-col">
                    <label htmlFor="email" className="text-sm font-semibold mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="password" className="text-sm font-semibold mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        required
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                </div>

                <div className="text-right">
                    <a href="#" className="text-sm text-blue-600 hover:underline">
                        Forgot password?
                    </a>
                </div>

                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
                >
                    Log in
                </button>

                <div className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link to="/register" className="text-blue-600 hover:underline">
                        Sign up
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Login;
