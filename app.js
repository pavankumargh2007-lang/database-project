/**
 * AutoServe Pro - Shared Logic
 */

const App = {
    // Data Management
    db: {
        saveData: (key, data) => {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (e) {
                console.error('Storage Error:', e);
                let msg = 'Failed to save data.';
                if (e.name === 'QuotaExceededError') {
                    msg = 'Storage limit exceeded! Please clear some data.';
                }
                App.ui.showToast(msg, 'error');
                return false;
            }
        },
        getData: (key) => {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : [];
            } catch (e) {
                console.error('Retrieval Error:', e);
                App.ui.showToast('Failed to load local data.', 'error');
                return [];
            }
        },
        
        generateId: () => '_' + Math.random().toString(36).substr(2, 9),
        
        create: (key, item) => {
            const data = App.db.getData(key);
            item.id = App.db.generateId();
            item.createdAt = new Date().toISOString();
            data.push(item);
            return App.db.saveData(key, data) ? item : null;
        },
        
        update: (key, id, newData) => {
            let data = App.db.getData(key);
            const index = data.findIndex(item => item.id === id);
            if (index !== -1) {
                data[index] = { ...data[index], ...newData, updatedAt: new Date().toISOString() };
                return App.db.saveData(key, data) ? data[index] : null;
            }
            return null;
        },
        
        delete: (key, id) => {
            let data = App.db.getData(key);
            data = data.filter(item => item.id !== id);
            return App.db.saveData(key, data);
        }
    },

    // UI Components
    ui: {
        showToast: (message, type = 'info') => {
            const container = document.getElementById('toast-container') || (() => {
                const c = document.createElement('div');
                c.id = 'toast-container';
                document.body.appendChild(c);
                return c;
            })();
            
            const toast = document.createElement('div');
            toast.className = `toast ${type === 'success' ? 'bg-green-600' : 
                                   type === 'error' ? 'bg-red-600' : 
                                   type === 'warning' ? 'bg-orange-500' : 
                                   'bg-primary'} text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 font-medium`;
            toast.innerText = message;
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        },

        validateForm: (formId) => {
            const form = document.getElementById(formId);
            if (!form) return true;
            let isValid = true;
            
            // Clear existing errors
            form.querySelectorAll('.error-msg').forEach(el => el.classList.add('hidden'));
            form.querySelectorAll('input, select, textarea').forEach(el => el.classList.remove('border-red-500'));

            form.querySelectorAll('[required]').forEach(input => {
                if (!input.value || !input.value.trim()) {
                    App.ui.showFieldError(input, 'This field is required');
                    isValid = false;
                }
            });

            form.querySelectorAll('input[type="email"]').forEach(input => {
                if (input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
                    App.ui.showFieldError(input, 'Invalid email format');
                    isValid = false;
                }
            });

            form.querySelectorAll('input[type="tel"]').forEach(input => {
                if (input.value && !/^\+?[\d\s-]{10,}$/.test(input.value)) {
                    App.ui.showFieldError(input, 'Invalid phone (min 10 digits)');
                    isValid = false;
                }
            });

            form.querySelectorAll('input[type="number"]').forEach(input => {
                const val = parseFloat(input.value);
                if (input.hasAttribute('min') && val < parseFloat(input.getAttribute('min'))) {
                    App.ui.showFieldError(input, `Min value is ${input.getAttribute('min')}`);
                    isValid = false;
                }
            });

            return isValid;
        },

        showFieldError: (input, message) => {
            input.classList.add('border-red-500');
            let errorSpan = input.nextElementSibling;
            if (!errorSpan || !errorSpan.classList.contains('error-msg')) {
                errorSpan = document.createElement('span');
                errorSpan.className = 'error-msg text-red-500 text-[10px] font-bold mt-1 block h-4';
                input.after(errorSpan);
            }
            errorSpan.innerText = message;
            errorSpan.classList.remove('hidden');
        },

        confirmAction: (message, callback) => {
            if (confirm(message)) {
                callback();
            }
        },

        initTheme: () => {
            const theme = localStorage.getItem('theme') || 'light';
            document.documentElement.classList.toggle('dark', theme === 'dark');
            App.ui.updateThemeUI(theme);
        },

        toggleTheme: () => {
            const isDark = document.documentElement.classList.toggle('dark');
            const theme = isDark ? 'dark' : 'light';
            localStorage.setItem('theme', theme);
            App.ui.updateThemeUI(theme);
        },

        updateThemeUI: (theme) => {
            const indicator = document.getElementById('theme-indicator');
            const text = document.getElementById('theme-text');
            if (indicator) {
                indicator.style.transform = theme === 'dark' ? 'translateX(12px)' : 'translateX(0)';
            }
            if (text) {
                text.innerText = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
            }
        },

        injectLayout: () => {
            const path = window.location.pathname;
            const filename = path.split('/').pop() || 'index.html';

            // Sidebar HTML
            const sidebarHTML = `
                <aside class="sidebar fixed top-0 left-0 h-full text-white flex flex-col z-40 transition-all no-print">
                    <div class="p-6 flex items-center gap-3 border-b border-primary-border">
                        <div class="w-10 h-10 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-black/20">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M2 11l3-4h13l3 4M2 11v5h20v-5H2z"></path></svg>
                        </div>
                        <span class="text-xl font-bold tracking-tight">AutoServe Pro</span>
                    </div>
                    <nav class="flex-1 py-6 space-y-1 px-3 overflow-y-auto">
                        ${App.ui.createNavLink('index.html', 'Dashboard', 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', filename)}
                        ${App.ui.createNavLink('customers.html', 'Customers', 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', filename)}
                        ${App.ui.createNavLink('vehicles.html', 'Vehicles', 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M2 11l3-4h13l3 4M2 11v5h20v-5H2z', filename)}
                        ${App.ui.createNavLink('bookings.html', 'Bookings', 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', filename)}
                        ${App.ui.createNavLink('jobcards.html', 'Job Cards', 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', filename)}
                        ${App.ui.createNavLink('inventory.html', 'Inventory', 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', filename)}
                        ${App.ui.createNavLink('billing.html', 'Billing', 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', filename)}
                        ${App.ui.createNavLink('staff.html', 'Staff', 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', filename)}
                        ${App.ui.createNavLink('notifications.html', 'Alerts', 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', filename)}
                        ${App.ui.createNavLink('reports.html', 'Reports', 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', filename)}
                    </nav>
                    <div class="p-4 border-t border-primary-border bg-primary-dark">
                        <div class="flex items-center justify-between px-2">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-accent flex items-center justify-center font-bold text-sm shadow-inner">JD</div>
                                <div>
                                    <p class="text-sm font-semibold leading-none">John Doe</p>
                                    <p class="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Service Manager</p>
                                </div>
                            </div>
                            <button id="mobile-close" class="md:hidden text-gray-400 hover:text-white">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                    </div>
                </aside>
            `;

            // Navbar HTML
            const navbarHTML = `
                <header class="navbar fixed top-0 right-0 h-16 bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex items-center justify-between px-4 md:px-8 z-30 transition-all no-print" style="left: var(--sidebar-width);">
                    <div class="flex items-center gap-4">
                        <button id="mobile-toggle" class="md:hidden p-2 text-gray-600 dark:text-gray-400">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                        <div class="hidden sm:flex items-center gap-3 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full w-64 md:w-96 border dark:border-gray-700 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            <input type="text" placeholder="Search registration, customer, or phone..." class="bg-transparent border-none text-sm focus:outline-none w-full outline-none text-gray-700 dark:text-gray-300">
                        </div>
                    </div>
                    <div class="flex items-center gap-3 md:gap-6">
                        <button id="theme-toggle" class="flex items-center gap-2 p-1.5 px-3 rounded-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div class="w-8 h-4 bg-gray-200 dark:bg-gray-600 rounded-full relative transition-colors shadow-inner">
                                <div id="theme-indicator" class="dot absolute left-1 top-0.5 w-3 h-3 bg-white rounded-full border shadow-sm transition-transform duration-200"></div>
                            </div>
                            <span id="theme-text" class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest hidden xs:block">Light Mode</span>
                        </button>
                        <div class="relative group cursor-pointer p-2">
                            <svg class="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                            <div class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900 font-bold">3</div>
                        </div>
                    </div>
                </header>
            `;

            document.body.insertAdjacentHTML('afterbegin', sidebarHTML + navbarHTML);
            
            // Adjust main content for navbar
            const main = document.querySelector('.main-content');
            if (main) {
                main.classList.remove('pt-20', 'px-6', 'pb-6');
                main.classList.add('pt-24', 'px-4', 'md:px-8', 'pb-8', 'space-y-6');
            }
            
            // Event Listeners
            document.getElementById('theme-toggle').addEventListener('click', App.ui.toggleTheme);
            document.getElementById('mobile-toggle')?.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.add('mobile-open');
            });
            document.getElementById('mobile-close')?.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.remove('mobile-open');
            });
            
            App.ui.initTheme();
        },

        createNavLink: (href, label, iconPath, activeFile) => {
            const isActive = activeFile === href;
            return `
                <a href="${href}" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-accent text-white font-semibold shadow-lg shadow-accent/20' : 'text-gray-300 hover:bg-white/10'}">
                    <svg class="w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}"></path></svg>
                    <span>${label}</span>
                </a>
            `;
        }
    },

    // Initialization
    init: () => {
        App.ui.injectLayout();
        console.log('AutoServe Pro Initialized');
    }
};

// Auto init on DOM load
document.addEventListener('DOMContentLoaded', App.init);
