import { supabase } from './supabase.js'

// Проверяем, авторизован ли пользователь
const session = await supabase.auth.getSession()
if (!session.data.session) {
  window.location.href = 'index.html'
}

// Получаем текущего пользователя
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  window.location.href = 'index.html'
}

// Получаем роль пользователя из таблицы public.users
const { data: userData, error } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single()

if (error) {
  console.error('Ошибка при получении роли:', error)
  alert('Ошибка при получении роли пользователя')
  window.location.href = 'index.html'
}

const userRole = userData.role

// Показываем или скрываем кнопки панелей в зависимости от роли
if (userRole === 'admin' || userRole === 'owner') {
  document.getElementById('admin-panel-btn').style.display = 'block'
}
if (userRole === 'owner') {
  document.getElementById('owner-panel-btn').style.display = 'block'
}

// Элементы страницы
const clanPlayersBtn = document.getElementById('clan-players-btn')
const topOfClanBtn = document.getElementById('top-of-clan-btn')
const adminPanelBtn = document.getElementById('admin-panel-btn')
const ownerPanelBtn = document.getElementById('owner-panel-btn')
const logoutBtn = document.getElementById('logout-btn')

const clanPlayersSection = document.getElementById('clan-players-section')
const topOfClanSection = document.getElementById('top-of-clan-section')
const adminPanelSection = document.getElementById('admin-panel-section')
const ownerPanelSection = document.getElementById('owner-panel-section')

const playersList = document.getElementById('players-list')
const topPlayersList = document.getElementById('top-players-list')
const adminPlayersList = document.getElementById('admin-players-list')
const adminsList = document.getElementById('admins-list')

const addPlayerBtn = document.getElementById('add-player-btn')
const playerModal = document.getElementById('player-modal')
const playerForm = document.getElementById('player-form')
const playerModalTitle = document.getElementById('player-modal-title')
const thresholdsContainer = document.getElementById('thresholds-container')
const addThresholdBtn = document.getElementById('add-threshold-btn')
const assignAdminForm = document.getElementById('assign-admin-form')

let currentPlayerId = null // для редактирования

// Показать раздел Clan Players
clanPlayersBtn.addEventListener('click', () => {
  hideAllSections()
  clanPlayersSection.style.display = 'block'
  loadPlayers()
})

// Показать раздел Top Of Clan
topOfClanBtn.addEventListener('click', () => {
  hideAllSections()
  topOfClanSection.style.display = 'block'
  loadTopPlayers()
})

// Показать раздел Admin Panel
adminPanelBtn.addEventListener('click', () => {
  hideAllSections()
  adminPanelSection.style.display = 'block'
  loadAdminPlayers()
})

// Показать раздел Owner Panel
ownerPanelBtn.addEventListener('click', () => {
  hideAllSections()
  ownerPanelSection.style.display = 'block'
  loadAdmins()
})

// Выход
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut()
  window.location.href = 'index.html'
})

function hideAllSections() {
  clanPlayersSection.style.display = 'none'
  topOfClanSection.style.display = 'none'
  adminPanelSection.style.display = 'none'
  ownerPanelSection.style.display = 'none'
}

// Загрузка игроков для Clan Players
async function loadPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Ошибка при загрузке игроков:', error)
    return
  }
  
  playersList.innerHTML = ''
  
  data.forEach(player => {
    const playerCard = document.createElement('div')
    playerCard.className = 'player-card'
    playerCard.innerHTML = `
      <h3 class="player-name">${player.name}</h3>
      <p class="player-title">${player.title || ''}</p>
      <p class="player-description">${player.description || ''}</p>
      <div class="threshold-badges">
        ${player.thresholds.map(t => `<div class="threshold-badge">${t.type}: ${t.level} ур.</div>`).join('')}
      </div>
    `
    playersList.appendChild(playerCard)
  })
}

// Загрузка топ игроков для Top Of Clan
async function loadTopPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .not('rank', 'is', null)
    .order('rank')
  
  if (error) {
    console.error('Ошибка при загрузке топ игроков:', error)
    return
  }
  
  topPlayersList.innerHTML = ''
  
  data.forEach(player => {
    const playerCard = document.createElement('div')
    playerCard.className = 'player-card'
    playerCard.innerHTML = `
      <div class="player-rank">TOP ${player.rank}</div>
      <div class="player-info">
        <div class="player-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div>
          <h3 class="player-name">${player.name}</h3>
          <div class="player-title">${player.title || ''}</div>
        </div>
      </div>
      <div class="threshold-badges">
        ${player.thresholds.map(t => `<div class="threshold-badge">${t.type}: ${t.level} ур.</div>`).join('')}
      </div>
      <p class="player-description">${player.description || ''}</p>
    `
    topPlayersList.appendChild(playerCard)
  })
}

// Загрузка игроков для админ панели
async function loadAdminPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Ошибка при загрузке игроков для админа:', error)
    return
  }
  
  adminPlayersList.innerHTML = ''
  
  data.forEach(player => {
    const playerItem = document.createElement('div')
    playerItem.className = 'player-item'
    playerItem.innerHTML = `
      <div>
        <h3>${player.name} <span class="player-title">${player.title || ''}</span></h3>
        <p>${player.description || ''}</p>
        <div class="threshold-badges">
          ${player.thresholds.map(t => `<div class="threshold-badge">${t.type}: ${t.level} ур.</div>`).join('')}
        </div>
      </div>
      <div class="player-actions">
        <button class="btn-small edit-player" data-id="${player.id}">Изменить</button>
        <button class="btn-small delete-player" data-id="${player.id}">Удалить</button>
      </div>
    `
    adminPlayersList.appendChild(playerItem)
  })
  
  // Добавляем обработчики для кнопок редактирования и удаления
  document.querySelectorAll('.edit-player').forEach(btn => {
    btn.addEventListener('click', () => {
      const playerId = btn.getAttribute('data-id')
      editPlayer(playerId)
    })
  })
  
  document.querySelectorAll('.delete-player').forEach(btn => {
    btn.addEventListener('click', () => {
      const playerId = btn.getAttribute('data-id')
      deletePlayer(playerId)
    })
  })
}

// Загрузка списка администраторов для владельца
async function loadAdmins() {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, username, role')
    .in('role', ['admin', 'owner'])
  
  if (error) {
    console.error('Ошибка при загрузке администраторов:', error)
    return
  }
  
  adminsList.innerHTML = ''
  
  data.forEach(user => {
    const adminItem = document.createElement('div')
    adminItem.className = 'admin-item'
    adminItem.innerHTML = `
      <div>
        <h3>${user.username} (${user.email})</h3>
        <p>Роль: ${user.role}</p>
      </div>
      ${user.role !== 'owner' ? `<button class="btn-small remove-admin" data-id="${user.id}">Убрать админа</button>` : ''}
    `
    adminsList.appendChild(adminItem)
  })
  
  // Обработчики для кнопок убрать админа
  document.querySelectorAll('.remove-admin').forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = btn.getAttribute('data-id')
      removeAdmin(userId)
    })
  })
}

// Открытие модального окна для добавления игрока
addPlayerBtn.addEventListener('click', () => {
  currentPlayerId = null
  playerModalTitle.textContent = 'Добавить игрока'
  playerForm.reset()
  thresholdsContainer.innerHTML = ''
  openPlayerModal()
})

// Добавление порога
addThresholdBtn.addEventListener('click', () => {
  const thresholdDiv = document.createElement('div')
  thresholdDiv.className = 'threshold-input'
  thresholdDiv.innerHTML = `
    <select class="threshold-type">
      <option value="Сила">Порог Силы</option>
      <option value="Меткость">Порог Меткости</option>
      <option value="Защита">Порог Защиты</option>
      <option value="Скорость">Порог Скорости</option>
    </select>
    <input type="number" class="threshold-level" min="1" max="4" value="1">
    <button type="button" class="btn-small remove-threshold">Удалить</button>
  `
  thresholdsContainer.appendChild(thresholdDiv)
  
  thresholdDiv.querySelector('.remove-threshold').addEventListener('click', () => {
    thresholdDiv.remove()
  })
})

// Открытие модального окна
function openPlayerModal() {
  playerModal.style.display = 'block'
}

// Закрытие модального окна
playerModal.querySelector('.close-modal').addEventListener('click', () => {
  playerModal.style.display = 'none'
})

window.addEventListener('click', (event) => {
  if (event.target === playerModal) {
    playerModal.style.display = 'none'
  }
})

// Обработка формы игрока
playerForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  
  const name = document.getElementById('player-name').value
  const title = document.getElementById('player-title').value
  const description = document.getElementById('player-description').value
  const rank = document.getElementById('player-rank').value
  
  // Собираем пороги
  const thresholds = []
  document.querySelectorAll('.threshold-input').forEach(input => {
    const type = input.querySelector('.threshold-type').value
    const level = input.querySelector('.threshold-level').value
    thresholds.push({ type, level: parseInt(level) })
  })
  
  if (currentPlayerId) {
    // Обновление игрока
    const { error } = await supabase
      .from('players')
      .update({ name, title, description, rank: parseInt(rank), thresholds })
      .eq('id', currentPlayerId)
    
    if (error) {
      alert('Ошибка при обновлении игрока')
      return
    }
    
    alert('Игрок обновлен')
  } else {
    // Добавление нового игрока
    const { error } = await supabase
      .from('players')
      .insert([{ name, title, description, rank: parseInt(rank), thresholds }])
    
    if (error) {
      alert('Ошибка при добавлении игрока')
      return
    }
    
    alert('Игрок добавлен')
  }
  
  playerModal.style.display = 'none'
  
  // Перезагружаем списки
  if (clanPlayersSection.style.display === 'block') {
    loadPlayers()
  }
  if (topOfClanSection.style.display === 'block') {
    loadTopPlayers()
  }
  if (adminPanelSection.style.display === 'block') {
    loadAdminPlayers()
  }
})

// Редактирование игрока
async function editPlayer(playerId) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single()
  
  if (error) {
    alert('Ошибка при загрузке игрока')
    return
  }
  
  currentPlayerId = playerId
  playerModalTitle.textContent = 'Изменить игрока'
  
  document.getElementById('player-name').value = data.name
  document.getElementById('player-title').value = data.title || ''
  document.getElementById('player-description').value = data.description || ''
  document.getElementById('player-rank').value = data.rank || 10
  
  thresholdsContainer.innerHTML = ''
  data.thresholds.forEach(t => {
    const thresholdDiv = document.createElement('div')
    thresholdDiv.className = 'threshold-input'
    thresholdDiv.innerHTML = `
      <select class="threshold-type">
        <option value="Сила" ${t.type === 'Сила' ? 'selected' : ''}>Порог Силы</option>
        <option value="Меткость" ${t.type === 'Меткость' ? 'selected' : ''}>Порог Меткости</option>
        <option value="Защита" ${t.type === 'Защита' ? 'selected' : ''}>Порог Защиты</option>
        <option value="Скорость" ${t.type === 'Скорость' ? 'selected' : ''}>Порог Скорости</option>
      </select>
      <input type="number" class="threshold-level" min="1" max="4" value="${t.level}">
      <button type="button" class="btn-small remove-threshold">Удалить</button>
    `
    thresholdsContainer.appendChild(thresholdDiv)
    
    thresholdDiv.querySelector('.remove-threshold').addEventListener('click', () => {
      thresholdDiv.remove()
    })
  })
  
  openPlayerModal()
}

// Удаление игрока
async function deletePlayer(playerId) {
  if (!confirm('Вы уверены, что хотите удалить этого игрока?')) {
    return
  }
  
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', playerId)
  
  if (error) {
    alert('Ошибка при удалении игрока')
    return
  }
  
  alert('Игрок удален')
  loadAdminPlayers()
}

// Назначение администратора (только владелец)
assignAdminForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  
  const email = document.getElementById('user-email').value
  
  // Находим пользователя по email
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()
  
  if (userError) {
    alert('Пользователь с таким email не найден')
    return
  }
  
  // Назначаем роль admin
  const { error } = await supabase
    .from('users')
    .update({ role: 'admin' })
    .eq('id', userData.id)
  
  if (error) {
    alert('Ошибка при назначении администратора')
    return
  }
  
  alert('Пользователь назначен администратором')
  loadAdmins()
  assignAdminForm.reset()
})

// Убрать роль администратора
async function removeAdmin(userId) {
  if (!confirm('Вы уверены, что хотите убрать роль администратора у этого пользователя?')) {
    return
  }
  
  const { error } = await supabase
    .from('users')
    .update({ role: 'user' })
    .eq('id', userId)
  
  if (error) {
    alert('Ошибка при изменении роли')
    return
  }
  
  alert('Роль администратора убрана')
  loadAdmins()
}
