import Expense from "../models/expenses.models.js";
import Income from "../models/income.modles.js";
import User from "../models/user.models.js";

const getExpenses = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ success: false, message: "Please sign in or log in" });
    }

    const getAllExpenseByUser = await Expense.find({ userId: req.user._id });

    res.status(200).json({ success: true, data: getAllExpenseByUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const addMoreMoney = async (req, res) => {
  try {
    const { totalMoney } = req.body;

    if (typeof totalMoney !== "number" || totalMoney <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a valid amount" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.totalMoney += totalMoney;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Money added successfully",
      data: { totalMoney: user.totalMoney },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createExpenses = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    if (!title || !amount || !category || !date) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.remainingBudget < amount) {
      return res.status(401).json({
        success: false,
        message: "Insufficient funds",
      });
    }

    // Save the new expense
    const newExpense = new Expense({
      title,
      amount,
      category,
      date,
      userId: req.user._id,
    });

    user.remainingBudget -= amount;
    await user.save();
    await newExpense.save();

    res.status(201).json({
      success: true,
      message: "Created expense and updated total money",
      data: newExpense,
      totalBudget: user.totalBudget,
      remainingBudget: user.remainingBudget,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateExpenses = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { title, amount, category, date },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }

    res.status(200).json({
      success: true,
      message: `Updated expense ${req.params.id}`,
      data: updatedExpense,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteExpenses = async (req, res) => {
  try {
    const deleteExpenses = await Expense.findByIdAndDelete(req.params.id);
    if (!deleteExpenses) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not Deleted" });
    }
    res
      .status(200)
      .json({ success: true, message: `Deleted expense ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addIncome = async (req, res) => {
  try {
    const { title, amount, date } = req.body;
    const userId = req.user._id;

    // Ensure amount is a number
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return res
        .status(400)
        .json({ message: "Amount must be a valid number." });
    }

    // Find user and check if exists
    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: "User not found." });
    }

    // Create new income
    const newIncome = new Income({
      title,
      amount: numericAmount,
      date,
      userId,
    });

    // Update user's total budget
    userData.totalBudget = (userData.totalBudget || 0) + numericAmount;

    // Save both
    await newIncome.save();
    await userData.save();

    res.status(200).json({
      message: "Income Saved Successfully",
      userData,
      IncomeData: newIncome,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Internal Server Error",
    });
  }
};

const getIncomes = async (req,res)=>{
  try {
    const userId = req.user._id
    const allIncomes =await Income.find({userId : userId})
    res.status(200).json({
      allIncomes,
      message : "All Incomes are here"
    })
  } catch (error) {
    res.status(500).json({error : error.message})
  }
}

export {
  createExpenses,
  addIncome,
  getExpenses,
  updateExpenses,
  deleteExpenses,
  addMoreMoney,
  getIncomes,
};
