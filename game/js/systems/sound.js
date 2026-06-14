window.GAME = window.GAME || {};
window.GAME.Systems = window.GAME.Systems || {};

GAME.Systems.Sound = (function() {
    'use strict';

    var audioCtx = null;
    var enabled = true;

    function init() {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio not available');
            enabled = false;
        }
    }

    function playTone(freq, duration, type, volume) {
        if (!enabled || !audioCtx) return;
        try {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = type || 'square';
            osc.frequency.value = freq;
            gain.gain.value = volume || 0.05;
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (duration || 0.1));
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + (duration || 0.1));
        } catch (e) {}
    }

    function playClick() { playTone(800, 0.05, 'square', 0.03); }
    function playSelect() { playTone(600, 0.08, 'square', 0.03); playTone(900, 0.08, 'square', 0.03); }
    function playBuild() { playTone(200, 0.1, 'square', 0.04); setTimeout(function() { playTone(400, 0.1, 'square', 0.04); }, 100); }
    function playAlert() { playTone(440, 0.15, 'sawtooth', 0.05); setTimeout(function() { playTone(330, 0.2, 'sawtooth', 0.05); }, 150); }
    function playCrisis() { playTone(220, 0.2, 'sawtooth', 0.06); setTimeout(function() { playTone(165, 0.3, 'sawtooth', 0.06); }, 200); }
    function playSuccess() { playTone(523, 0.1, 'square', 0.04); setTimeout(function() { playTone(659, 0.1, 'square', 0.04); }, 100); setTimeout(function() { playTone(784, 0.15, 'square', 0.04); }, 200); }

    function toggle() {
        enabled = !enabled;
        return enabled;
    }

    return {
        init: init,
        playClick: playClick,
        playSelect: playSelect,
        playBuild: playBuild,
        playAlert: playAlert,
        playCrisis: playCrisis,
        playSuccess: playSuccess,
        toggle: toggle
    };
})();
