// script.js - Enhanced JavaScript for Coaching Center Management System

// Global variables
let currentPage = 1;
const itemsPerPage = 10;
let allStudents = [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadStudentStats();
    setupFormValidation();
    setupSearchFunctionality();
    setupExportButtons();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.card, .stat-box');
    cards.forEach((card, index) => {
        card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
        card.style.opacity = '0';
    });

    // Add loading animation
    addLoadingAnimation();
}

// Animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .loading {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid rgba(0,0,0,.1);
        border-radius: 50%;
        border-top-color: #667eea;
        animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Add loading animation to buttons
function addLoadingAnimation() {
    const buttons = document.querySelectorAll('.btn, .btn-submit, .delete-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.tagName === 'BUTTON' || this.classList.contains('btn')) {
                const originalText = this.innerHTML;
                this.innerHTML = '<span class="loading"></span> Loading...';
                setTimeout(() => {
                    this.innerHTML = originalText;
                }, 1000);
            }
        });
    });
}

// Load student statistics from database via AJAX
function loadStudentStats() {
    fetch('getStudentStats')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateStatistics(data);
            }
        })
        .catch(error => console.log('Stats loading error:', error));
}

// Update statistics display
function updateStatistics(data) {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 3) {
        statNumbers[0].textContent = data.totalStudents || '0';
        statNumbers[1].textContent = data.totalCourses || '10+';
        statNumbers[2].textContent = data.totalFaculty || '20+';
    }
}

// Form validation setup
function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(form)) {
                e.preventDefault();
            }
        });
    });
}

// Validate any form
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            showFieldError(input, 'This field is required');
            isValid = false;
        } else {
            clearFieldError(input);
        }
        
        // Email validation
        if (input.type === 'email' && input.value) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(input.value)) {
                showFieldError(input, 'Please enter a valid email address');
                isValid = false;
            }
        }
        
        // Phone validation
        if (input.type === 'tel' && input.value) {
            const phonePattern = /^\d{10}$/;
            if (!phonePattern.test(input.value)) {
                showFieldError(input, 'Please enter a valid 10-digit phone number');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

// Show field error message
function showFieldError(input, message) {
    const formGroup = input.closest('.form-group');
    let errorDiv = formGroup.querySelector('.error-message');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = 'color: #dc3545; font-size: 12px; margin-top: 5px;';
        formGroup.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    input.style.borderColor = '#dc3545';
}

// Clear field error
function clearFieldError(input) {
    const formGroup = input.closest('.form-group');
    const errorDiv = formGroup.querySelector('.error-message');
    
    if (errorDiv) {
        errorDiv.remove();
    }
    input.style.borderColor = '#e0e0e0';
}

// Setup search functionality for student table
function setupSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            filterTable(this.value);
        });
    }
}

// Filter table rows based on search term
function filterTable(searchTerm) {
    const table = document.querySelector('table tbody');
    if (!table) return;
    
    const rows = table.querySelectorAll('tr');
    searchTerm = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Setup export functionality
function setupExportButtons() {
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }
    
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', printTable);
    }
}

// Export table to CSV
function exportToCSV() {
    const table = document.querySelector('table');
    if (!table) return;
    
    let csv = [];
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        const rowData = [];
        const cols = row.querySelectorAll('td, th');
        
        cols.forEach(col => {
            let text = col.textContent;
            // Remove delete button text
            if (text === 'Delete') text = '';
            rowData.push(text);
        });
        
        csv.push(rowData.join(','));
    });
    
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('Export completed successfully!', 'success');
}

// Print table
function printTable() {
    const table = document.querySelector('table');
    if (!table) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Student List Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    h2 { color: #333; }
                </style>
            </head>
            <body>
                <h2>Coaching Center - Student Report</h2>
                <p>Generated on: ${new Date().toLocaleString()}</p>
                ${table.outerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add slide animations
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(animationStyles);

// Real-time form preview
function setupFormPreview() {
    const previewDiv = document.getElementById('livePreview');
    if (!previewDiv) return;
    
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            updatePreview();
        });
    });
}

function updatePreview() {
    const previewDiv = document.getElementById('livePreview');
    if (!previewDiv) return;
    
    const name = document.querySelector('input[name="name"]')?.value || 'Not provided';
    const email = document.querySelector('input[name="email"]')?.value || 'Not provided';
    const course = document.querySelector('select[name="course"]')?.value || 'Not selected';
    
    previewDiv.innerHTML = `
        <h4>Preview:</h4>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Course:</strong> ${course}</p>
    `;
}

// Pagination for large datasets
function setupPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationDiv = document.getElementById('pagination');
    
    if (!paginationDiv) return;
    
    let paginationHTML = '<div class="pagination-controls">';
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button onclick="goToPage(${i})" class="page-btn ${i === currentPage ? 'active' : ''}">${i}</button>`;
    }
    paginationHTML += '</div>';
    paginationDiv.innerHTML = paginationHTML;
}

function goToPage(page) {
    currentPage = page;
    loadPageData();
}

function loadPageData() {
    // Implement data loading based on current page
    console.log(`Loading page ${currentPage}`);
}

// Confirm delete with better UX
function confirmDelete(studentName) {
    return confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`);
}

// Tooltip functionality
function addTooltips() {
    const elements = document.querySelectorAll('[data-tooltip]');
    elements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.getAttribute('data-tooltip');
    tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 1000;
        top: ${e.target.offsetTop - 30}px;
        left: ${e.target.offsetLeft}px;
    `;
    document.body.appendChild(tooltip);
    e.target.tooltip = tooltip;
}

function hideTooltip(e) {
    if (e.target.tooltip) {
        e.target.tooltip.remove();
    }
}

// Dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Load dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + A for add student
    if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        window.location.href = 'add-student.html';
    }
    // Ctrl + V for view students
    if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
        window.location.href = 'view-students.jsp';
    }
    // Ctrl + H for home
    if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        window.location.href = 'index.html';
    }
});

// Log user activity
function logActivity(action, details) {
    const activity = {
        action: action,
        details: details,
        timestamp: new Date().toISOString(),
        user: sessionStorage.getItem('username') || 'Guest'
    };
    
    console.log('User Activity:', activity);
    // Can send to server for persistent logging
}

// Export all functions for global use
window.validateForm = validateForm;
window.filterTable = filterTable;
window.exportToCSV = exportToCSV;
window.printTable = printTable;
window.confirmDelete = confirmDelete;
window.toggleDarkMode = toggleDarkMode;
window.goToPage = goToPage;
