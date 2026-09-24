# BOSS RP — Google / Discord login setup

Сайт уже має готовий OAuth-код. Щоб вхід був реально робочим і прогрес синхронізувався між телефонами/ПК, треба один раз підключити Supabase.

## 1. Створи Supabase project
1. Відкрий https://supabase.com/ і створи проєкт.
2. У Supabase відкрий SQL Editor.
3. Встав увесь файл supabase.sql і натисни Run.
4. Відкрий Project Settings -> API.
5. Скопіюй Project URL та anon/publishable key.
6. Відкрий supabase-config.js у цьому репозиторії і заміни два placeholder-и.

## 2. Дозволь GitHub Pages
У Supabase відкрий Authentication -> URL Configuration.
- Site URL: https://stanislavrudenko26-tech.github.io
- Redirect URL: https://stanislavrudenko26-tech.github.io/Boss-RP-demo/

## 3. Google
У Authentication -> Sign In / Providers -> Google увімкни Google.
Створи Web OAuth client у Google Cloud і додай URL, який Supabase показує як callback URL, до Authorized redirect URIs. Потім встав Client ID і Client Secret у налаштування Google provider у Supabase.

## 4. Discord
У Discord Developer Portal створи Application -> OAuth2.
У Redirects додай callback URL, який Supabase показує в Authentication -> Providers -> Discord.
Скопіюй Client ID/Secret у Supabase та увімкни Discord provider.

## 5. Що вже працює в коді
- Google OAuth
- Discord OAuth
- автоматичне повернення на BOSS RP після входу
- збереження сесії
- профіль за UUID користувача
- баланс, coins, рівень, XP і статистика зберігаються в PostgreSQL
- RLS не дає одному користувачу читати профіль іншого
- баланс/рівень не можна змінити з браузера напряму; для економіки використовуй адмінку або серверну функцію

Важливо: anon/publishable key можна використовувати у фронтенді. service_role або secret key у supabase-config.js вставляти не можна.
