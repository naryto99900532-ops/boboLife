import { supabase } from './supabase.js'

// Добавление нового игрока
document.getElementById('newPlayerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const playerName = document.getElementById('playerName').value
    const playerTitle = document.getElementById('playerTitle').value
    const playerDescription = document.getElementById('playerDescription').value
    const playerThresholds = document.getElementById('playerThresholds').value
    
    const { error } = await supabase
        .from('players')
        .insert([
            {
                name: playerName,
                title: playerTitle,
                description: playerDescription,
                thresholds: playerThresholds
            }
        ])
    
    if (error) {
        alert('Ошибка добавления игрока: ' + error.message)
    } else {
        alert('Игрок добавлен!')
        document.getElementById('newPlayerForm').reset()
        loadPlayers()
    }
})
