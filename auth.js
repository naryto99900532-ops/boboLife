// РЕГИСТРАЦИЯ - ИСПРАВЛЕННАЯ ВЕРСИЯ
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
    
    // Показываем загрузку
    const submitBtn = e.target.querySelector('button[type="submit"]')
    const originalText = submitBtn.textContent
    submitBtn.textContent = 'Регистрация...'
    submitBtn.disabled = true
    
    try {
        console.log('Начинаем регистрацию для:', email)
        
        // 1. Регистрация в Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                    role: 'user'
                },
                emailRedirectTo: window.location.origin // Важно для подтверждения
            }
        })
        
        if (authError) {
            console.error('Auth error:', authError)
            throw authError
        }
        
        console.log('Auth успешно:', authData)
        
        // 2. Автоматический вход после регистрации
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })
        
        if (signInError) {
            console.error('Sign in error:', signInError)
            throw new Error('Не удалось автоматически войти после регистрации')
        }
        
        console.log('Sign in успешно:', signInData)
        
        // 3. Сохраняем пользователя
        localStorage.setItem('user', JSON.stringify({
            id: signInData.user.id,
            email: signInData.user.email,
            username: username,
            role: 'user'
        }))
        
        // 4. Переходим на dashboard
        alert('Регистрация и вход успешны!')
        window.location.href = 'dashboard.html'
        
    } catch (error) {
        console.error('Полная ошибка:', error)
        alert('Ошибка: ' + error.message)
    } finally {
        // Восстанавливаем кнопку
        submitBtn.textContent = originalText
        submitBtn.disabled = false
    }
})// РЕГИСТРАЦИЯ - ИСПРАВЛЕННАЯ ВЕРСИЯ
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
    
    // Показываем загрузку
    const submitBtn = e.target.querySelector('button[type="submit"]')
    const originalText = submitBtn.textContent
    submitBtn.textContent = 'Регистрация...'
    submitBtn.disabled = true
    
    try {
        console.log('Начинаем регистрацию для:', email)
        
        // 1. Регистрация в Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                    role: 'user'
                },
                emailRedirectTo: window.location.origin // Важно для подтверждения
            }
        })
        
        if (authError) {
            console.error('Auth error:', authError)
            throw authError
        }
        
        console.log('Auth успешно:', authData)
        
        // 2. Автоматический вход после регистрации
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })
        
        if (signInError) {
            console.error('Sign in error:', signInError)
            throw new Error('Не удалось автоматически войти после регистрации')
        }
        
        console.log('Sign in успешно:', signInData)
        
        // 3. Сохраняем пользователя
        localStorage.setItem('user', JSON.stringify({
            id: signInData.user.id,
            email: signInData.user.email,
            username: username,
            role: 'user'
        }))
        
        // 4. Переходим на dashboard
        alert('Регистрация и вход успешны!')
        window.location.href = 'dashboard.html'
        
    } catch (error) {
        console.error('Полная ошибка:', error)
        alert('Ошибка: ' + error.message)
    } finally {
        // Восстанавливаем кнопку
        submitBtn.textContent = originalText
        submitBtn.disabled = false
    }
})
// ВХОД - ИСПРАВЛЕННЫЙ
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const login = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value
    
    // Показываем загрузку
    const submitBtn = e.target.querySelector('button[type="submit"]')
    const originalText = submitBtn.textContent
    submitBtn.textContent = 'Вход...'
    submitBtn.disabled = true
    
    try {
        console.log('Пытаемся войти как:', login)
        
        // Пробуем как email
        let { data, error } = await supabase.auth.signInWithPassword({
            email: login,
            password: password
        })
        
        // Если ошибка, пробуем найти username
        if (error && error.message.includes('Invalid login credentials')) {
            console.log('Пробуем найти по username:', login)
            
            // Здесь нужно искать username в своей таблице users
            // Но для теста просто пробуем как email еще раз
            throw new Error('Неверные данные для входа')
        }
        
        if (error) throw error
        
        console.log('Вход успешен:', data)
        
        // Сохраняем пользователя
        localStorage.setItem('user', JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            role: data.user.user_metadata?.role || 'user'
        }))
        
        // Переходим на dashboard
        window.location.href = 'dashboard.html'
        
    } catch (error) {
        console.error('Ошибка входа:', error)
        alert('Ошибка входа: ' + error.message)
        
        // Предлагаем зарегистрироваться
        if (error.message.includes('Invalid login credentials')) {
            if (confirm('Пользователь не найден. Хотите зарегистрироваться?')) {
                document.querySelector('.auth-tab[data-tab="register"]').click()
            }
        }
    } finally {
        // Восстанавливаем кнопку
        submitBtn.textContent = originalText
        submitBtn.disabled = false
    }
})
