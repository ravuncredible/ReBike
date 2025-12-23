// index.js
import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc,
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// =====================================================
// 🔐 ADMIN CREDENTIALS - กำหนด Username/Password Admin
// =====================================================
const ADMIN_CREDENTIALS = {
    username: 'admin',      // เปลี่ยนได้ตามต้องการ
    password: 'admin123'    // เปลี่ยนได้ตามต้องการ
};

let isAdminLoggedIn = false; // ตัวแปรเก็บสถานะการล็อกอิน Admin

// =====================================================
// 🔐 ADMIN AUTHENTICATION FUNCTIONS
// =====================================================

/**
 * ฟังก์ชันจัดการการเข้าสู่ระบบ Admin
 */
function handleAdminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    // ตรวจสอบ Username และ Password
    if (username === ADMIN_CREDENTIALS.username && 
        password === ADMIN_CREDENTIALS.password) {
        
        // ✅ ล็อกอินสำเร็จ
        isAdminLoggedIn = true;
        localStorage.setItem('adminLoggedIn', 'true');
        
        alert('✅ เข้าสู่ระบบ Admin สำเร็จ!\n\nยินดีต้อนรับสู่หน้า Dashboard');
        
        showPage('admin');
        document.getElementById('adminLoginForm').reset();
        
    } else {
        // ❌ ล็อกอินไม่สำเร็จ
        alert('❌ เข้าสู่ระบบไม่สำเร็จ\n\nUsername หรือ Password ไม่ถูกต้อง\nกรุณาลองใหม่อีกครั้ง');
        document.getElementById('adminPassword').value = '';
    }
}

/**
 * ฟังก์ชันออกจากระบบ Admin
 */
function handleAdminLogout() {
    if (confirm('คุณต้องการออกจากระบบ Admin หรือไม่?')) {
        isAdminLoggedIn = false;
        localStorage.removeItem('adminLoggedIn');
        alert('ออกจากระบบ Admin เรียบร้อย');
        showPage('home');
    }
}

/**
 * ฟังก์ชันตรวจสอบสิทธิ์ก่อนเข้า Admin Dashboard
 */
function checkAdminAccess() {
    const savedLoginState = localStorage.getItem('adminLoggedIn');
    
    if (savedLoginState === 'true') {
        isAdminLoggedIn = true;
        showPage('admin');
    } else {
        showPage('adminLogin');
    }
}

// =====================================================
// 👤 USER AUTHENTICATION FUNCTIONS
// =====================================================

// Handle Signup
async function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    if (password !== confirmPassword) {
        alert('รหัสผ่านไม่ตรงกัน กรุณาลองใหม่อีกครั้ง');
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await addDoc(collection(db, 'users'), {
            uid: user.uid,
            name: name,
            email: email,
            phone: phone,
            role: 'user',
            createdAt: serverTimestamp()
        });

        alert('สมัครสมาชิกสำเร็จ! ✅\n\nชื่อ: ' + name + '\nEmail: ' + email);
        showPage('login');
        
    } catch (error) {
        console.error('Signup error:', error);
        
        if (error.code === 'auth/email-already-in-use') {
            alert('อีเมลนี้ถูกใช้งานแล้ว');
        } else if (error.code === 'auth/weak-password') {
            alert('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        } else {
            alert('เกิดข้อผิดพลาด: ' + error.message);
        }
    }
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        alert('เข้าสู่ระบบสำเร็จ! ✅\n\nEmail: ' + email);
        showPage('home');
        
    } catch (error) {
        console.error('Login error:', error);
        
        if (error.code === 'auth/user-not-found') {
            alert('ไม่พบผู้ใช้นี้ในระบบ');
        } else if (error.code === 'auth/wrong-password') {
            alert('รหัสผ่านไม่ถูกต้อง');
        } else {
            alert('เกิดข้อผิดพลาด: ' + error.message);
        }
    }
}

// Handle Logout
async function handleLogout() {
    try {
        await signOut(auth);
        alert('ออกจากระบบเรียบร้อย');
        showPage('home');
    } catch (error) {
        console.error('Logout error:', error);
        alert('เกิดข้อผิดพลาดในการออกจากระบบ');
    }
}

// Check Authentication State
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('User is signed in:', user.email);
        updateNavForLoggedInUser(user);
    } else {
        console.log('No user signed in');
        updateNavForGuest();
    }
});

function updateNavForLoggedInUser(user) {
    const navButtons = document.querySelector('.nav-buttons');
    navButtons.innerHTML = `
        <span style="color: white; margin-right: 1rem;">สวัสดี, ${user.email}</span>
        <button class="btn-nav btn-login-nav" onclick="handleLogout()">ออกจากระบบ</button>
        <button class="btn-nav btn-admin-nav" onclick="checkAdminAccess()">Admin 🛠️</button>
    `;
}

function updateNavForGuest() {
    const navButtons = document.querySelector('.nav-buttons');
    navButtons.innerHTML = `
        <button class="btn-nav btn-login-nav" onclick="showPage('login')">เข้าสู่ระบบ</button>
        <button class="btn-nav btn-signup-nav" onclick="showPage('signup')">สมัครสมาชิก</button>
        <button class="btn-nav btn-admin-nav" onclick="checkAdminAccess()">Admin 🛠️</button>
    `;
}

// =====================================================
// 📄 PAGE NAVIGATION
// =====================================================

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    if (pageName === 'admin' && !isAdminLoggedIn) {
        const savedLoginState = localStorage.getItem('adminLoggedIn');
        if (savedLoginState !== 'true') {
            showPage('adminLogin');
            return;
        }
    }

    if (pageName === 'home') {
        document.getElementById('homePage').classList.add('active');
    } else if (pageName === 'login') {
        document.getElementById('loginPage').classList.add('active');
    } else if (pageName === 'signup') {
        document.getElementById('signupPage').classList.add('active');
    } else if (pageName === 'adminLogin') {
        document.getElementById('adminLoginPage').classList.add('active');
    } else if (pageName === 'admin') {
        document.getElementById('adminPage').classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Admin Tab Navigation
function showTab(tabName, button) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    if (button) {
        button.classList.add('active');
    }
    document.getElementById(tabName).classList.add('active');
}

// Toggle Password Visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}

// =====================================================
// 🔧 ADMIN FUNCTIONS (Placeholder)
// =====================================================

function handleApprove(type, id) {
    if (confirm('คุณต้องการอนุมัติคำขอนี้หรือไม่?')) {
        alert('อนุมัติคำขอ #' + id + ' เรียบร้อยแล้ว');
    }
}

function handleReject(type, id) {
    const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:');
    if (reason) {
        alert('ปฏิเสธคำขอ #' + id + '\nเหตุผล: ' + reason);
    }
}

function updateStatus(id, status) {
    const statusText = {
        'repair': 'ส่งซ่อม',
        'ready': 'พร้อมแจกจ่าย',
        'delivering': 'กำลังจัดส่ง',
        'completed': 'เสร็จสิ้น'
    };
    
    if (confirm('คุณต้องการเปลี่ยนสถานะเป็น "' + statusText[status] + '" หรือไม่?')) {
        alert('อัพเดทสถานะคำขอ #' + id + ' เป็น "' + statusText[status] + '" เรียบร้อยแล้ว');
    }
}

function sendToRepair(id) {
    if (confirm('คุณต้องการส่งจักรยานนี้เข้าซ่อมหรือไม่?')) {
        alert('ส่งจักรยาน #B' + String(id).padStart(3, '0') + ' เข้าซ่อมเรียบร้อยแล้ว');
    }
}

function markAsAvailable(id) {
    if (confirm('คุณต้องการเผยแพร่จักรยานนี้ให้พร้อมรับบริจาคหรือไม่?')) {
        alert('เผยแพร่จักรยาน #B' + String(id).padStart(3, '0') + ' เรียบร้อยแล้ว\nผู้ใช้สามารถเห็นและขอรับได้แล้ว');
    }
}

function viewDetails(id) {
    alert('เปิดหน้ารายละเอียดจักรยาน #B' + String(id).padStart(3, '0'));
}

function viewCompletedDetails(id) {
    alert('เปิดหน้ารายละเอียดการจัดจ่าย #C' + String(id).padStart(3, '0'));
}

// =====================================================
// 🎨 UI ENHANCEMENTS
// =====================================================

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.step, .bike-card, .stat-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});

// Form validation
document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('blur', function() {
        if (this.value.trim() === '' && this.hasAttribute('required')) {
            this.style.borderColor = '#ef4444';
        } else if (this.checkValidity()) {
            this.style.borderColor = '#10b981';
        } else {
            this.style.borderColor = '#ef4444';
        }
    });

    input.addEventListener('focus', function() {
        this.style.borderColor = '#10b981';
    });
});

// =====================================================
// 🌐 EXPOSE TO WINDOW (สำหรับ HTML onclick)
// =====================================================
window.showPage = showPage;
window.showTab = showTab;
window.togglePassword = togglePassword;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleLogout = handleLogout;
window.handleAdminLogin = handleAdminLogin;
window.handleAdminLogout = handleAdminLogout;
window.checkAdminAccess = checkAdminAccess;
window.handleApprove = handleApprove;
window.handleReject = handleReject;
window.updateStatus = updateStatus;
window.sendToRepair = sendToRepair;
window.markAsAvailable = markAsAvailable;
window.viewDetails = viewDetails;
window.viewCompletedDetails = viewCompletedDetails;