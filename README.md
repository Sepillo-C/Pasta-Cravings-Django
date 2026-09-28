# 🍝 Pasta Cravings

Django-based management and POS system for Pasta Cravings.

## 📁 Project Structure

```text
apps/
├── accounts/          # Login, users, roles
├── customers/         # Customer records
├── dashboard/         # Dashboard
├── expenses/          # Expenses
├── inventory/         # Inventory and stock
├── orders/            # Orders
├── pos/               # Point of Sale
├── products/          # Products
├── reports/           # Reports
├── system_settings/   # System settings
└── transactions/      # Transactions
```

## 🧑‍💻 Where To Work

```text
Python / Django → apps/<your_app>/
HTML            → templates/<your_app>/
CSS             → static/css/
JavaScript      → static/js/
Images          → static/images/
Icons           → static/icons/
```

## 🌱 Git Reminder

**Always create your own branch before working.**

```bash
git pull
git checkout -b your-branch-name
```

After working:

```bash
git add .
git commit -m "Describe your changes"
git push origin your-branch-name
```

**Push your work to your branch, NOT `main`.**

This helps prevent conflicts and errors when merging everyone's work.

## 🗄️ If You Change Models

```bash
python manage.py makemigrations
python manage.py migrate
```

## ⚠️ Important

Don't randomly change:

```text
pasta_cravings/settings.py
pasta_cravings/urls.py
manage.py
```

Ask the team first if you need to modify them.

## 🖥️ Run the Project

```bash
venv\Scripts\activate
python manage.py runserver
```

**Keep your work inside your assigned app and don't overwrite someone else's work.**
