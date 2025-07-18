# AR Music Visualizer - ACOPA

CDジャケットをマーカーとして使用し、CDが開くような演出で動画を再生するARアプリケーションです。

## 機能

- 📸 **マーカー検知**: CDジャケットをカメラで読み取り
- 💿 **CD演出**: マーカー検知時にCDケースが開くアニメーション
- 🎬 **動画再生**: CDが開いた後に動画が表示・再生
- 📱 **レスポンシブ対応**: モバイルデバイスでも快適に動作
- 🔍 **フルスクリーン**: 動画をフルスクリーンで視聴可能

## 使用技術

- **A-Frame**: WebVRフレームワーク
- **MindAR**: WebARライブラリ
- **HTML5 Video**: 動画再生
- **CSS3**: アニメーションとスタイリング

## セットアップ

### 1. ファイル構成

```
ar-music-visualizer-acopa/
├── index.html                    # メインHTMLファイル
├── script.js                     # JavaScript制御ファイル
├── style.css                     # スタイルシート
├── assets/
│   ├── targets.mind              # ARマーカーファイル
│   ├── acopa_movie_optimized.mp4 # 最適化済み動画ファイル（29MB）
│   ├── 1.png                     # CDジャケット表面画像
│   ├── 2.png                     # CDジャケット裏面画像
│   └── TechConnectロゴ (4).png   # ロゴファイル
└── README.md
```

### 2. GitHub Pages デプロイ（推奨）

本プロジェクトはGitHub Pagesで静的ホスティングされています:

```bash
# 本番環境
https://techconnect-em.github.io/ar-music-visualizer-acopa/
```

### 3. ローカル開発（オプション）

HTTPSまたはHTTPサーバーが必要です（WebRTCのため）:

```bash
# Python 3を使用
python3 -m http.server 8080

# Live Serverを使用（VS Code拡張）
右クリック → "Open with Live Server"
```

### 4. アクセス

- **本番**: GitHub Pagesの公開URLにアクセス
- **開発**: ブラウザで `http://localhost:8080` にアクセス

## 使用方法

### 基本操作

1. **カメラ許可**: 初回アクセス時にカメラの使用を許可してください
2. **マーカースキャン**: CDジャケットをカメラに向けてください
3. **CD演出**: マーカーが検知されるとCDケースが開きます
4. **動画再生**: 再生ボタンをタップして動画をお楽しみください

### コントロールボタン

- 🎮 **中央の大きなボタン**: 動画の再生/停止
- 🌐 **地球アイコン**: 公式ウェブサイトへリンク
- 📺 **拡張アイコン**: フルスクリーン表示の切り替え

## トラブルシューティング

### マーカーが検知されない場合

- 照明が十分明るいことを確認
- マーカー（CDジャケット）がカメラの中央に来るよう調整
- カメラとマーカーの距離を調整（20-50cm程度が最適）
- マーカーが平らで反射していないことを確認

### 動画が再生されない場合

- ブラウザが動画形式をサポートしているか確認
- ネットワーク接続を確認
- ブラウザのコンソールでエラーメッセージを確認
- 音声の自動再生がブロックされている可能性があります（手動で再生ボタンを押してください）

### パフォーマンスの問題

- 他のアプリを閉じてメモリを確保
- ブラウザを再起動
- デバイスを再起動

## 対応ブラウザ

- ✅ Chrome (Android/iOS/Desktop)
- ✅ Safari (iOS/macOS)
- ✅ Firefox (Android/Desktop)
- ⚠️ Edge (一部機能制限あり)

## セキュリティ

### プライバシー保護

- **カメラアクセス**: 本アプリは画像処理のみでカメラを使用し、映像を保存・送信しません
- **データ収集**: ユーザーデータの収集・送信は一切行いません
- **静的ホスティング**: GitHub Pagesでサーバーレス実行され、バックエンドデータベースは使用しません

### セキュリティ対策

- **HTTPS配信**: GitHub Pagesで自動的にHTTPS配信
- **CSP対応**: コンテンツセキュリティポリシーに準拠
- **XSS対策**: サニタイズ処理とエスケープ処理を実装
- **機密情報**: APIキーや機密データは含まれていません

### 安全な使用のために

- 信頼できるネットワークでアクセスしてください
- ブラウザを最新版に保ちください
- 公開Wi-Fiでの使用時は注意してください

## 開発者向け情報

### デバッグ機能

ブラウザのコンソールで以下のデバッグ機能が利用できます:

```javascript
// 状態確認
window.debugAR.logStatus();

// CDケースを強制的に開く
window.debugAR.openCDCase();

// CDケースを閉じる
window.debugAR.closeCDCase();

// 動画を再生
window.debugAR.playVideo();

// 動画を停止
window.debugAR.pauseVideo();
```

### カスタマイズ

- `assets/acopa_movie.mov`: 動画ファイルを差し替え
- `assets/targets.mind`: マーカーファイルを変更
- `style.css`: デザインのカスタマイズ
- `script.js`: 動作ロジックの調整

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## クレジット

- 開発: TechConnect
- 音楽: ACOPA
- AR技術: MindAR
- 3D技術: A-Frame

---

## サポート

質問やバグ報告は [Instagram @techconnect.em](https://www.instagram.com/techconnect.em/) までご連絡ください。