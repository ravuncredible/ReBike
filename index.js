// index.js - Supabase Version
import { supabase, auth, db, storage } from './supabase-config.js'

// =====================================================
// 🔐 ADMIN CREDENTIALS
// =====================================================
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
}

let isAdminLoggedIn = false

// =====================================================
// 🔐 ADMIN AUTHENTICATION
// =====================================================

function handleAdminLogin(event) {
    event.preventDefault()
    
    const username = document.getElementById('adminUsername').value
    const password = document.getElementById('adminPassword').value
    
    if (username === ADMIN_CREDENTIALS.username && 
        password === ADMIN_CREDENTIALS.password) {
        
        isAdminLoggedIn = true
        localStorage.setItem('adminLoggedIn', 'true')
        
        alert('✅ เข้าสู่ระบบ Admin สำเร็จ!\n\nยินดีต้อนรับสู่หน้า Dashboard')
        showPage('admin')
        document.getElementById('adminLoginForm').reset()
        
    } else {
        alert('❌ Username หรือ Password ไม่ถูกต้อง')
        document.getElementById('adminPassword').value = ''
    }
}

function handleAdminLogout() {
    if (confirm('คุณต้องการออกจากระบบ Admin หรือไม่?')) {
        isAdminLoggedIn = false
        localStorage.removeItem('adminLoggedIn')
        alert('ออกจากระบบ Admin เรียบร้อย')
        showPage('home')
    }
}

function checkAdminAccess() {
    const savedLoginState = localStorage.getItem('adminLoggedIn')
    
    if (savedLoginState === 'true') {
        isAdminLoggedIn = true
        showPage('admin')
    } else {
        showPage('adminLogin')
    }
}

// =====================================================
// 👤 USER AUTHENTICATION - SUPABASE
// =====================================================

async function handleSignup(event) {
    event.preventDefault()
    
    const name = document.getElementById('signupName').value
    const email = document.getElementById('signupEmail').value
    const phone = document.getElementById('signupPhone').value
    const password = document.getElementById('signupPassword').value
    const confirmPassword = document.getElementById('signupConfirmPassword').value

    if (password !== confirmPassword) {
        alert('รหัสผ่านไม่ตรงกัน กรุณาลองใหม่อีกครั้ง')
        return
    }

    try {
        // Sign up ผ่าน Supabase Auth
        const { data, error } = await auth.signUp(email, password, {
            name: name,
            phone: phone
        })

        if (error) throw error

        // บันทึกข้อมูลเพิ่มเติมใน profiles table
        const { error: profileError } = await db.insert('profiles', {
            id: data.user.id,
            name: name,
            email: email,
            phone: phone,
            role: 'user'
        })

        if (profileError) throw profileError

        alert('✅ สมัครสมาชิกสำเร็จ!\n\nชื่อ: ' + name + '\nEmail: ' + email + '\n\nกรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี')
        showPage('login')
        document.getElementById('signupForm').reset()
        
    } catch (error) {
        console.error('Signup error:', error)
        
        if (error.message.includes('already registered')) {
            alert('❌ อีเมลนี้ถูกใช้งานแล้ว')
        } else if (error.message.includes('Password')) {
            alert('❌ รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
        } else {
            alert('❌ เกิดข้อผิดพลาด: ' + error.message)
        }
    }
}

async function handleLogin(event) {
    event.preventDefault()
    
    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value

    try {
        const { data, error } = await auth.signIn(email, password)

        if (error) throw error

        alert('✅ เข้าสู่ระบบสำเร็จ!\n\nEmail: ' + email)
        showPage('home')
        document.getElementById('loginForm').reset()
        
    } catch (error) {
        console.error('Login error:', error)
        
        if (error.message.includes('Invalid login credentials')) {
            alert('❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง')
        } else if (error.message.includes('Email not confirmed')) {
            alert('❌ กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ')
        } else {
            alert('❌ เกิดข้อผิดพลาด: ' + error.message)
        }
    }
}

async function handleLogout() {
    try {
        const { error } = await auth.signOut()
        if (error) throw error
        
        alert('✅ ออกจากระบบเรียบร้อย')
        showPage('home')
    } catch (error) {
        console.error('Logout error:', error)
        alert('❌ เกิดข้อผิดพลาดในการออกจากระบบ')
    }
}

// ฟังการเปลี่ยนแปลงสถานะ Auth
auth.onAuthStateChange((event, session) => {
    if (session?.user) {
        console.log('User signed in:', session.user.email)
        updateNavForLoggedInUser(session.user)
    } else {
        console.log('No user signed in')
        updateNavForGuest()
    }
})

function updateNavForLoggedInUser(user) {
    const navButtons = document.querySelector('.nav-buttons')
    navButtons.innerHTML = `
        <span style="color: white; margin-right: 1rem;">สวัสดี, ${user.email}</span>
        <button class="btn-nav btn-login-nav" onclick="handleLogout()">ออกจากระบบ</button>
        <button class="btn-nav btn-admin-nav" onclick="checkAdminAccess()">Admin 🛠️</button>
    `
}

function updateNavForGuest() {
    const navButtons = document.querySelector('.nav-buttons')
    navButtons.innerHTML = `
        <button class="btn-nav btn-login-nav" onclick="showPage('login')">เข้าสู่ระบบ</button>
        <button class="btn-nav btn-signup-nav" onclick="showPage('signup')">สมัครสมาชิก</button>
        <button class="btn-nav btn-admin-nav" onclick="checkAdminAccess()">Admin 🛠️</button>
    `
}

// =====================================================
// 📄 PAGE NAVIGATION
// =====================================================

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active')
    })

    if (pageName === 'admin' && !isAdminLoggedIn) {
        const savedLoginState = localStorage.getItem('adminLoggedIn')
        if (savedLoginState !== 'true') {
            showPage('adminLogin')
            return
        }
    }

    const pageMap = {
        'home': 'homePage',
        'login': 'loginPage',
        'signup': 'signupPage',
        'adminLogin': 'adminLoginPage',
        'admin': 'adminPage'
    }

    const pageId = pageMap[pageName]
    if (pageId) {
        document.getElementById(pageId).classList.add('active')
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
}

function showTab(tabName, button) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active')
    })
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active')
    })

    if (button) {
        button.classList.add('active')
    }
    document.getElementById(tabName).classList.add('active')
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId)
    const button = input.nextElementSibling
    
    if (input.type === 'password') {
        input.type = 'text'
        button.textContent = '🙈'
    } else {
        input.type = 'password'
        button.textContent = '👁️'
    }
}

// =====================================================
// 🚴 BICYCLE FUNCTIONS - SUPABASE
// =====================================================

async function loadBicycles() {
    try {
        const { data, error } = await db.get('bicycles', {
            select: '*, profiles(name, phone)',
            eq: { status: 'available' },
            order: { column: 'created_at', ascending: false }
        })

        if (error) throw error

        // แสดงจักรยานที่ได้
        console.log('Bicycles:', data)
        // TODO: แสดงใน UI
        
    } catch (error) {
        console.error('Error loading bicycles:', error)
    }
}

async function addBicycle(bicycleData) {
    try {
        const user = await auth.getUser()
        if (!user) {
            alert('กรุณาเข้าสู่ระบบก่อน')
            return
        }

        const { data, error } = await db.insert('bicycles', {
            donor_id: user.id,
            ...bicycleData
        })

        if (error) throw error

        alert('✅ บริจาคจักรยานสำเร็จ!')
        return data[0]
        
    } catch (error) {
        console.error('Error adding bicycle:', error)
        alert('❌ เกิดข้อผิดพลาด: ' + error.message)
    }
}

async function uploadBicycleImage(file, bicycleId) {
    try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${bicycleId}-${Date.now()}.${fileExt}`
        const filePath = `${bicycleId}/${fileName}`

        const { error } = await storage.upload('bicycle-images', filePath, file)
        if (error) throw error

        const publicUrl = storage.getPublicUrl('bicycle-images', filePath)
        return publicUrl
        
    } catch (error) {
        console.error('Error uploading image:', error)
        return null
    }
}

// =====================================================
// 🔧 ADMIN FUNCTIONS
// =====================================================

async function handleApprove(type, id) {
    if (!confirm('คุณต้องการอนุมัติคำขอนี้หรือไม่?')) return

    try {
        if (type === 'donation') {
            // อนุมัติจักรยาน
            const { error } = await db.update('bicycles', id, {
                status: 'approved'
            })
            if (error) throw error
        } else if (type === 'request') {
            // อนุมัติคำขอ
            const { error } = await db.update('donation_requests', id, {
                status: 'approved'
            })
            if (error) throw error
        }

        alert('✅ อนุมัติคำขอเรียบร้อยแล้ว')
        // TODO: Refresh data
        
    } catch (error) {
        console.error('Error approving:', error)
        alert('❌ เกิดข้อผิดพลาด: ' + error.message)
    }
}

async function handleReject(type, id) {
    const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:')
    if (!reason) return

    try {
        if (type === 'donation') {
            const { error } = await db.update('bicycles', id, {
                status: 'rejected',
                admin_note: reason
            })
            if (error) throw error
        } else if (type === 'request') {
            const { error } = await db.update('donation_requests', id, {
                status: 'rejected',
                admin_note: reason
            })
            if (error) throw error
        }

        alert('✅ ปฏิเสธคำขอเรียบร้อยแล้ว')
        // TODO: Refresh data
        
    } catch (error) {
        console.error('Error rejecting:', error)
        alert('❌ เกิดข้อผิดพลาด: ' + error.message)
    }
}

async function updateStatus(id, status) {
    const statusText = {
        'repair': 'ส่งซ่อม',
        'ready': 'พร้อมแจกจ่าย',
        'delivering': 'กำลังจัดส่ง',
        'completed': 'เสร็จสิ้น'
    }
    
    if (!confirm('คุณต้องการเปลี่ยนสถานะเป็น "' + statusText[status] + '" หรือไม่?')) return

    try {
        const { error } = await db.update('donation_requests', id, {
            status: status
        })
        if (error) throw error

        alert('✅ อัพเดทสถานะเรียบร้อยแล้ว')
        
    } catch (error) {
        console.error('Error updating status:', error)
        alert('❌ เกิดข้อผิดพลาด: ' + error.message)
    }
}

function sendToRepair(id) {
    handleApprove('donation', id)
}

function markAsAvailable(id) {
    updateStatus(id, 'available')
}

function viewDetails(id) {
    alert('เปิดหน้ารายละเอียดจักรยาน #B' + String(id).padStart(3, '0'))
}

function viewCompletedDetails(id) {
    alert('เปิดหน้ารายละเอียดการจัดจ่าย #C' + String(id).padStart(3, '0'))
}

// =====================================================
// 🎨 UI ENHANCEMENTS
// =====================================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href')
        if (href !== '#') {
            e.preventDefault()
            const target = document.querySelector(href)
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }
        }
    })
})

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1'
            entry.target.style.transform = 'translateY(0)'
        }
    })
}, observerOptions)

document.querySelectorAll('.step, .bike-card, .stat-card').forEach(el => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(30px)'
    el.style.transition = 'all 0.6s ease-out'
    observer.observe(el)
})

document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('blur', function() {
        if (this.value.trim() === '' && this.hasAttribute('required')) {
            this.style.borderColor = '#ef4444'
        } else if (this.checkValidity()) {
            this.style.borderColor = '#10b981'
        } else {
            this.style.borderColor = '#ef4444'
        }
    })

    input.addEventListener('focus', function() {
        this.style.borderColor = '#10b981'
    })
})

// =====================================================
// 🌐 EXPOSE TO WINDOW
// =====================================================
window.showPage = showPage
window.showTab = showTab
window.togglePassword = togglePassword
window.handleLogin = handleLogin
window.handleSignup = handleSignup
window.handleLogout = handleLogout
window.handleAdminLogin = handleAdminLogin
window.handleAdminLogout = handleAdminLogout
window.checkAdminAccess = checkAdminAccess
window.handleApprove = handleApprove
window.handleReject = handleReject
window.updateStatus = updateStatus
window.sendToRepair = sendToRepair
window.markAsAvailable = markAsAvailable
window.viewDetails = viewDetails
window.viewCompletedDetails = viewCompletedDetails
window.loadBicycles = loadBicycles
window.addBicycle = addBicycle
window.uploadBicycleImage = uploadBicycleImage

// Load bicycles on page load
document.addEventListener('DOMContentLoaded', () => {
    loadBicycles()
})
