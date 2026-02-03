// auth.js - УЛЬТРА-УПРОЩЕННАЯ ВЕРСИЯ

// 1. Создаем Supabase клиент глобально
const supabaseUrl = 'https://dikfugzhszrqkounopms.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpa2Z1Z3poc3pycWtvdW5vcG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjM4NDksImV4cCI6MjA4NTY5OTg0OX0.fNEFld6HO8ciHuVDp1yIaZXjQkuv6E6a8Tg_mNFN3Y4'

let supabase

// Загружаем Supabase при старте
async function initSupabase() {
    if (window.supabase) return window.supabase
    
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm')
    window.supabase = createClient(supabaseUrl, supabaseKey)
    supabase = window.supabase
    console.log('Supabase инициализирован')
    return supabase
}

// 2. Регистрация - САМАЯ ПРОСТАЯ
async function registerUser(email, username, password) {
    try {
        console.log('Регистрируем:', email)
        
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { username: username }
            }
        })
        
        if (error) {
            console.error('Ошибка регистрации:', error)
            throw error
        }
        
        console.log('Регистрация успешна:', data)
        
        // СРАЗУ ПЫТАЕМСЯ ВОЙТИ
        const loginResult = await loginUser(email, password)
        return loginResult
        
    } catch (error) {
        console.error('Полная ошибка:', error)
        throw error
    }
}

// 3. Вход - САМЫЙ ПРОСТОЙ
async function loginUser(email, password) {
    try {
        console.log('Входим как:', email)
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })
        
        if (error) {
            console.error('Ошибка входа:', error)
            throw error
        }
        
        console.log('Вход успешен:', data)
        
        // Сохраняем пользователя
        localStorage.setItem('supabase_user', JSON.stringify(data.user))
        localStorage.setItem('supabase_session', JSON.stringify(data.session))
        
        return data
        
    } catch (error) {
        console.error('Ошибка входа:', error)
        throw error
    }
}

// 4. Инициализация при загрузке
document.addEventListener('DOMContentLoaded', async function() {
    // Инициализируем Supabase
    await initSupabase()
    
    // Открытие/закрытие модального окна
    document.getElementById('login-btn-header').addEventListener('click', () => {
        document.getElementById('authModal').style.display = 'block'
    })
    
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('authModal').style.display = 'none'
    })
    
    // 5. ОБРАБОТКА РЕГИСТРАЦИИ
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault()
        
        const email = document.getElementById('registerEmail').value
        const username = document.getElementById('registerUsername').value
        const password = document.getElementById('registerPassword').value
        const confirmPassword = document.getElementById('registerConfirm').value
        
        if (password !== confirmPassword) {
            alert('Пароли не совпадают!')
            return
        }
        
        // Кнопка "загрузка"
        const btn = e.target.querySelector('button[type="submit"]')
        const originalText = btn.textContent
        btn.textContent = 'Регистрация...'
        btn.disabled = true
        
        try {
            const result = await registerUser(email, username, password)
            
            alert('Регистрация и вход успешны!')
            document.getElementById('authModal').style.display = 'none'
            
            // Переход на dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html'
            }, 1000)
            
        } catch (error) {
            alert('Ошибка: ' + error.message)
        } finally {
            btn.textContent = originalText
            btn.disabled = false
        }
    })
    
    // 6. ОБРАБОТКА ВХОДА
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault()
        
        const email = document.getElementById('loginEmail').value
        const password = document.getElementById('loginPassword').value
        
        // Кнопка "загрузка"
        const btn = e.target.querySelector('button[type="submit"]')
        const originalText = btn.textContent
        btn.textContent = 'Вход...'
        btn.disabled = true
        
        try {
            const result = await loginUser(email, password)
            
            alert('Вход успешен!')
            document.getElementById('authModal').style.display = 'none'
            
            // Переход на dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html'
            }, 1000)
            
        } catch (error) {
            alert('Ошибка входа: ' + error.message)
        } finally {
            btn.textContent = originalText
            btn.disabled = false
        }
    })
    
    // 7. ПРОВЕРКА: уже вошли?
    checkCurrentUser()
})

// Проверка текущего пользователя
async function checkCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
        console.log('Уже авторизован как:', user.email)
        // Меняем кнопку "Log In" на "Панель управления"
        const loginBtn = document.getElementById('login-btn-header')
        if (loginBtn) {
            loginBtn.innerHTML = '<i class="fas fa-user"></i> Панель управления'
            loginBtn.onclick = () => {
                window.location.href = 'dashboard.html'
            }
        }
    }
}
