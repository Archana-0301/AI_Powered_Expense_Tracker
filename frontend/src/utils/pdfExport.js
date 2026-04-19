import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateMonthlyPDF = (data, month, year) => {
  try {
    const { transactions, totalIncome, totalExpense, savings, categoryBreakdown } = data;

    const doc = new jsPDF();
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

    // Title
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229);
    doc.text('Finance Tracker Report', 14, 20);

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`${monthName} ${year}`, 14, 28);

    // Add generation date
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 34);

    // Summary Box
    doc.setFillColor(249, 250, 251);
    doc.rect(14, 40, 182, 35, 'F');

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('Monthly Summary', 18, 48);

    doc.setFontSize(10);
    doc.setTextColor(22, 163, 74);
    doc.text('Total Income:', 18, 56);
    doc.text(`Rs ${totalIncome.toLocaleString('en-IN')}`, 70, 56);

    doc.setTextColor(220, 38, 38);
    doc.text('Total Expense:', 18, 63);
    doc.text(`Rs ${totalExpense.toLocaleString('en-IN')}`, 70, 63);

    doc.setTextColor(59, 130, 246);
    doc.text('Savings:', 18, 70);
    doc.text(`Rs ${savings.toLocaleString('en-IN')}`, 70, 70);

    doc.setTextColor(147, 51, 234);
    doc.text('Transactions:', 120, 56);
    doc.text(`${transactions.length}`, 170, 56);

    // Savings Rate
    const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0;
    doc.setTextColor(0, 0, 0);
    doc.text('Savings Rate:', 120, 63);
    doc.text(`${savingsRate}%`, 170, 63);

    // Category Breakdown
    if (Object.keys(categoryBreakdown).length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Expense Breakdown by Category', 14, 85);

      const categoryData = Object.entries(categoryBreakdown)
        .sort((a, b) => b[1] - a[1])
        .map(([category, amount]) => [
          category,
          `Rs ${amount.toLocaleString('en-IN')}`,
          `${((amount / totalExpense) * 100).toFixed(1)}%`
        ]);

      autoTable(doc, {
        startY: 90,
        head: [['Category', 'Amount', 'Percentage']],
        body: categoryData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 60, halign: 'right' },
          2: { cellWidth: 40, halign: 'right' }
        }
      });
    }

    // Transactions List
    const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 95;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('All Transactions', 14, startY);

    if (transactions.length > 0) {
      const transactionData = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(txn => [
          new Date(txn.date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short'
          }),
          txn.desc,
          txn.category,
          txn.type === 'INCOME' ? 'Income' : 'Expense',
          `Rs ${Math.abs(txn.amount).toLocaleString('en-IN')}`
        ]);

      autoTable(doc, {
        startY: startY + 5,
        head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
        body: transactionData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 60 },
          2: { cellWidth: 45 },
          3: { cellWidth: 25 },
          4: { cellWidth: 35, halign: 'right' }
        }
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('No transactions for this month', 14, startY + 10);
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount} | AI-Powered Finance Tracker`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    const fileName = `Finance_Report_${monthName}_${year}.pdf`;
    doc.save(fileName);

    console.log('PDF generated successfully:', fileName);
    return fileName;

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF: ' + error.message);
    throw error;
  }
};
