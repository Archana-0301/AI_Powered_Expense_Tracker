import { useState, useEffect } from 'react';

export default function TransactionForm({ onTransactionAdded }) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    transactionDate: new Date().toISOString().split('T')[0],
    type: 'EXPENSE', // AI will auto-detect
    category: '',
  });
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Category options based on type
  const categories = {
    EXPENSE: [
      'Food & Dining',
      'Transportation',
      'Shopping',
      'Entertainment',
      'Healthcare',
      'Education',
      'Bills & Utilities',
      'Travel',
      'Personal Care',
      'Gifts & Donations',
      'Other Expense'
    ],
    INCOME: [
      'Salary',
      'Freelance',
      'Investment',
      'Rental Income',
      'Business',
      'Bonus',
      'Other Income'
    ]
  };

  // AI Classification - runs when description changes
  useEffect(() => {
    if (formData.description.length > 2) {
      const aiClassification = classifyTransaction(formData.description);
      setAiResult(aiClassification);

      // Auto-update type and category based on AI
      setFormData(prev => ({
        ...prev,
        type: aiClassification.type,
        category: aiClassification.category
      }));
    } else {
      setAiResult(null);
    }
  }, [formData.description]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      // Add to list if callback provided
      if (onTransactionAdded) {
        onTransactionAdded({
          ...formData,
          amount: parseFloat(formData.amount),
          aiClassified: !!aiResult,
          confidence: aiResult?.confidence || 0.5
        });
      }

      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
      successDiv.innerHTML = '✓ Transaction Added!';
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 2000);

      // Reset form
      setFormData({
        description: '',
        amount: '',
        transactionDate: new Date().toISOString().split('T')[0],
        type: 'EXPENSE',
        category: '',
      });
      setAiResult(null);
      setLoading(false);
    }, 500);
  };

  // Simple AI classification logic for demo
  const classifyTransaction = (desc) => {
    const lower = desc.toLowerCase();
    let type = 'EXPENSE';
    let category = 'Other Expense';
    let confidence = 0.75;

    // Income keywords
    if (lower.includes('salary') || lower.includes('paycheck') || lower.includes('wage')) {
      type = 'INCOME';
      category = 'Salary';
      confidence = 0.95;
    } else if (lower.includes('freelance') || lower.includes('gig') || lower.includes('contract work')) {
      type = 'INCOME';
      category = 'Freelance';
      confidence = 0.92;
    } else if (lower.includes('bonus') || lower.includes('incentive')) {
      type = 'INCOME';
      category = 'Bonus';
      confidence = 0.90;
    } else if (lower.includes('investment') || lower.includes('dividend') || lower.includes('stock')) {
      type = 'INCOME';
      category = 'Investment';
      confidence = 0.88;
    } else if (lower.includes('rent received') || lower.includes('rental income')) {
      type = 'INCOME';
      category = 'Rental Income';
      confidence = 0.93;
    } else if (lower.includes('profit') || lower.includes('business income') ||
               lower.includes('business profit') || lower.includes('revenue') ||
               lower.includes('business revenue')) {
      type = 'INCOME';
      category = 'Business';
      confidence = 0.91;
    }
    // Expense keywords
    else if (lower.includes('coffee') || lower.includes('food') || lower.includes('restaurant') ||
             lower.includes('lunch') || lower.includes('dinner') || lower.includes('breakfast') ||
             lower.includes('starbucks') || lower.includes('mcdonald')) {
      category = 'Food & Dining';
      confidence = 0.92;
    } else if (lower.includes('uber') || lower.includes('taxi') || lower.includes('gas') ||
               lower.includes('fuel') || lower.includes('bus') || lower.includes('metro') ||
               lower.includes('ola') || lower.includes('rapido')) {
      category = 'Transportation';
      confidence = 0.88;
    } else if (lower.includes('shopping') || lower.includes('clothes') || lower.includes('amazon') ||
               lower.includes('dress') || lower.includes('shoes') || lower.includes('flipkart')) {
      category = 'Shopping';
      confidence = 0.85;
    } else if (lower.includes('movie') || lower.includes('netflix') || lower.includes('entertainment') ||
               lower.includes('concert') || lower.includes('game') || lower.includes('hotstar')) {
      category = 'Entertainment';
      confidence = 0.90;
    } else if (lower.includes('rent') || lower.includes('electricity') || lower.includes('water') ||
               lower.includes('bill') || lower.includes('internet') || lower.includes('phone') ||
               lower.includes('broadband')) {
      category = 'Bills & Utilities';
      confidence = 0.87;
    } else if (lower.includes('doctor') || lower.includes('hospital') || lower.includes('medicine') ||
               lower.includes('pharmacy') || lower.includes('medical')) {
      category = 'Healthcare';
      confidence = 0.89;
    } else if (lower.includes('book') || lower.includes('course') || lower.includes('class') ||
               lower.includes('tuition') || lower.includes('udemy')) {
      category = 'Education';
      confidence = 0.86;
    } else if (lower.includes('flight') || lower.includes('hotel') || lower.includes('vacation') ||
               lower.includes('trip')) {
      category = 'Travel';
      confidence = 0.87;
    }

    return { type, category, confidence };
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Add Transaction</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., coffee at starbucks, monthly salary, ola ride"
            required
          />

          {/* AI Classification Result */}
          {aiResult && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-green-600 font-medium">🤖 Auto-Detected:</span>
              <span className={`px-2 py-1 rounded font-medium ${
                aiResult.type === 'INCOME'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {aiResult.type}
              </span>
              <span className="text-gray-600">→</span>
              <span className="text-gray-700 font-medium">{aiResult.category}</span>
              <span className="text-gray-500 text-xs">({Math.round(aiResult.confidence * 100)}% confident)</span>
            </div>
          )}
        </div>

        {/* Type and Category Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type * {aiResult && <span className="text-xs text-green-600">(Auto-selected)</span>}
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="EXPENSE">💸 Expense</option>
              <option value="INCOME">💰 Income</option>
            </select>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category * {aiResult && <span className="text-xs text-green-600">(Auto-selected)</span>}
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select category</option>
              {categories[formData.type].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount and Date Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="input-field pl-8"
                placeholder="500.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              name="transactionDate"
              value={formData.transactionDate}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Adding Transaction...
            </>
          ) : (
            <>
              {formData.type === 'INCOME' ? '💰' : '💸'} Add Transaction
            </>
          )}
        </button>
      </form>

      {/* Examples */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 text-sm">
        <h4 className="font-semibold text-blue-900 mb-3">💡 Try These Examples (Smart auto-classification):</h4>
        <div className="grid md:grid-cols-2 gap-3 text-blue-700">
          <div>
            <div className="font-medium text-blue-900 mb-2">💸 Expenses:</div>
            <div className="space-y-1">
              <div>• "coffee at starbucks" → Food & Dining</div>
              <div>• "ola to office" → Transportation</div>
              <div>• "netflix subscription" → Entertainment</div>
              <div>• "electricity bill" → Bills & Utilities</div>
              <div>• "medicines" → Healthcare</div>
            </div>
          </div>
          <div>
            <div className="font-medium text-blue-900 mb-2">💰 Income:</div>
            <div className="space-y-1">
              <div>• "monthly salary" → Salary</div>
              <div>• "freelance payment" → Freelance</div>
              <div>• "stock dividend" → Investment</div>
              <div>• "bonus payment" → Bonus</div>
              <div>• "rental income" → Rental Income</div>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-blue-600">
          ⚡ Type description and watch smart detection in real-time!
          <br />
          ✏️ You can change Type or Category if needed
        </div>
      </div>
    </div>
  );
}
