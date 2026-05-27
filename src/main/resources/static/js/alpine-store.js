document.addEventListener('alpine:init', () => {
    Alpine.store('notifications', {
        count: 0,
        list: [],
        init() {
            // fetch notifications on page load if needed
        },
        markRead(id) {
            fetch(`/api/student/notifications/${id}/read`, { method: 'PUT' });
            this.count = Math.max(0, this.count - 1);
            this.list = this.list.filter(n => n.id !== id);
        }
    });
});
