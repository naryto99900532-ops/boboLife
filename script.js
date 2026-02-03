import { supabase } from './supabase.js'

// Модальное окно
const loginBtn = document.getElementById('login-btn')
const modal = document.getElementById('auth-modal')
const closeModal = document.querySelector('.close-modal')
const tabBtns = document.querySelectorAll('.tab-btn')
const authForms = document.querySelectorAll('.auth-form')

// Показать модальное окно при нажатии на Log in
loginBtn.addEventListener('click', () => {
  modal.style.display = 'block'
})

// Закрыть модальное окно
closeModal.addEventListener('click', () => {
  modal.style.display = 'none'
})

// Закрыть модальное окно при клике вне его
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = 'none'
  }
})

// Переключение между вкладками входа и регистрации
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.getAttribute('data-tab')
    
    // Активируем соответствующую вкладку
    tabBtns.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    
    // Показываем соответствующую форму
    authForms.forEach(form => {
      form.classList.remove('active')
      if (form.id === `${tab}-form`) {
        form.classList.add('active')
      }
    })
  })
})

// Обработка формы входа
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const emailOrUsername = document.getElementById('login-email').value
  const password = document.getElementById('login-password').value
  
  // Пытаемся войти с email
  let { data, error } = await supabase.auth.signInWithPassword({
    email: emailOrUsername,
    password: password,
  })
  
  // Если не удалось, возможно, это username, тогда нужно получить email по username
  if (error) {
    // Пробуем найти пользователя по username в таблице public.users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('username', emailOrUsername)
      .single()
    
    if (userError) {
      alert('Неверный логин или пароль')
      return
    }
    
    // Пробуем войти с email, который получили по username
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: password,
    })
    
    if (signInError) {
      alert('Неверный логин или пароль')
      return
    }
  }
  
  // Если успешно, перенаправляем на dashboard.html
  window.location.href = 'dashboard.html'
})

// Обработка формы регистрации
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = document.getElementById('register-email').value
  const username = document.getElementById('register-username').value
  const password = document.getElementById('register-password').value
  const passwordConfirm = document.getElementById('register-password-confirm').value
  
  // Проверка совпадения паролей
  if (password !== passwordConfirm) {
    alert('Пароли не совпадают')
    return
  }
  
  // Регистрация в Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username
      }
    }
  })
  
  if (error) {
    alert(`Ошибка регистрации: ${error.message}`)
    return
  }
  
  alert('Регистрация успешна! Проверьте вашу почту для подтверждения.')
  modal.style.display = 'none'
})
