# Bobix Corporation - Система управления кланом

## Настройка проекта

### 1. Настройка Supabase

1. Зайдите на https://supabase.com и создайте проект
2. Используйте предоставленные URL и ключ
3. В SQL Editor создайте таблицы:

```sql
-- Таблица пользователей
CREATE TABLE users (
    id UUID REFERENCES auth.users PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица игроков
CREATE TABLE players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT,
    description TEXT,
    thresholds TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Включите Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Политики доступа
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can update users" ON users
    FOR UPDATE USING (auth.uid() IN (
        SELECT id FROM users WHERE role IN ('admin', 'owner')
    ));

CREATE POLICY "Everyone can read players" ON players
    FOR SELECT USING (true);

CREATE POLICY "Admins can modify players" ON players
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM users WHERE role IN ('admin', 'owner')
    ));
