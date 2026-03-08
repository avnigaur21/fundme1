/* FundMe Core Logic */

document.addEventListener('DOMContentLoaded', () => {
    console.log('FundMe Platform Initialized');

    // Collapsible Sidebar - toggle (click to pin expanded state)
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const dashboardLayout = document.querySelector('.dashboard-layout');

    if (sidebarToggle && dashboardLayout) {
        // Restore persisted preference
        const persisted = localStorage.getItem('fundme-sidebar-expanded');
        if (persisted === 'true') {
            dashboardLayout.classList.add('sidebar-expanded');
            sidebarToggle.setAttribute('title', 'Collapse sidebar');
            sidebarToggle.setAttribute('aria-label', 'Collapse sidebar');
        }
        if (persisted === 'false') {
            dashboardLayout.classList.remove('sidebar-expanded');
        }

        sidebarToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dashboardLayout.classList.toggle('sidebar-expanded');
            const isExpanded = dashboardLayout.classList.contains('sidebar-expanded');
            localStorage.setItem('fundme-sidebar-expanded', isExpanded);
            sidebarToggle.setAttribute('title', isExpanded ? 'Collapse sidebar' : 'Expand sidebar');
            sidebarToggle.setAttribute('aria-label', isExpanded ? 'Collapse sidebar' : 'Expand sidebar');
        });
    }

    // Sidebar Toggle (Mobile - hamburger)
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 &&
                sidebar.classList.contains('open') &&
                !sidebar.contains(e.target) &&
                e.target !== menuToggle) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Filter Sidebar Toggle (Explorer)
    const filterToggle = document.getElementById('filter-toggle');
    const filterSidebar = document.getElementById('filter-sidebar');

    if (filterToggle && filterSidebar) {
        filterToggle.addEventListener('click', () => {
            filterSidebar.classList.toggle('open');
        });
    }
});

