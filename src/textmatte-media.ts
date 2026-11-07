// 瀏覽器裡等影片停在指定時間，再讓 PNG 序列畫那一格。
import { matteMediaTime } from './textmatte';

export { matteMediaTime };

export const seekVideoFrame = (video: HTMLVideoElement, time: number): Promise<void> =>
  new Promise((resolve, reject) => {
    if (video.error || video.dataset.maFail === '1') {
      reject(new Error('decode'));
      return;
    }
    const dur = Number.isFinite(video.duration) ? video.duration : 0;
    const target = matteMediaTime(0, time, dur > 0 ? dur : undefined);
    let settled = false;
    const finish = () => {
      if (settled) return;
      const rvfc = (video as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number }).requestVideoFrameCallback;
      if (typeof rvfc === 'function') {
        const backup = setTimeout(done, 400);
        try {
          rvfc.call(video, () => {
            clearTimeout(backup);
            done();
          });
          return;
        } catch {
          clearTimeout(backup);
        }
      }
      requestAnimationFrame(() => done());
    };
    const done = () => {
      if (settled) return;
      settled = true;
      cleanup();
      if (video.error || video.dataset.maFail === '1') reject(new Error('decode'));
      else resolve();
    };
    const fail = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('seek'));
    };
    const timer = setTimeout(fail, 8000);
    const cleanup = () => {
      clearTimeout(timer);
      video.removeEventListener('seeked', finish);
      video.removeEventListener('error', fail);
    };
    if (video.readyState >= 2 && Math.abs((video.currentTime || 0) - target) < 0.001) {
      finish();
      return;
    }
    video.addEventListener('seeked', finish);
    video.addEventListener('error', fail);
    try {
      video.currentTime = target;
    } catch {
      fail();
    }
  });
