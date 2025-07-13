#!/bin/bash

echo "🚀 Starting AR Music Visualizer ACOPA Server..."
echo ""

# プロジェクトディレクトリに移動
cd "$(dirname "$0")"

echo "📁 Current directory: $(pwd)"
echo "📋 Files in directory:"
ls -la

echo ""
echo "🔍 Checking for required files..."

# 必要なファイルの存在確認
required_files=("index.html" "script.js" "style.css" "assets/targets.mind" "assets/acopa_movie.mov")
missing_files=()

for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file"
    else
        echo "❌ $file"
        missing_files+=("$file")
    fi
done

if [[ ${#missing_files[@]} -gt 0 ]]; then
    echo ""
    echo "⚠️  Missing required files. Please ensure all files are present."
    exit 1
fi

echo ""
echo "🔍 Checking available ports..."

# ポートチェック関数
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # ポートが使用中
    else
        return 0  # ポートが利用可能
    fi
}

# 利用可能なポートを検索
ports=(8005 8006 8007 3000 3001 8080 8081 9000)
available_port=""

for port in "${ports[@]}"; do
    if check_port $port; then
        available_port=$port
        echo "✅ Port $port is available"
        break
    else
        echo "❌ Port $port is in use"
    fi
done

if [[ -z "$available_port" ]]; then
    echo "❌ No available ports found. Please free up a port and try again."
    exit 1
fi

echo ""
echo "🚀 Starting server on port $available_port..."
echo ""

# Node.jsサーバーを起動
if command -v node >/dev/null 2>&1; then
    echo "📦 Using Node.js server..."
    node stable-server.js
elif command -v python3 >/dev/null 2>&1; then
    echo "🐍 Node.js not found, using Python3 server..."
    python3 -m http.server $available_port --bind 127.0.0.1
elif command -v python >/dev/null 2>&1; then
    echo "🐍 Using Python2 server..."
    python -m SimpleHTTPServer $available_port
else
    echo "❌ Neither Node.js nor Python found. Please install one of them."
    exit 1
fi