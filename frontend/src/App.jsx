import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Expenses from "./pages/Expenses.jsx";
import Addincome from "./pages/Addincome.jsx";
import Profile from "./pages/Profile.jsx";
import SideOne from "./components/SideOne.jsx";
import { useAuthStore } from "./store/useAuthStore.js";

// Layout component for authenticated routes
const DashboardLayout = () => {
  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <div style={{ width: "30vw", backgroundColor: "#f4f4f4" }}>
        <SideOne />
      </div>
      <div style={{ width: "70vw", overflowY: "auto", padding: "1rem" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/add-income" element={<Addincome />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  const { auth, profile } = useAuthStore();
  useEffect(() => {
    profile()
  }, [])

  return (
    <Router>
      <Routes>
        {/* Redirect logged-in users away from login/register */}
        <Route
          path="/login"
          element={!auth ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/register"
          element={!auth ? <Register /> : <Navigate to="/" replace />}
        />

        {/* Authenticated Routes */}
        <Route
          path="/*"
          element={auth ? <DashboardLayout /> : <Navigate to="/register" replace />}
        />
      </Routes>
    </Router>
  );
};

export default App;
