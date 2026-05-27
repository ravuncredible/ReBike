export const escapeHtml = (unsafe) => {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 };
 
 export const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
 };
 
 export const getStatusBadgeInfo = (status) => {
     const statusMap = {
         pending: { text: 'รอตรวจสอบ', class: 'status-pending' },
         approved: { text: 'อนุมัติแล้ว', class: 'status-approved' },
         available: { text: 'เผยแพร่บนหน้าเว็บ', class: 'status-approved' },
         rejected: { text: 'ไม่ผ่าน/ปฏิเสธ', class: 'status-rejected' },
         reserved: { text: 'มีผู้จองแล้ว', class: 'status-pending' },
         donated: { text: 'บริจาคเรียบร้อย', class: 'status-completed' },
         in_delivery: { text: 'กำลังจัดส่ง', class: 'status-approved' },
         completed: { text: 'เสร็จสิ้น', class: 'status-completed' }
     };
     return statusMap[status] || { text: status, class: '' };
 };
 
 export const getConditionInfo = (condition) => {
     const conditionMap = {
         excellent: { text: 'สภาพดีมาก', icon: '⭐' },
         good: { text: 'สภาพดี', icon: '✨' },
         fair: { text: 'พอใช้', icon: '👍' },
         needs_repair: { text: 'ต้องซ่อม', icon: '🔧' }
     };
     return conditionMap[condition] || { text: condition || 'พร้อมใช้งาน', icon: '✅' };
 };
