import Expense from "./models/expenses.models.js";

const categories = [
  { name: "food", titles: ["Pizza", "Burger", "Grocery"] },
  { name: "housing", titles: ["Rent", "Electricity Bill", "Water Bill"] },
  { name: "transport", titles: ["Bus Ticket", "Fuel", "Uber"] },
  { name: "entertainment", titles: ["Netflix", "Movie", "Concert"] },
];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomAmount = () => Math.floor(Math.random() * 1000) + 10;

// 🔽 Random date between Jan 1, 2023 and Dec 31, 2025
const getRandomDateBetween2023And2025 = () => {
  const start = new Date("2023-01-01").getTime();
  const end = new Date("2025-12-31").getTime();
  const randomTime = Math.floor(Math.random() * (end - start)) + start;
  return new Date(randomTime);
};

export const generateExpenses = async (count = 100) => {
  const expenses = Array.from({ length: count }, () => {
    const categoryObj = getRandomElement(categories);
    const title = `${
      categoryObj.name.charAt(0).toUpperCase() + categoryObj.name.slice(1)
    } ${getRandomElement(categoryObj.titles)}`;
    const amount = getRandomAmount();
    const date = getRandomDateBetween2023And2025().toISOString();

    return {
      title,
      amount,
      category: categoryObj.name,
      date,
      userId: "683459cf7feaaf60b9850015",
    };
  });

  try {
    await Expense.insertMany(expenses);
    console.log(`${count} random expenses added to the database.`);
  } catch (err) {
    console.error("Error inserting expenses:", err);
  }
};
