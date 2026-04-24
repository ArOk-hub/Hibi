# Hibi 日々 — デプロイ手順書

Firebase Console の設定は完了済み。ここからはコードをデプロイして動かすまで。

所要時間：**10〜15分**（初回のみ npm install で少し待つ）

---

## 📋 前提

- Firebase Console で設定済み（config・VAPID鍵取得済み、Firestore作成済み、Blazeプラン）
- `firebase --version` が動く（未インストールなら `curl -sL https://firebase.tools | bash`）
- Node.js 20 以上（`node --version` で確認。未導入なら https://nodejs.org/ から LTS を）

---

## ステップ 1：Firebase にログイン

```bash
cd pwa
firebase login
```

ブラウザでGoogleログインを求められたら許可。

---

## ステップ 2：プロジェクトを紐付け（確認のみ）

`.firebaserc` に `hibi-todo` が書いてあるので通常は不要ですが、念のため：

```bash
firebase use hibi-todo
```

`Now using project hibi-todo` と出れば OK。

---

## ステップ 3：Cloud Functions の依存インストール

```bash
cd functions
npm install
cd ..
```

初回は 2〜3 分かかります。

---

## ステップ 4：デプロイ（3つ同時）

```bash
firebase deploy --only firestore:rules,functions
```

これで以下がデプロイされます：
- **Firestore セキュリティルール**（`firestore.rules`）
- **Cloud Function**（`sendReminders` — 1分ごとに実行）

初回デプロイ時に「Cloud Scheduler API を有効化しますか？」「Pub/Sub API を有効化しますか？」と聞かれたら **yes**。

完了すると以下のようなURLが出ます：
```
✔  functions[sendReminders(asia-northeast1)] Successful create operation.
```

---

## ステップ 5：アプリをGitHub Pages にデプロイ

（既存のGitHub Pagesワークフローをそのまま使えます。）

`pwa/` フォルダの中身が公開されればOK。以下のファイルが含まれていることを確認：
- `index.html`
- `firebase-config.js`
- `firebase-client.js`
- `firebase-messaging-sw.js`  ← 重要（push通知の要）
- `sw.js`
- `components/` 以下全部
- `manifest.webmanifest`, アイコン類

⚠️ `firebase-messaging-sw.js` は **ルート直下** にないと動きません（Service Worker のスコープ制約）。

---

## ステップ 6：動作確認

### 6-1. アプリを開く

GitHub Pages のURLをスマホ（またはPCのChrome）で開く。

### 6-2. 通知を有効化

今日タブを開くと、上部に「リマインド通知を受け取る」バナーが表示される → **「有効化」** タップ。

- ブラウザが通知許可を聞いてくる → 許可
- バナーが「通知を有効化しました」に変わればOK

### 6-3. Firestore を確認

Firebase Console → Firestore Database で見ると、`users/{uid}` ドキュメントに `tokens: [...]` が入っているはず。

### 6-4. 通知テスト

1. アプリで新しいタスクを作る
2. 日時を **2〜3分後** に設定
3. リマインドを「時刻通り」に設定
4. アプリを **完全に閉じる**（PWAならバックグラウンドに）
5. 設定時刻に通知が届けばOK 🎉

届かない時は下の🆘へ。

---

## ステップ 7（任意）：実行ログ確認

Cloud Function が動いてるか見たい時：

```bash
firebase functions:log --only sendReminders
```

1分おきに `reminders tick { scanned, sent, skipped, users }` というログが出ます。

---

## 🆘 トラブルシュート

### 通知が届かない
1. **ブラウザで通知許可を与えているか？** → サイト設定で「通知：許可」になっているか
2. **Firestore の `users/{uid}.tokens` にトークンが入っているか？** → Console で確認
3. **タスクが Firestore に同期されているか？** → `users/{uid}/tasks/` を確認。`due`, `remind` が入っているか
4. **Cloud Function のログにエラーは？** → `firebase functions:log`
5. **iOS Safari の PWA** → ホーム画面に追加した状態でのみ通知受信可能。Safari タブ内では届きません（iOS仕様）

### デプロイでエラー "Billing must be enabled"
→ Blaze プランになっていない。Firebase Console で切り替え。

### "Failed to get Firebase project"
→ `firebase use hibi-todo` を再実行、または `firebase login --reauth`

### Cloud Function が古いコードのまま
→ `firebase deploy --only functions --force` で強制再デプロイ

---

## 📝 今後の改善候補

- **送信済みキャッシュをユーザー別にバッチ書き込み**：今は1通信1書き込みだが、大量タスクで無駄。
- **`nextRemindAt` フィールドを導入**：全タスクスキャンを collection-group クエリに置き換え、スケーラビリティ改善。
- **通知タップで該当タスクを開く**：現在は `./` を開くだけ。`data.taskId` を使って直接詳細を開ける。
- **Web Push の本文カスタム**：絵文字、カテゴリ色、完了ボタンなど。

必要になったら声をかけてください。
