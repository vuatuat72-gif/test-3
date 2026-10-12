(() => {
    const button = document.querySelector('.music-toggle');
    const status = document.querySelector('.music-status');
    const audio = document.getElementById('background-music');
    const preferenceKey = 'happyBirthdayMusicEnabled';
    const positionKey = 'happyBirthdayMusicPosition';

    if (!button || !status || !(audio instanceof HTMLAudioElement)) return;
    if (window.self !== window.top) {
        document.body.classList.add('embedded-page');
        audio.pause();
        return;
    }

    let positionRestored = false;

    function savePreference(enabled) {
        try {
            sessionStorage.setItem(preferenceKey, String(enabled));
        } catch (error) {
            status.textContent = 'Không thể lưu lựa chọn nhạc trong phiên này.';
        }
    }

    function updateButton(enabled) {
        button.textContent = enabled ? '♫ Tắt nhạc' : '♫ Bật nhạc';
        button.setAttribute('aria-pressed', String(enabled));
    }

    function savePosition(position = audio.currentTime) {
        try {
            sessionStorage.setItem(positionKey, String(position));
        } catch (error) {
            status.textContent = 'Không thể lưu vị trí phát nhạc.';
        }
    }

    async function restorePosition() {
        if (positionRestored) return;

        if (audio.readyState < HTMLMediaElement.HAVE_METADATA) {
            await new Promise((resolve, reject) => {
                audio.addEventListener('loadedmetadata', resolve, { once: true });
                audio.addEventListener('error', () => reject(audio.error), { once: true });
                audio.load();
            });
        }

        try {
            const savedPosition = Number(sessionStorage.getItem(positionKey));
            if (Number.isFinite(savedPosition) && savedPosition > 0 && savedPosition < audio.duration) {
                await new Promise((resolve, reject) => {
                    const timeout = window.setTimeout(() => {
                        cleanup();
                        reject(new Error('Không thể khôi phục vị trí phát nhạc.'));
                    }, 5000);

                    function cleanup() {
                        window.clearTimeout(timeout);
                        audio.removeEventListener('seeked', onSeeked);
                        audio.removeEventListener('error', onError);
                    }

                    function onSeeked() {
                        cleanup();
                        resolve();
                    }

                    function onError() {
                        cleanup();
                        reject(audio.error || new Error('Không thể tìm đến vị trí nhạc đã lưu.'));
                    }

                    audio.addEventListener('seeked', onSeeked);
                    audio.addEventListener('error', onError);
                    audio.currentTime = savedPosition;
                    if (!audio.seeking && Math.abs(audio.currentTime - savedPosition) < 0.25) {
                        cleanup();
                        resolve();
                    }
                });
            }
        } catch (error) {
            status.textContent = error instanceof Error
                ? error.message
                : 'Không thể đọc vị trí phát nhạc đã lưu.';
            throw error;
        }

        positionRestored = true;
    }

    async function startMusic() {
        await restorePosition();
        await audio.play();
        updateButton(true);
        status.textContent = '';
        savePreference(true);
    }

    function stopMusic() {
        savePosition();
        audio.pause();
        updateButton(false);
        savePreference(false);
    }

    audio.addEventListener('timeupdate', () => savePosition());
    window.addEventListener('pagehide', () => savePosition());
    audio.addEventListener('ended', () => {
        savePosition(0);
        updateButton(false);
        savePreference(false);
    });

    button.addEventListener('click', async () => {
        if (!audio.paused) {
            stopMusic();
            status.textContent = '';
            return;
        }

        button.disabled = true;
        try {
            await startMusic();
        } catch (error) {
            updateButton(false);
            savePreference(false);
            status.textContent = error instanceof Error
                ? `Không phát được inlove.mp3: ${error.message}`
                : 'Không phát được inlove.mp3.';
        } finally {
            button.disabled = false;
        }
    });

    updateButton(false);
    startMusic().catch((error) => {
        updateButton(false);
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
            status.textContent = 'Trình duyệt chặn tự phát nhạc. Hãy nhấn “Bật nhạc” một lần.';
            return;
        }

        status.textContent = error instanceof Error
            ? `Không tự phát được inlove.mp3: ${error.message}`
            : 'Không tự phát được inlove.mp3.';
    });
})();
