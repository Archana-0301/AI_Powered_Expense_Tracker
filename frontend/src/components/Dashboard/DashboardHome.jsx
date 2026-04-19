import { useState } from 'react';
import TransactionForm from '../Transactions/TransactionForm';
import { generateMonthlyPDF } from '../../utils/pdfExport';

export default function DashboardHome() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [transactions, setTransactions] = useState([
    { id: 1, desc: 'Coffee at Starbucks', amount: -450, category: 'Food & Dining', type: 'EXPENSE', date: '2026-04-18' },
    { id: 2, desc: 'Monthly Salary', amount: 75000, category: 'Salary', type: 'INCOME', date: '2026-04-01' },
    { id: 3, desc: 'Uber to Office', amount: -250, category: 'Transportation', type: 'EXPENSE', date: '2026-04-17' },
    { id: 4, desc: 'Grocery Shopping', amount: -3500, category: 'Food & Dining', type: 'EXPENSE', date: '2026-04-16' },
    { id: 5, desc: 'Netflix Subscription', amount: -649, category: 'Entertainment', type: 'EXPENSE', date: '2026-04-15' },
  ]);

  // Filter transactions by selected month and year
  const filteredTransactions = transactions.filter(t => {
    const txnDate = new Date(t.date);
    return txnDate.getMonth() + 1 === selectedMonth &&
           txnDate.getFullYear() === selectedYear;
  });

  // Calculate stats from filtered transactions
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = Math.abs(filteredTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0));

  const savings = totalIncome - totalExpense;

  // Category breakdown for filtered transactions
  const categoryBreakdown = filteredTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {});

  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });

  const handleTransactionAdded = (newTransaction) => {
    const amount = newTransaction.type === 'EXPENSE' ? -newTransaction.amount : newTransaction.amount;
    setTransactions([
      {
        id: Date.now(),
        desc: newTransaction.description,
        amount,
        category: newTransaction.category,
        type: newTransaction.type,
        date: newTransaction.transactionDate
      },
      ...transactions
    ]);
  };

  const handleDeleteTransaction = (id) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  // Generate month options for dropdown
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate year options
  const years = [2024, 2025, 2026, 2027];

  // Handle PDF Download
  const handleDownloadPDF = () => {
    try {
      console.log('Starting PDF generation...');

      const pdfData = {
        transactions: filteredTransactions,
        totalIncome,
        totalExpense,
        savings,
        categoryBreakdown
      };

      console.log('PDF Data:', pdfData);

      const fileName = generateMonthlyPDF(pdfData, selectedMonth, selectedYear);

      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce';
      successDiv.innerHTML = `✓ PDF Downloaded: ${fileName}`;
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
    } catch (error) {
      console.error('PDF Download Error:', error);

      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorDiv.innerHTML = `✗ Error: ${error.message}`;
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Month/Year Filter */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Personal Finance Tracker</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Month Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="input-field py-2"
            >
              {months.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>

            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="input-field py-2"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center gap-2 font-medium"
              title="Download monthly report as PDF"
            >
              <span>📄</span>
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.reload();
              }}
              className="text-sm px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Current Month Display */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{monthName} {selectedYear}</h2>
              <p className="text-indigo-100 mt-1">
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} this month
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-blue-900">Demo Mode Active</h3>
              <p className="text-sm text-blue-700 mt-1">
                Try adding transactions! Filter by month/year. All amounts in ₹ (Rupees). Real backend will save to database.
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Form */}
        <TransactionForm onTransactionAdded={handleTransactionAdded} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Income"
            value={`₹${totalIncome.toLocaleString('en-IN')}`}
            icon="💰"
            color="bg-green-500"
          />
          <StatCard
            title="Total Expense"
            value={`₹${totalExpense.toLocaleString('en-IN')}`}
            icon="💸"
            color="bg-red-500"
          />
          <StatCard
            title="Savings"
            value={`₹${savings.toLocaleString('en-IN')}`}
            icon="🏦"
            color={savings >= 0 ? 'bg-blue-500' : 'bg-orange-500'}
          />
          <StatCard
            title="Transactions"
            value={filteredTransactions.length}
            icon="📊"
            color="bg-purple-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Expense Breakdown - {monthName}</h3>
            {Object.keys(categoryBreakdown).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(categoryBreakdown)
                  .sort((a, b) => b[1] - a[1]) // Sort by amount descending
                  .map(([category, amount]) => {
                    const percentage = ((amount / totalExpense) * 100).toFixed(1);
                    return (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{category}</span>
                          <span className="text-gray-600">₹{amount.toLocaleString('en-IN')} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-4xl mb-2">📭</p>
                <p>No expenses in {monthName} {selectedYear}</p>
                <p className="text-sm mt-1">Add transactions above</p>
              </div>
            )}
          </div>

          {/* Smart Insights */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💡</span>
              <h3 className="text-xl font-bold">Smart Insights - {monthName}</h3>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              {filteredTransactions.length > 0 ? (
                <p className="text-gray-700 leading-relaxed">
                  <strong>Monthly Summary:</strong> You had {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} in {monthName}.
                  {Object.keys(categoryBreakdown).length > 0 && (
                    <>
                      <br/><br/>
                      <strong>Top Expense:</strong> Your {Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0][0]} expenses are ₹{Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0][1].toLocaleString('en-IN')} ({((Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0][1] / totalExpense) * 100).toFixed(0)}% of spending).
                    </>
                  )}
                  {totalIncome > 0 && (
                    <>
                      <br/><br/>
                      <strong>Savings Rate:</strong> You're saving {((savings / totalIncome) * 100).toFixed(1)}% of your income {savings > 0 ? '- excellent!' : '- consider reducing expenses.'}
                    </>
                  )}
                </p>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No data for {monthName} {selectedYear}. Add transactions to see insights!
                </p>
              )}
            </div>
            <div className="mt-4 text-xs text-gray-500">
              🤖 Powered by AI-based transaction analysis
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Transactions - {monthName} {selectedYear}</h3>
            {filteredTransactions.length > 0 && (
              <span className="text-sm text-gray-500">{filteredTransactions.length} total</span>
            )}
          </div>
          <div className="space-y-2">
            {filteredTransactions.length > 0 ? (
              filteredTransactions
                .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date descending
                .map((txn) => (
                  <div key={txn.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition group">
                    <div className="flex-1">
                      <div className="font-medium">{txn.desc}</div>
                      <div className="text-xs text-gray-500">
                        {txn.category} • {new Date(txn.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`font-semibold text-lg ${txn.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString('en-IN')}
                      </div>
                      <button
                        onClick={() => handleDeleteTransaction(txn.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition text-xl"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-5xl mb-3">📝</p>
                <p className="text-lg font-medium">No transactions in {monthName} {selectedYear}</p>
                <p className="text-sm mt-2">Add your first transaction above or select a different month</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
