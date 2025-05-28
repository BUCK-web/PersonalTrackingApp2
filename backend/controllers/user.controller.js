import bcrypt from "bcryptjs";
import User from "../models/user.models.js";
import { generateToken } from "../config/generateToken.config.js";
import Expense from "../models/expenses.models.js";

const register = async (req, res) => {
  try {
    const { name, email, profilePicture, password } = req.body;
    const findOneUser = await User.findOne({ email });
    if (!name || !email || !password) {
      res.status(401).json({ success: false, Message: "All fields required" });
    }

    if (findOneUser) {
      res
        .status(404)
        .json({ success: false, Message: "User already found in the DB" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      name: name,
      email: email,
      profilePicture: profilePicture,
      password: hashPassword,
    });

    if (newUser) {
      generateToken(newUser, res);
      newUser.save();
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profilePic: newUser.profilePicture,
        totalMoney: newUser.totalMoney,
        message: "User created successfully",
        success: true,
      });
    } else {
      res.status(404).json({
        message: "User not created",
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Internal Server Error",
      success: false,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const findOneUser = await User.findOne({ email });
    if (!email || !password) {
      res
        .status(404)
        .json({ success: false, message: "All fields are required" });
    }

    if (!findOneUser) {
      return res.status(400).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    const isPassword = await bcrypt.compare(password, findOneUser.password);
    if (!isPassword) {
      return res.status(400).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    generateToken(findOneUser._id, res);

    res.status(200).json({
      _id: findOneUser._id,
      fullName: findOneUser.fullName,
      email: findOneUser.email,
      profilePic: findOneUser.profilePic,
      totalMoney: findOneUser.totalMoney,
      message: "Logged in successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

const profile = (req, res) => {
  try {
    res
      .status(200)
      .json({
        success: true,
        Message: "Logged in successfully",
        user: req.user,
      });
  } catch (error) {
    res.status(500).json(error);
  }
};

const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res
      .status(200)
      .json({ success: true, Message: "Logged out in successfully" });
  } catch (error) {
    res.status(500).json(error);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { totalBudget } = req.body;

    if (totalBudget === undefined) {
      return res.status(400).json({ success: false, message: "Total budget is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Fetch user's expenses
    const expenses = await Expense.find({ userId : req.user._id });
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const remainingBudget = totalBudget - totalExpenses;

    console.log(expenses,req.user._id);
    

    // Update user
    user.totalBudget = totalBudget;
    user.remainingBudget = remainingBudget;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export { register, login, profile, logout, updateProfile };
