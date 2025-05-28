import express from "express";
import { addMoreMoney, createExpenses, deleteExpenses, getExpenses, updateExpenses,addIncome, getIncomes } from "../controllers/expenses.controller.js";
import { routeProtection } from "../middleware/routeProtection.js";

const expensesRoute = express.Router();


expensesRoute.get("/getExpenses",routeProtection,getExpenses)
expensesRoute.post("/createExpenses",routeProtection,createExpenses)
expensesRoute.post("/addMoreMoney",routeProtection,addMoreMoney)
expensesRoute.put("/updateExpenses",routeProtection,updateExpenses)
expensesRoute.delete("/deleteExpenses", routeProtection,deleteExpenses)
expensesRoute.post("/addIncome", routeProtection,addIncome )
expensesRoute.get("/getIncomes", routeProtection,getIncomes )

export default expensesRoute
