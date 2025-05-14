export function getTimeAgo(isoDate) {
    const diff = Date.now() - new Date(isoDate).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    if (hours >= 1) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (minutes >= 1) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    return 'Just now';
  }
  