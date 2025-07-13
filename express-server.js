const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// 複数のポートを試行する設定
const PREFERRED_PORTS = [8005, 8006, 8007, 3000, 3001, 8080, 8081, 9000];
let currentPort = PREFERRED_PORTS[0];

// CORS設定（AR/WebRTC用）
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cache-Control'],
  credentials: true
}));

// セキュリティヘッダー
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// 静的ファイルの配信設定
app.use(express.static('.', {
  setHeaders: (res, path) => {
    // ファイル拡張子に基づくMIMEタイプ設定
    if (path.endsWith('.mov')) {
      res.setHeader('Content-Type', 'video/quicktime');
    } else if (path.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    } else if (path.endsWith('.glb')) {
      res.setHeader('Content-Type', 'model/gltf-binary');
    } else if (path.endsWith('.mind')) {
      res.setHeader('Content-Type', 'application/octet-stream');
    }
  }
}));

// ルートパスでindex.htmlを提供
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 健康チェックエンドポイント
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    server: 'AR Music Visualizer ACOPA'
  });
});

// 404ハンドラー
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.url}`);
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 Not Found</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #e74c3c; }
        a { color: #3498db; text-decoration: none; }
      </style>
    </head>
    <body>
      <h1>404 - File Not Found</h1>
      <p>The requested file <code>${req.url}</code> was not found.</p>
      <p><a href="/">← Go to AR Experience</a></p>
    </body>
    </html>
  `);
});

// エラーハンドラー
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).send('Internal Server Error');
});

// ポートを試行する関数
function tryPort(port, callback) {
  const server = app.listen(port, '127.0.0.1')
    .on('listening', () => {
      callback(null, server, port);
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        callback(err, null, port);
      } else {
        callback(err, null, port);
      }
    });
}

// サーバー起動関数
function startServer() {
  console.log('🚀 Starting AR Music Visualizer ACOPA Server...');
  console.log(`📁 Serving directory: ${path.resolve('.')}`);
  
  let portIndex = 0;
  
  function tryNextPort() {
    if (portIndex >= PREFERRED_PORTS.length) {
      console.error('❌ All preferred ports are in use. Please free up a port and try again.');
      process.exit(1);
    }
    
    const port = PREFERRED_PORTS[portIndex++];
    console.log(`🔍 Trying port ${port}...`);
    
    tryPort(port, (err, server, actualPort) => {
      if (err) {
        if (err.code === 'EADDRINUSE') {
          console.log(`❌ Port ${actualPort} is in use, trying next...`);
          tryNextPort();
        } else {
          console.error(`❌ Error on port ${actualPort}:`, err.message);
          tryNextPort();
        }
      } else {
        currentPort = actualPort;
        console.log('');
        console.log('🎉 AR Music Visualizer ACOPA Server is running!');
        console.log('');
        console.log(`📱 Local:      http://localhost:${actualPort}`);
        console.log(`📱 Local:      http://127.0.0.1:${actualPort}`);
        console.log(`🔍 Health:     http://localhost:${actualPort}/health`);
        console.log('');
        console.log('🎬 AR Video Features:');
        console.log('   ✅ CD jacket marker detection');
        console.log('   ✅ CD opening animation');
        console.log('   ✅ Video playback in AR');
        console.log('   ✅ Fullscreen support');
        console.log('   ✅ CORS enabled for WebRTC');
        console.log('');
        console.log('⚠️  Press Ctrl+C to stop the server');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // グレースフルシャットダウン設定
        process.on('SIGINT', () => {
          console.log('\n🛑 Shutting down server gracefully...');
          server.close(() => {
            console.log('✅ Server closed successfully');
            process.exit(0);
          });
        });
        
        // 健康チェック（5分毎）
        setInterval(() => {
          console.log(`💚 Server alive on port ${actualPort} - ${new Date().toLocaleTimeString()}`);
        }, 300000);
      }
    });
  }
  
  tryNextPort();
}

// サーバー起動
startServer();