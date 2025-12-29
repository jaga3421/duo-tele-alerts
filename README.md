# Tele-Assistant 🤖

A modular, automated assistant for tracking Duolingo streaks and sending Telegram notifications. Built with TypeScript, Playwright, and Node.js.

## Maintainer
📧 **Jaga**: [jagadeesh.jkp@gmail.com](mailto:jagadeesh.jkp@gmail.com)

## GitHub Actions (Automated Run)

This project is designed to run securely in the cloud via **GitHub Actions** (Scheduled for 11:00 PM & 11:30 PM IST).

### Setup for Cloud
1.  Go to your Repository **Settings** -> **Secrets and variables** -> **Actions**.
2.  Add the following Repository Secrets:

| Secret Name | Description |
|-------------|-------------|
| `TELEGRAM_BOT_TOKEN` | Your Telegram Bot Token (from @BotFather) |
| `TELEGRAM_CHAT_ID` | Your Chat ID (e.g. `-100...`) |
| `USERS_CONFIG_JSON` | The **content** of your `config/users.json` file |

Once configured, the "Daily Scrape" workflow will run automatically. You can also trigger it manually from the **Actions** tab.

---

## Local Deployment

If you want to run this locally on your machine:

### 1. Installation

```bash
# 1. Download necessary browsers first
npx playwright install

# 2. Install project dependencies
npm install
```

### 2. Configuration

**Environment Variables**
Create `.env` file:
```bash
cp .env.example .env
# Edit .env with your TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
```

**User Config**
Create `users.json`:
```bash
cp config/users.example.json config/users.json
# Edit config/users.json with your Duolingo usernames
```

### 3. Build & Run

**Build** (Required before running):
```bash
npm run build
```

**Run Scraper**:
```bash
npm run scrape -- duolingo
```

---

## Contributing

We welcome contributions! Please follow this workflow:

1.  **Clone the repo**:
    ```bash
    git clone https://github.com/jaga3421/tele-assistant.git
    ```
2.  **Create a Branch**:
    (Never work directly on `main` or `dev`)
    ```bash
    git checkout -b feature/my-new-feature
    ```
3.  **Make Changes & Verify**:
    Ensure the build passes (Husky will check this automatically):
    ```bash
    npm run build
    ```
4.  **Commit and Push**:
    ```bash
    git commit -m "feat: Add cool new feature"
    git push origin feature/my-new-feature
    ```
5.  **Create a Pull Request** on GitHub to merge into `dev`.
