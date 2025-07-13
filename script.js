document.addEventListener('DOMContentLoaded', () => {
    // 定数定義
    const VIDEO_ASSET_ID = 'video-asset';
    
    // DOM要素の取得
    const videoControl = document.getElementById('video-control');
    const videoAsset = document.getElementById(VIDEO_ASSET_ID);
    const scanningOverlay = document.getElementById('scanning-overlay');
    const scene = document.querySelector('a-scene');
    const websiteButton = document.getElementById('website-button');
    const youtubeButton = document.getElementById('youtube-button');
    const mindarTarget = document.querySelector('[mindar-image-target]');
    
    // ページ要素の取得
    const pageFlip = document.getElementById('page-flip');
    const videoScreen = document.getElementById('video-screen');
    const titleText = document.getElementById('title-text');
    
    // シークバー要素の取得
    const seekbarContainer = document.getElementById('seekbar-container');
    const seekbar = document.getElementById('seekbar');
    const seekbarProgress = document.getElementById('seekbar-progress');
    const seekbarHandle = document.getElementById('seekbar-handle');
    const currentTimeSpan = document.getElementById('current-time');
    const durationTimeSpan = document.getElementById('duration-time');
    
    // 状態管理
    let isTargetFound = false;
    let isPlaying = false;
    let isPageFlipped = false;
    let isDragging = false;
    
    // iOS Safari検出
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // iOS Safari用テクスチャ更新システム
    let iOSTextureUpdater = null;
    
    // 初期化
    init();

    function init() {
        // 動画の初期設定
        if (videoAsset) {
            videoAsset.muted = true;
            videoAsset.loop = true;
            videoAsset.preload = isIOS ? 'metadata' : 'auto';
            
            // iOS Safari対応の追加設定
            if (isIOS) {
                videoAsset.setAttribute('playsinline', 'true');
                videoAsset.setAttribute('webkit-playsinline', 'true');
                videoAsset.playsInline = true;
                console.log('📱 iOS Safari対応設定を適用');
            }
            
            // 動画のデバッグイベントリスナー
            videoAsset.addEventListener('loadstart', () => {
                console.log('📹 Video load started...');
            });
            
            videoAsset.addEventListener('loadedmetadata', () => {
                console.log('📹 Video metadata loaded:', {
                    duration: videoAsset.duration,
                    videoWidth: videoAsset.videoWidth,
                    videoHeight: videoAsset.videoHeight
                });
            });
            
            videoAsset.addEventListener('canplaythrough', () => {
                console.log('📹 Video can play through without buffering');
            });
            
            videoAsset.addEventListener('error', (e) => {
                console.error('❌ Video error:', e, videoAsset.error);
            });
            
            videoAsset.addEventListener('stalled', () => {
                console.warn('⚠️ Video stalled - network issues?');
            });
        }
        
        // イベントリスナーの設定
        setupEventListeners();
        
        // シークバーの初期化
        setupSeekbar();
        
        // iOS Safari用テクスチャ更新システムの初期化
        if (isIOS && isSafari) {
            setupiOSTextureUpdater();
        }
        
        console.log('AR Video Player initialized');
        console.log('Video asset:', videoAsset);
        console.log('iOS Safari mode:', isIOS && isSafari);
    }
    
    // iOS Safari用テクスチャ更新システム
    function setupiOSTextureUpdater() {
        const videoScreen = document.getElementById('video-screen');
        if (!videoScreen || !videoAsset) return;
        
        function updateTexture() {
            try {
                const mesh = videoScreen.getObject3D('mesh');
                if (mesh && mesh.material && mesh.material.map && !videoAsset.paused) {
                    mesh.material.map.needsUpdate = true;
                }
            } catch (error) {
                console.warn('📱 iOS texture update error:', error);
            }
        }
        
        // 再生開始時にテクスチャ更新を開始
        videoAsset.addEventListener('play', () => {
            if (iOSTextureUpdater) clearInterval(iOSTextureUpdater);
            iOSTextureUpdater = setInterval(updateTexture, 50); // 20fps
            console.log('📱 iOS Safari テクスチャ更新開始');
        });
        
        // 停止時にテクスチャ更新を終了
        videoAsset.addEventListener('pause', () => {
            if (iOSTextureUpdater) {
                clearInterval(iOSTextureUpdater);
                iOSTextureUpdater = null;
                console.log('📱 iOS Safari テクスチャ更新停止');
            }
        });
        
        videoAsset.addEventListener('ended', () => {
            if (iOSTextureUpdater) {
                clearInterval(iOSTextureUpdater);
                iOSTextureUpdater = null;
            }
        });
        
        console.log('📱 iOS Safari テクスチャ更新システム初期化完了');
    }

    function setupEventListeners() {
        // マーカー検知イベント
        scene.addEventListener('targetFound', handleTargetFound);
        scene.addEventListener('targetLost', handleTargetLost);
        
        // ボタンイベント
        videoControl.addEventListener('click', toggleVideo);
        websiteButton.addEventListener('click', openWebsite);
        youtubeButton.addEventListener('click', openYoutube);
        
        // 動画イベント
        if (videoAsset) {
            videoAsset.addEventListener('loadeddata', () => {
                console.log('Video loaded successfully');
            });
            
            videoAsset.addEventListener('error', (e) => {
                console.error('Video loading error:', e);
            });
        }
        
        // エラーハンドリング
        scene.addEventListener('error', (e) => {
            console.error('A-Frame scene error:', e);
        });
    }

    function handleTargetFound() {
        console.log('Target found - flipping page');
        isTargetFound = true;
        
        // スキャンオーバーレイを非表示
        scanningOverlay.classList.add('fade-out');
        
        // ページをめくるアニメーション
        flipPage();
    }

    function handleTargetLost() {
        console.log('Target lost - unflipping page');
        isTargetFound = false;
        
        // スキャンオーバーレイを表示
        scanningOverlay.classList.remove('fade-out');
        
        // ページを元に戻す
        unflipPage();
        
        // 動画を停止
        if (isPlaying) {
            pauseVideo();
        }
    }

    function flipPage() {
        if (isPageFlipped) return;
        
        isPageFlipped = true;
        
        
        // ページをめくるアニメーション
        pageFlip.emit('page-flip');
        
        // 動画スクリーンとタイトルを表示（ページが完全にめくれた後）
        setTimeout(() => {
            // 動画とタイトルを表示
            videoScreen.setAttribute('visible', 'true');
            videoScreen.emit('video-show');
            titleText.emit('text-show');
        }, 2000);
        
        // シークバーを動画が完全に表示された後に表示（delay: 1000ms + dur: 1500ms = 2500ms後）
        setTimeout(() => {
            seekbarContainer.style.display = 'block';
            console.log('📊 シークバー表示 - 動画フェードイン完了後');
        }, 4500); // 2000ms (ページめくり) + 2500ms (動画フェードイン完了) = 4500ms
        
        console.log('Page flipped');
    }

    function unflipPage() {
        if (!isPageFlipped) return;
        
        isPageFlipped = false;
        
        
        // 動画スクリーンとタイトルを非表示
        videoScreen.emit('video-hide');
        titleText.emit('text-hide');
        
        // シークバーを非表示
        seekbarContainer.style.display = 'none';
        
        // 動画スクリーンを完全に非表示
        setTimeout(() => {
            videoScreen.setAttribute('visible', 'false');
        }, 800);
        
        // ページを元に戻す
        setTimeout(() => {
            pageFlip.emit('page-unflip');
        }, 500);
        
        console.log('Page unflipped');
    }

    function toggleVideo() {
        if (!isTargetFound) {
            alert('まず、CDジャケットをスキャンしてください');
            return;
        }
        
        if (isPlaying) {
            pauseVideo();
        } else {
            playVideo();
        }
    }

    async function playVideo() {
        try {
            if (videoAsset) {
                console.log('Attempting to play video...');
                
                // 動画の準備状態を確認
                if (videoAsset.readyState < 2) {
                    console.log('Video not ready, waiting...');
                    videoAsset.addEventListener('loadeddata', async () => {
                        await attemptPlay();
                    }, { once: true });
                    return;
                }
                
                await attemptPlay();
            }
        } catch (error) {
            console.error('Video play error:', error);
        }
        
        async function attemptPlay() {
            try {
                // iOS Safari対応: 必ずミュートから開始
                if (isIOS && isSafari) {
                    videoAsset.muted = true;
                    await videoAsset.play();
                    isPlaying = true;
                    updateVideoButton();
                    console.log('📱 iOS Safari: Video started playing (muted)');
                } else {
                    // その他のブラウザ: ミュート解除を試行
                    videoAsset.muted = false;
                    await videoAsset.play();
                    isPlaying = true;
                    updateVideoButton();
                    console.log('Video started playing with audio');
                }
            } catch (error) {
                console.log('Primary play failed, trying muted fallback...', error.name);
                try {
                    // フォールバック：ミュート再生を試行
                    videoAsset.muted = true;
                    await videoAsset.play();
                    isPlaying = true;
                    updateVideoButton();
                    console.log('Video started playing (muted fallback)');
                } catch (mutedError) {
                    console.error('❌ Even muted video play failed:', mutedError.name, mutedError.message);
                    
                    // iOS Safari用の最後の手段
                    if (isIOS) {
                        console.log('📱 Attempting iOS Safari compatibility mode...');
                        videoAsset.load(); // 動画を再読み込み
                        setTimeout(async () => {
                            try {
                                videoAsset.muted = true;
                                await videoAsset.play();
                                isPlaying = true;
                                updateVideoButton();
                                console.log('📱 iOS Safari compatibility mode successful');
                            } catch (finalError) {
                                console.error('❌ Final iOS play attempt failed:', finalError.name, finalError.message);
                            }
                        }, 200);
                    }
                }
            }
        }
    }

    function pauseVideo() {
        if (videoAsset) {
            videoAsset.pause();
            isPlaying = false;
            updateVideoButton();
            console.log('Video paused');
        }
    }

    function updateVideoButton() {
        const icon = videoControl.querySelector('i');
        icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }

    function openWebsite() {
        window.open('https://www.instagram.com/techconnect.em/', '_blank');
    }

    function openYoutube() {
        window.open('https://www.youtube.com/@yoshitakecast', '_blank');
        console.log('Opening YouTube channel');
    }


    // デバッグ用の情報表示
    function logStatus() {
        console.log('Status:', {
            isTargetFound,
            isPlaying,
            isPageFlipped,
            videoReady: videoAsset && videoAsset.readyState >= 2,
            videoSrc: videoAsset ? videoAsset.src : 'not found'
        });
    }

    // シークバー機能の実装
    function setupSeekbar() {
        // 時間表示の更新
        function updateTimeDisplay() {
            if (videoAsset) {
                const currentTime = videoAsset.currentTime || 0;
                const duration = videoAsset.duration || 0;
                
                // ドラッグ中は進捗バーの更新をスキップ
                if (!isDragging) {
                    currentTimeSpan.textContent = formatTime(currentTime);
                    
                    if (duration > 0) {
                        const progress = (currentTime / duration) * 100;
                        seekbarProgress.style.width = progress + '%';
                        seekbarHandle.style.left = progress + '%';
                    }
                }
                
                // デュレーションは常に更新
                durationTimeSpan.textContent = formatTime(duration);
            }
        }
        
        // 時間フォーマット関数
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
        
        // シークバークリック/ドラッグ処理
        function handleSeek(event) {
            if (!videoAsset || !videoAsset.duration) {
                console.log('❌ シーク失敗: videoAsset or duration not available');
                return;
            }
            
            // イベントの伝播を防ぐ
            event.preventDefault();
            event.stopPropagation();
            
            const rect = seekbar.getBoundingClientRect();
            const clickX = (event.type.includes('touch') ? event.touches[0].clientX : event.clientX) - rect.left;
            const percentage = Math.max(0, Math.min(1, clickX / rect.width));
            const newTime = percentage * videoAsset.duration;
            
            console.log('🎯 シーク処理:', {
                isDragging: isDragging,
                clickX: clickX,
                percentage: percentage,
                newTime: newTime,
                duration: videoAsset.duration,
                currentTimeBefore: videoAsset.currentTime
            });
            
            // A-Frame対応: 一時停止・シーク・再生のアプローチ
            const wasPlaying = !videoAsset.paused;
            
            if (wasPlaying) {
                videoAsset.pause();
                console.log('🔄 動画を一時停止してシーク');
            }
            
            // 動画の再生位置を設定
            videoAsset.currentTime = newTime;
            
            // 少し待ってから再生を再開（A-Frameがテクスチャ更新を処理する時間を確保）
            if (wasPlaying) {
                setTimeout(() => {
                    videoAsset.play().then(() => {
                        console.log('▶️ シーク後の再生再開完了');
                    }).catch(err => {
                        console.error('❌ シーク後の再生再開失敗:', err);
                    });
                }, 100);
            }
            
            // UIを即座に更新（timeupdateイベントを待たない）
            const progress = percentage * 100;
            seekbarProgress.style.width = progress + '%';
            seekbarHandle.style.left = progress + '%';
            currentTimeSpan.textContent = formatTime(newTime);
            
            // 設定後の値を確認
            setTimeout(() => {
                console.log('📊 設定後の値:', {
                    requestedTime: newTime,
                    actualTime: videoAsset.currentTime,
                    difference: Math.abs(newTime - videoAsset.currentTime)
                });
            }, 150);
        }
        
        // ドラッグ状態管理
        function startDrag(e) {
            e.preventDefault();
            e.stopPropagation();
            isDragging = true;
            console.log('🖱️ ドラッグ開始');
            
            // 初回のシーク処理
            handleSeek(e);
            
            document.addEventListener('mousemove', handleSeek, { passive: false });
            document.addEventListener('mouseup', endDrag);
        }
        
        function endDrag(e) {
            console.log('🖱️ ドラッグ終了');
            
            document.removeEventListener('mousemove', handleSeek, { passive: false });
            document.removeEventListener('mouseup', endDrag);
            
            // ドラッグフラグを少し遅れて解除（UIの更新を確実にするため）
            setTimeout(() => {
                isDragging = false;
                console.log('✅ ドラッグ状態解除完了');
            }, 100);
        }
        
        // イベントリスナー
        videoAsset.addEventListener('timeupdate', updateTimeDisplay);
        videoAsset.addEventListener('loadedmetadata', updateTimeDisplay);
        
        // シークバークリック
        seekbar.addEventListener('click', (e) => {
            if (!isDragging) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 クリックシーク');
                handleSeek(e);
            }
        });
        
        // ドラッグ操作
        seekbarHandle.addEventListener('mousedown', startDrag);
        
        // タッチ操作
        function startTouchDrag(e) {
            e.preventDefault();
            e.stopPropagation();
            isDragging = true;
            console.log('📱 タッチドラッグ開始');
            
            // 初回のシーク処理
            handleSeek(e);
            
            const touchMove = (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSeek(e);
            };
            
            const touchEnd = () => {
                console.log('📱 タッチドラッグ終了');
                document.removeEventListener('touchmove', touchMove);
                document.removeEventListener('touchend', touchEnd);
                
                // ドラッグフラグを少し遅れて解除
                setTimeout(() => {
                    isDragging = false;
                    console.log('✅ タッチドラッグ状態解除完了');
                }, 100);
            };
            
            document.addEventListener('touchmove', touchMove, { passive: false });
            document.addEventListener('touchend', touchEnd);
        }
        
        // タッチイベント
        seekbar.addEventListener('touchstart', (e) => {
            if (!isDragging) {
                e.preventDefault();
                e.stopPropagation();
                console.log('📱 タッチシーク');
                handleSeek(e);
            }
        }, { passive: false });
        
        seekbarHandle.addEventListener('touchstart', startTouchDrag);
    }

    // 動画要素の整合性チェック（開発時のみ）
    function validateVideoSetup() {
        const hasVideoAsset = !!videoAsset;
        const videoScreenMaterial = document.getElementById('video-screen')?.getAttribute('material');
        const usesCorrectSource = videoScreenMaterial?.includes('#' + VIDEO_ASSET_ID);
        
        // iOS Safari対応チェック
        const iOSCompatible = !isIOS || (
            videoAsset?.hasAttribute('playsinline') &&
            videoAsset?.muted === true &&
            videoAsset?.preload === 'metadata'
        );
        
        console.log('📋 Video Setup Validation:', {
            hasVideoAsset,
            videoAssetSrc: videoAsset?.src,
            videoScreenUsesCorrectSource: usesCorrectSource,
            isIOSDevice: isIOS,
            isSafariDevice: isSafari,
            iOSCompatible,
            playsinlineSet: videoAsset?.hasAttribute('playsinline'),
            isMuted: videoAsset?.muted,
            preloadSetting: videoAsset?.preload,
            isValid: hasVideoAsset && usesCorrectSource && iOSCompatible
        });
        
        return hasVideoAsset && usesCorrectSource && iOSCompatible;
    }
    
    // 初回検証実行
    setTimeout(validateVideoSetup, 1000);

    // デバッグ用（開発時のみ）
    window.debugAR = {
        logStatus,
        flipPage,
        unflipPage,
        playVideo,
        pauseVideo,
        videoAsset,
        validateVideoSetup
    };
});