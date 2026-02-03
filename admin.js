import { supabase } from './supabase.js'

async function loadAdminPanel() {
    const { data: players } = await supabase
        .from('players')
        .select('*')
    
    const adminList = document.getElementById('admin-players-list')
    adminList.innerHTML = `
        <table class="players-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Имя</th>
                    <th>Титул</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                ${players.map(player => `
                    <tr>
                        <td>${player.id}</td>
                        <td>${player.name}</td>
                        <td>${player.title || ''}</td>
                        <td>
                            <button class="edit-btn" onclick="editPlayer('${player.id}')">Изменить</button>
                            <button class="delete-btn" onclick="deletePlayer('${player.id}')">Удалить</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `
}

async function loadOwnerPanel() {
    // Загрузка списка пользователей
    const { data: users } = await supabase
        .from('users')
        .select('*')
    
    const usersSelect = document.getElementById('usersList')
    usersSelect.innerHTML = users
        .filter(u => u.role !== 'owner')
        .map(u => `<option value="${u.id}">${u.username} (${u.email}) - ${u.role}</option>`)
        .join('')
    
    // Назначение админа
    document.getElementById('makeAdminBtn').addEventListener('click', async () => {
        const userId = usersSelect.value
        
        const { error } = await supabase
            .from('users')
            .update({ role: 'admin' })
            .eq('id', userId)
        
        if (error) {
            alert('Ошибка: ' + error.message)
        } else {
            alert('Пользователь назначен администратором!')
            loadOwnerPanel()
        }
    })
}

// Глобальные функции для кнопок
window.editPlayer = async (playerId) => {
    const newName = prompt('Введите новое имя игрока:')
    if (newName) {
        const { error } = await supabase
            .from('players')
            .update({ name: newName })
            .eq('id', playerId)
        
        if (!error) {
            alert('Игрок обновлен!')
            loadAdminPanel()
        }
    }
}

window.deletePlayer = async (playerId) => {
    if (confirm('Удалить этого игрока?')) {
        const { error } = await supabase
            .from('players')
            .delete()
            .eq('id', playerId)
        
        if (!error) {
            alert('Игрок удален!')
            loadAdminPanel()
        }
    }
}
