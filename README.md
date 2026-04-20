# Hibi 日々 — PWA セットアップ & GitHub Pages 公開手順

iPhoneのホーム画面に追加して、ネイティブアプリのように使えるPWA (Progressive Web App) です。

## 📦 このフォルダの中身

```
pwa/
├── index.html              ← アプリ本体
├── ios-frame.jsx
├── components/             ← 画面ごとのコード
│   ├── data.jsx
│   ├── icons.jsx
│   ├── TaskCell.jsx
│   ├── TodayScreen.jsx
│   ├── CalendarScreen.jsx
│   ├── ListsStatsScreens.jsx
│   ├── AddTaskModal.jsx
│   ├── TaskDetail.jsx
│   └── Chrome.jsx
├── manifest.webmanifest    ← PWA情報
├── sw.js                   ← オフライン動作
├── icon.svg / icon-*.png   ← アプリアイコン
└── README.md
```

全ファイルあわせて1MB未満。GitHubの25MB制限に余裕で収まります。

---

## 🚀 GitHub Pages で公開する手順

### 1. GitHub リポジトリを作成

1. https://github.com/new を開く
2. **Repository name**: 好きな英数字（例: `hibi`）
3. **Public** を選択（重要：Privateだと無料Pagesが使えません）
4. 「Create repository」をクリック

### 2. ファイルをアップロード

リポジトリ画面の「**uploading an existing file**」リンクをクリック。

**⚠️ フォルダごとではなく中身をアップロード**

`pwa` フォルダの中に `index.html` や `components/` が入っていますね。これらを**pwaフォルダの中身ごと**リポジトリ直下に上げます。

#### 方法A: 画面から（components フォルダは要注意）

1. `pwa` フォルダを開く
2. `index.html`、`ios-frame.jsx`、`manifest.webmanifest`、`sw.js`、`README.md`、アイコンPNG/SVG 類 を**全選択してドラッグ&ドロップ**
3. `components` フォルダも**フォルダごとドラッグ&ドロップ**
   - Chromeなら、フォルダをドロップするとサブディレクトリ構造を維持してアップされます
4. 画面下の「**Commit changes**」ボタン

#### 方法B: git コマンド（確実）

```bash
cd pwa
git init
git add .
git commit -m "initial"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/hibi.git
git push -u origin main
```

アップ後、リポジトリのトップに `index.html` と `components/` フォルダが並んでいればOK。

### 3. GitHub Pages を有効化

1. **Settings** タブ → 左メニュー **Pages**
2. **Source**: `Deploy from a branch`
3. **Branch**: `main` / `/ (root)` → **Save**
4. 数十秒〜2分待つと、ページ上部に公開URLが出ます
   - 例: `https://あなたのユーザー名.github.io/hibi/`

### 4. 動作確認（PC）

PCブラウザでURLを開いて、Hibi が起動すれば成功です。

---

## 📱 iPhone のホーム画面に追加

1. **Safari**（⚠️ Chromeではダメ）で公開URLを開く
2. 下部の共有ボタンをタップ
3. **「ホーム画面に追加」** をタップ → 「追加」

ホーム画面のHibiアイコンから起動すると、全画面のネイティブアプリのように動きます。

---

## ❗ よくあるトラブル

| 症状 | 対処 |
|---|---|
| `Yowza, that's a big file. Try again with a file smaller than 25MB.` | **スタンドアロン版は25MB超えます。このフォルダ(分割版)を使ってください** |
| 404 | Pagesの公開完了まで最大2〜3分待つ |
| アイコンが出ない | リポジトリ直下に `icon-192.png` などが並んでいるか確認 |
| 全画面にならない | Safariから「ホーム画面に追加」で追加したアイコンから起動しているか |
| オフラインで動かない | 一度オンラインでアクセスしてSWがキャッシュするのを待つ |
| componentsが読み込まれない | `components/` フォルダがサブディレクトリとしてアップされているか確認（ファイルが直下にバラけていたらNG） |

---

## 🔄 更新するには

ファイルを編集して push（または画面で編集→Commit）するだけ。
キャッシュが強力なので、確実に反映させたいときは `sw.js` の:

```js
const CACHE = 'hibi-v1';  // ← v2, v3... と上げる
```

を変更してください。次回起動時に新しい内容に入れ替わります。

---

## 💡 独自ドメイン

Settings → Pages → **Custom domain** にドメインを入力。
DNSで CNAME を `あなたのユーザー名.github.io` に向ければ完了です。

楽しんでください 🌿
