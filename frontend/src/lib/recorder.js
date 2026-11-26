// Voice recording in the browser (chat voice notes, spoken listing descriptions).
import { useEffect, useRef, useState } from 'react';

/** Hold-free voice recording: tap to start, tap to stop (max `maxSeconds`). */
export function useRecorder(onDone, maxSeconds = 120) {
  const [state, setState] = useState({ recording: false, seconds: 0 });
  const rec = useRef(null);
  const timer = useRef(null);
  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const type = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find((m) => window.MediaRecorder?.isTypeSupported?.(m)) || '';
    const r = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
    const chunks = [];
    const began = Date.now();
    r.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    r.onstop = () => {
      stream.getTracks().forEach((tr) => tr.stop());
      clearInterval(timer.current);
      const seconds = Math.round((Date.now() - began) / 1000);
      setState({ recording: false, seconds: 0 });
      if (!r.cancelled && chunks.length && seconds >= 1) onDone(new Blob(chunks, { type: r.mimeType || 'audio/webm' }), seconds);
    };
    r.start();
    rec.current = r;
    setState({ recording: true, seconds: 0 });
    timer.current = setInterval(() => setState((s) => {
      if (s.seconds + 1 >= maxSeconds) rec.current?.stop();
      return { ...s, seconds: s.seconds + 1 };
    }), 1000);
  };
  const stop = () => rec.current?.state === 'recording' && rec.current.stop();
  const cancel = () => { if (rec.current) { rec.current.cancelled = true; stop(); } };
  useEffect(() => () => { clearInterval(timer.current); cancel(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return { ...state, start, stop, cancel, supported: typeof window !== 'undefined' && Boolean(window.MediaRecorder && navigator.mediaDevices?.getUserMedia) };
}
