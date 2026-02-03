import { supabase } from './supabase.js'

// Элементы DOM
const authModal = document.getElementById('authModal')
const loginBtnHeader = document.getElementById('login-btn-header')
const closeModalBtn = document.querySelector('.close-modal')
const authTabs = document.querySelectorAll('.auth-tab')
const authForms = document.querySelectorAll('.auth-form')
const switchBtns = document.querySelectorAll('.switch-btn')

// Открытие модального окна
loginBtnHeader.addEventListener('click', () => {
    authModal.style.display = 'block'
})

// Закрытие модального окна
closeModalBtn.addEventListener('click', () => {
    authModal.style.display = 'none'
})

// Закрытие при клике вне окна
window.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.style.display = 'none'
    }
})

// Переключение между вкладками
authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab
        
        authTabs.forEach(t => t.classList.remove('active'))
        authForms.forEach(f => f.classList.remove('active'))
        
        tab.classList.add('active')
        document.getElementById(`${tabName}Form`).classList.add('active')
    })
})

// Переключение через кнопки "Войти/Зарегистрироваться"
switchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.dataset.switch
        
        authTabs.forEach(t => t.classList.remove('active'))
        authForms.forEach(f => f.classList.remove('active'))
        
        document.querySelector(`.auth-tab[data-tab="${targetTab}"]`).classList.add('active')
        document.getElementById(`${targetTab}Form`).classList.add('active')
    })
})

// Регистрация
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
    
    try {
        // Регистрация в Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username
                }
            }
        })
        
        if (authError) throw authError
        
        // Создание записи в таблице users
        const { error: dbError } = await supabase
            .from('users')
            .insert([
                {
                    id: authData.user.id,
                    email: email,
                    username: username,
                    role: 'user'
                }
            ])
        
        if (dbError) throw dbError
        
        alert('Регистрация успешна! Проверьте email для подтверждения.')
        authModal.style.display = 'none'
        
    } catch (error) {
        alert('Ошибка регистрации: ' + error.message)
    }
})

// Вход
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const login = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value
    
    try {
        // Пытаемся войти как email
        const { data, error } = await supabase.auth.signInWithPassword({
            email: login,
            password: password
        })
        
        if (error) {
            // Если не email, ищем по username
            const { data: userData } = await supabase
                .from('users')
                .select('email')
                .eq('username', login)
                .single()
            
            if (userData) {
                const { error: usernameError } = await supabase.auth.signInWithPassword({
                    email: userData.email,
                    password: password
                })
                
                if (usernameError) throw usernameError
            } else {
                throw error
            }
        }
        
        // Получаем роль пользователя
        const { data: userRole } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .single()
        
        // Сохраняем данные в localStorage
        localStorage.setItem('user', JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            role: userRole.role
        }))
        
        // Перенаправляем на dashboard
        window.location.href = 'dashboard.html'
        
    } catch (error) {
        alert('Ошибка входа: ' + error.message)
    }
})

// Проверка авторизации при загрузке
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
        loginBtnHeader.innerHTML = '<i class="fas fa-user"></i> Панель управления'
        loginBtnHeader.onclick = () => {
            window.location.href = 'dashboard.html'
        }
    }
})
