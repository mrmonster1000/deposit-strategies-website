window.GAME = window.GAME || {};
window.GAME.Systems = window.GAME.Systems || {};

GAME.Systems.Sound = (function() {
    'use strict';

    var audioCtx = null;
    var enabled = true;
    var musicPlaying = false;
    var musicNodes = [];
    var musicTimer = null;

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

    var MELODY = [
        { note: 262, dur: 0.3 }, { note: 330, dur: 0.3 }, { note: 392, dur: 0.3 }, { note: 330, dur: 0.3 },
        { note: 294, dur: 0.3 }, { note: 349, dur: 0.3 }, { note: 440, dur: 0.3 }, { note: 349, dur: 0.3 },
        { note: 262, dur: 0.3 }, { note: 392, dur: 0.3 }, { note: 523, dur: 0.6 },
        { note: 440, dur: 0.3 }, { note: 392, dur: 0.3 }, { note: 330, dur: 0.3 }, { note: 294, dur: 0.3 },
        { note: 262, dur: 0.6 }, { note: 0, dur: 0.6 }
    ];

    var BASS = [
        { note: 131, dur: 0.6 }, { note: 131, dur: 0.6 },
        { note: 147, dur: 0.6 }, { note: 147, dur: 0.6 },
        { note: 131, dur: 0.6 }, { note: 196, dur: 0.6 },
        { note: 175, dur: 0.6 }, { note: 131, dur: 0.6 }, { note: 0, dur: 0.6 }
    ];

    function playMusicLoop() {
        if (!enabled || !audioCtx || musicPlaying) return;
        musicPlaying = true;
        schedulePhrase();
    }

    function schedulePhrase() {
        if (!musicPlaying || !enabled || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        var t = audioCtx.currentTime + 0.1;

        MELODY.forEach(function(n) {
            if (n.note > 0) {
                var osc = audioCtx.createOscillator();
                var gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = n.note;
                gain.gain.setValueAtTime(0.02, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + n.dur * 0.9);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(t);
                osc.stop(t + n.dur);
                musicNodes.push(osc);
            }
            t += n.dur;
        });

        var melodyLength = t - audioCtx.currentTime - 0.1;

        var bt = audioCtx.currentTime + 0.1;
        BASS.forEach(function(n) {
            if (n.note > 0) {
                var osc = audioCtx.createOscillator();
                var gain = audioCtx.createGain();
                osc.type = 'square';
                osc.frequency.value = n.note;
                gain.gain.setValueAtTime(0.012, bt);
                gain.gain.exponentialRampToValueAtTime(0.001, bt + n.dur * 0.9);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(bt);
                osc.stop(bt + n.dur);
                musicNodes.push(osc);
            }
            bt += n.dur;
        });

        musicTimer = setTimeout(function() {
            musicNodes = [];
            if (musicPlaying) schedulePhrase();
        }, melodyLength * 1000 + 200);
    }

    function stopMusic() {
        musicPlaying = false;
        if (musicTimer) clearTimeout(musicTimer);
        musicNodes.forEach(function(osc) {
            try { osc.stop(); } catch (e) {}
        });
        musicNodes = [];
    }

    function playSeagull() {
        if (!enabled || !audioCtx) return;
        try {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
            osc.frequency.linearRampToValueAtTime(900, audioCtx.currentTime + 0.3);
            osc.frequency.linearRampToValueAtTime(1100, audioCtx.currentTime + 0.45);
            osc.frequency.linearRampToValueAtTime(700, audioCtx.currentTime + 0.6);
            gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.6);
        } catch (e) {}
    }

    function toggle() {
        enabled = !enabled;
        if (!enabled) stopMusic();
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
        playMusicLoop: playMusicLoop,
        stopMusic: stopMusic,
        playSeagull: playSeagull,
        toggle: toggle
    };
})();
