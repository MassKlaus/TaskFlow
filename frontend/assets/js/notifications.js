let notifications = [];
let unreadCount = 0;
let dropdownOpen = false;

const STORAGE_KEY = "taskflow_archived_notifications";

async function fetchNotifications() {
    try {
        const res = await axios.get("/api/notifications");
        notifications = res.data.notifications;
        unreadCount = res.data.unreadCount;
        updateBadge();
    } catch (err) {
        if (err.response && err.response.status === 401) return;
        console.error("Error fetching notifications:", err);
    }
}

function archiveReadNotifications() {
    const readIds = notifications
        .filter(n => n.read)
        .map(n => n._id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readIds));
}

function loadArchivedNotifications() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

async function markAsRead(id) {
    try {
        await axios.patch(`/api/notifications/${id}/read`);
        const n = notifications.find(n => n._id === id);
        if (n) {
            n.read = true;
            unreadCount = Math.max(0, unreadCount - 1);
            updateBadge();
            renderDropdown();
            archiveReadNotifications();
        }
    } catch (err) {
        console.error("Error marking notification as read:", err);
    }
}

function updateBadge() {
    const badge = document.getElementById("notification-badge");
    if (!badge) return;
    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? "99+" : unreadCount;
        badge.style.display = "flex";
    } else {
        badge.style.display = "none";
    }
}

function renderDropdown() {
    const dropdown = document.getElementById("notification-dropdown");
    if (!dropdown) return;
    const archivedIds = loadArchivedNotifications();
    dropdown.innerHTML = "";

    if (notifications.length === 0) {
        dropdown.innerHTML = '<div class="notification-empty">No notifications</div>';
        return;
    }

    notifications.forEach(n => {
        const item = document.createElement("div");
        item.className = `notification-item${n.read ? " read" : " unread"}`;
        item.dataset.id = n._id;

        const text = document.createElement("span");
        text.className = "notification-text";
        text.textContent = n.message;

        const time = document.createElement("span");
        time.className = "notification-time";
        time.textContent = formatTime(n.createdAt);

        item.appendChild(text);
        item.appendChild(time);

        if (!n.read) {
            const markBtn = document.createElement("button");
            markBtn.className = "notification-mark-read";
            markBtn.textContent = "Mark as read";
            markBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                markAsRead(n._id);
            });
            item.appendChild(markBtn);
        }

        if (n.read && archivedIds.includes(n._id)) {
            item.style.opacity = "0.5";
        }

        dropdown.appendChild(item);
    });
}

function formatTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return date.toLocaleDateString();
}

function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
    const dropdown = document.getElementById("notification-dropdown");
    if (dropdown) {
        dropdown.style.display = dropdownOpen ? "block" : "none";
    }
    if (dropdownOpen) {
        renderDropdown();
    }
}

function setupNotificationToggle() {
    const bell = document.getElementById("notification-bell");
    if (bell) {
        bell.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleDropdown();
        });
    }
    document.addEventListener("click", () => {
        if (dropdownOpen) {
            dropdownOpen = false;
            const dropdown = document.getElementById("notification-dropdown");
            if (dropdown) dropdown.style.display = "none";
        }
    });
}

function startPolling() {
    fetchNotifications();
    setInterval(fetchNotifications, 30000);
}

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setupNotificationToggle();
    startPolling();
});
