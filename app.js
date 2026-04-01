"use strict";

const users = [];

const branchLabels = {
    eldoret: 'Reeves Branch Eldoret',
    kisumu: 'Reeves Branch Kisumu',
    mombasa: 'Reeves Branch Mombasa',
    nairobi: 'Reeves Branch Nairobi'
};

const inventory = [
    { id: 1, name: 'Steel Sheet A4', category: 'Raw Materials', quantity: 280, reorderPoint: 100, unitCost: 25.50 },
    { id: 2, name: 'Brake Component X1', category: 'Components', quantity: 48, reorderPoint: 50, unitCost: 45.00 },
    { id: 3, name: 'Engine Mount Standard', category: 'Finished Goods', quantity: 22, reorderPoint: 25, unitCost: 120.00 },
    { id: 4, name: 'Aluminum Rod 10mm', category: 'Raw Materials', quantity: 150, reorderPoint: 200, unitCost: 8.75 },
    { id: 5, name: 'Bearing Set B2', category: 'Components', quantity: 75, reorderPoint: 60, unitCost: 18.90 }
];

const transactions = [
    { date: '2026-03-30', type: 'receipt', product: 'Steel Sheet A4', quantity: 120, reference: 'REC-1001', user: 'John Mash' },
    { date: '2026-03-30', type: 'issue', product: 'Brake Component X1', quantity: 12, reference: 'ISS-2001', user: 'John Mash' },
    { date: '2026-03-29', type: 'transfer', product: 'Engine Mount Standard', quantity: 5, reference: 'TRF-3001', user: 'John Mash' }
];

let currentUser = null;
let currentLocation = null;

function getBranchLabel(value) {
    return branchLabels[value] || 'Unknown Location';
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');
}

function setActiveSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.classList.toggle('active', button.dataset.section === sectionId);
    });
    const section = document.getElementById(sectionId);
    if (section) section.classList.add('active');
}

function renderInventoryTable() {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;
    tbody.innerHTML = inventory.map(item => {
        const status = item.quantity <= item.reorderPoint ? 'Low Stock' : 'OK';
        return `
            <tr>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.quantity}</td>
                <td>${item.reorderPoint}</td>
                <td>$${item.unitCost.toFixed(2)}</td>
                <td>${status}</td>
                <td><button type="button">View</button></td>
            </tr>
        `;
    }).join('');
}

function populateTransactionProductOptions() {
    const select = document.getElementById('transactionProduct');
    if (!select) return;
    select.innerHTML = inventory.map(item => `<option value="${item.name}">${item.name}</option>`).join('');
}

function renderTransactionsTable() {
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;
    tbody.innerHTML = transactions.map(tx => `
        <tr>
            <td>${tx.date}</td>
            <td>${tx.type}</td>
            <td>${tx.product}</td>
            <td>${tx.quantity}</td>
            <td>${tx.reference}</td>
            <td>${tx.user}</td>
        </tr>
    `).join('');
}

function updateDashboardMetrics() {
    const totalProducts = inventory.length;
    const lowStockCount = inventory.filter(item => item.quantity <= item.reorderPoint).length;
    const recentTransactions = transactions.length;
    const pendingOrders = 4;

    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('lowStockItems').textContent = lowStockCount;
    document.getElementById('recentTransactions').textContent = recentTransactions;
    document.getElementById('pendingOrders').textContent = pendingOrders;

    const alertsList = document.getElementById('alertsList');
    if (!alertsList) return;
    if (lowStockCount === 0) {
        alertsList.innerHTML = '<div class="alert-card">All stock levels are healthy.</div>';
        return;
    }
    alertsList.innerHTML = inventory
        .filter(item => item.quantity <= item.reorderPoint)
        .map(item => `<div class="alert-card"><strong>${item.name}</strong> is low stock (${item.quantity} remaining).</div>`)
        .join('');
}

function loginUser(event) {
    event.preventDefault();
    const usernameValue = document.getElementById('username').value.trim().toLowerCase();
    const passwordValue = document.getElementById('password').value;
    const locationValue = document.getElementById('location').value;
    if (passwordValue !== 'mash001!') { alert('Wrong password.'); return; }
    const user = { fullName: usernameValue };

    
    if (!locationValue) {
        alert('Please select a Reeves branch.');
        return;
    }

    currentUser = user.fullName;
    currentLocation = getBranchLabel(locationValue);
    document.getElementById('currentUser').textContent = currentUser;
    document.getElementById('currentLocation').textContent = currentLocation;
    showScreen('dashboardScreen');
    setActiveSection('dashboard');
    updateDashboardMetrics();
    renderInventoryTable();
    renderTransactionsTable();
    populateTransactionProductOptions();
}

function logoutUser() {
    document.getElementById('loginForm').reset();
    showScreen('loginScreen');
}

function toggleTransactionForm(show) {
    const form = document.getElementById('transactionForm');
    if (form) form.style.display = show ? 'block' : 'none';
}

function addTransaction(event) {
    event.preventDefault();
    const type = document.getElementById('transactionType').value;
    const product = document.getElementById('transactionProduct').value;
    const quantity = Number(document.getElementById('transactionQuantity').value);
    const reference = document.getElementById('transactionReference').value || 'N/A';

    if (!type || !product || !quantity || quantity <= 0) {
        alert('Enter a valid transaction type, product, and quantity.');
        return;
    }

    transactions.unshift({
        date: new Date().toISOString().split('T')[0],
        type,
        product,
        quantity,
        reference,
        user: currentUser || 'John Mash'
    });

    renderTransactionsTable();
    updateDashboardMetrics();
    toggleTransactionForm(false);
    document.getElementById('newTransactionForm').reset();
    alert('Transaction created successfully.');
}

function generateInventoryReport() {
    const report = inventory.map(item => `${item.name}: ${item.quantity} in stock`).join('<br>');
    document.getElementById('reportOutput').innerHTML = `<h3>Inventory Report</h3><p>${report}</p>`;
}

function generateLowStockReport() {
    const lowStock = inventory.filter(item => item.quantity <= item.reorderPoint);
    if (!lowStock.length) {
        document.getElementById('reportOutput').innerHTML = '<h3>Low Stock Report</h3><p>No low stock items.</p>';
        return;
    }
    const report = lowStock.map(item => `${item.name}: ${item.quantity} remaining`).join('<br>');
    document.getElementById('reportOutput').innerHTML = `<h3>Low Stock Report</h3><p>${report}</p>`;
}

function generateTransactionReport() {
    const report = transactions.slice(0, 5).map(tx => `${tx.date} - ${tx.type} - ${tx.product} (${tx.quantity})`).join('<br>');
    document.getElementById('reportOutput').innerHTML = `<h3>Transaction Report</h3><p>${report}</p>`;
}

function showUserManagement() {
    document.getElementById('reportOutput').innerHTML = '<h3>User Management</h3><p>Feature coming soon.</p>';
}

function backupData() {
    const backup = {
        currentUser,
        currentLocation,
        inventory,
        transactions,
        timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'reeves_inventory_backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function setupListeners() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', loginUser);

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);

    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', () => setActiveSection(button.dataset.section));
    });

    const addTransactionBtn = document.getElementById('addTransactionBtn');
    if (addTransactionBtn) addTransactionBtn.addEventListener('click', () => toggleTransactionForm(true));

    const cancelTransaction = document.getElementById('cancelTransaction');
    if (cancelTransaction) cancelTransaction.addEventListener('click', () => toggleTransactionForm(false));

    const newTransactionForm = document.getElementById('newTransactionForm');
    if (newTransactionForm) newTransactionForm.addEventListener('submit', addTransaction);

    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) addProductBtn.addEventListener('click', () => alert('Product creation is not enabled in this demo.'));

    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotModal = document.getElementById('forgotPasswordModal');
    if (forgotPasswordLink && forgotModal) {
        forgotPasswordLink.addEventListener('click', event => {
            event.preventDefault();
            forgotModal.style.display = 'block';
        });
        document.querySelectorAll('.close-forgot, .cancel-forgot').forEach(element => {
            element.addEventListener('click', () => {
                forgotModal.style.display = 'none';
            });
        });
    }
}

window.generateInventoryReport = generateInventoryReport;
window.generateLowStockReport = generateLowStockReport;
window.generateTransactionReport = generateTransactionReport;
window.showUserManagement = showUserManagement;
window.backupData = backupData;

window.addEventListener('DOMContentLoaded', () => {
    setupListeners();
    populateTransactionProductOptions();
    renderInventoryTable();
    renderTransactionsTable();
    updateDashboardMetrics();
});

