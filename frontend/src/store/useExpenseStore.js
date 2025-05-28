import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";

const useExpenseStore = create((set) => ({
  expenses: null,
  isLoadings: false,
  error: null,
  incomes : null , 

  addExpense: async (data) => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.post("/expenses/createExpenses", data);
      set({ isLoading: false });
    } catch (error) {
      set({ error: error });
    }
  },

  getAllExpenses: async () => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.get("/expenses/getExpenses");
      set({ expenses: res.data.data, isLoading: false });
    } catch (error) {
      set({ error: Error });
    }
  },

  // Set total money
  updateTotalMoney : async ({totalBudget,remainingBudget})=>{
    try {
        set({isLoading : true})
        const res = await axiosInstance.post("/users/updateProfile", {totalBudget : totalBudget})
        set({isLoading : false})
    } catch (error) {
        set({error : error})
    }
  },

  // Remove an expense
  removeExpense: (id) =>
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    })),

  // Update an expense
  updateExpense: (updatedExpense) =>
    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === updatedExpense.id ? updatedExpense : e
      ),
    })),


    addIncome : async(data)=>{
      try {
        set({isLoading : true})
        const res = await axiosInstance.post("/expenses/addIncome",data)
        set({isLoading : false})
      } catch (error) {
        set({error : error})
      }
    },

    getIncomes : async ()=>{
      try {
        set({isLoading : true})
        const res = await axiosInstance.get("/expenses/getIncomes")
        set({isLoading : false , incomes : res.data.allIncomes})
      } catch (error) {
        set({error : error})
      }
    }
}));

export default useExpenseStore;
