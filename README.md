# Deploy Static Website using GitHub Actions

This project demonstrates how to automatically deploy a static website to **GitHub Pages** using **GitHub Actions**.

Whenever changes are pushed to the `master` branch, GitHub Actions automatically builds and deploys the .

## 🛠️ Technologies Used

* HTML
* CSS
* JavaScript
* Git
* GitHub
* GitHub Actions
* GitHub Pages

## 📁 Project Structure

```text
project/
├── index.html
├── style.css
├── script.js
└── .github/
    └── workflows/
        └── deploy.yml
```

## 🚀 Deployment Flow

```text
Developer
    ↓
Git Push
    ↓
GitHub Repository
    ↓
GitHub Actions
    ↓
Checkout Repository
    ↓
Configure GitHub Pages
    ↓
Upload Website Files
    ↓
Deploy to GitHub Pages
    ↓
🌐 Live Website
```

## ⚙️ GitHub Actions Workflow

The workflow runs automatically when code is pushed to the `master` branch.

It can also be started manually from the GitHub Actions tab.

```yaml
name: Deploy static content to Pages

on:
  push:
    branches: ["master"]

  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

## 🔑 Important Parts

### 1. Trigger

```yaml
on:
  push:
    branches: ["master"]
```

The workflow runs when changes are pushed to the `master` branch.

### 2. Manual Deployment

```yaml
workflow_dispatch:
```

Allows the workflow to be started manually from the GitHub Actions tab.

### 3. Permissions

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

These permissions allow the workflow to read the repository and deploy to GitHub Pages.

### 4. Checkout

```yaml
uses: actions/checkout@v4
```

Downloads the repository files to the GitHub Actions runner.

### 5. Configure Pages

```yaml
uses: actions/configure-pages@v5
```

Prepares GitHub Pages for the deployment.

### 6. Upload Website

```yaml
uses: actions/upload-pages-artifact@v3
with:
  path: '.'
```

Uploads the website files as a deployment artifact.

### 7. Deploy

```yaml
uses: actions/deploy-pages@v5
```

Deploys the uploaded files to GitHub Pages.

## 🔄 How to Deploy

Make changes to the website and push them:

```bash
git add .
git commit -m "Update website"
git push origin master
```

GitHub Actions will automatically start the deployment.

## 🎯 What I Learned

* How GitHub Actions workflows work
* How to trigger workflows using `push`
* How to manually trigger workflows
* How GitHub Actions permissions work
* How to use GitHub Pages
* How to upload deployment artifacts
* How to deploy a static website automatically
* Basic Continuous Deployment (CD)

## 📌 Project Concept

This project demonstrates a simple **Continuous Deployment pipeline**:

```text
Code Change
    ↓
git push
    ↓
GitHub Actions
    ↓
Deploy
    ↓
GitHub Pages
    ↓
Live Website
```
