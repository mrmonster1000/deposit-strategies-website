window.GAME = window.GAME || {};
window.GAME.Systems = window.GAME.Systems || {};

GAME.Systems.Sound = (function() {
    'use strict';

    var audioCtx = null;
    var enabled = true;
    var musicPlaying = false;
    var musicNodes = [];
    var musicTimer = null;
    var currentTheme = 'normal';

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

    // ---- NORMAL THEME (C major, bright) ----
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

    // ---- PHASE 2: EXPANSION (G major, energetic, faster) ----
    var PHASE2_MELODY = [
        { note: 392, dur: 0.2 }, { note: 494, dur: 0.2 }, { note: 587, dur: 0.2 }, { note: 659, dur: 0.2 },
        { note: 587, dur: 0.2 }, { note: 494, dur: 0.2 }, { note: 587, dur: 0.4 }, { note: 659, dur: 0.2 },
        { note: 740, dur: 0.2 }, { note: 659, dur: 0.2 }, { note: 587, dur: 0.2 }, { note: 494, dur: 0.4 },
        { note: 440, dur: 0.2 }, { note: 494, dur: 0.2 }, { note: 587, dur: 0.4 }, { note: 494, dur: 0.2 },
        { note: 392, dur: 0.4 }, { note: 440, dur: 0.2 }, { note: 494, dur: 0.2 }, { note: 587, dur: 0.2 },
        { note: 659, dur: 0.2 }, { note: 740, dur: 0.4 }, { note: 659, dur: 0.2 }, { note: 587, dur: 0.2 },
        { note: 494, dur: 0.2 }, { note: 440, dur: 0.2 }, { note: 392, dur: 0.6 }, { note: 0, dur: 0.4 }
    ];
    var PHASE2_BASS = [
        { note: 196, dur: 0.4 }, { note: 196, dur: 0.4 }, { note: 247, dur: 0.4 }, { note: 220, dur: 0.4 },
        { note: 196, dur: 0.4 }, { note: 294, dur: 0.4 }, { note: 247, dur: 0.4 }, { note: 196, dur: 0.4 },
        { note: 0, dur: 0.4 }
    ];

    // ---- PHASE 3: TRANSFORMATION (D minor, complex, mysterious) ----
    var PHASE3_MELODY = [
        { note: 294, dur: 0.4 }, { note: 349, dur: 0.3 }, { note: 440, dur: 0.3 }, { note: 523, dur: 0.5 },
        { note: 494, dur: 0.2 }, { note: 440, dur: 0.3 }, { note: 349, dur: 0.3 }, { note: 330, dur: 0.5 },
        { note: 294, dur: 0.3 }, { note: 262, dur: 0.3 }, { note: 294, dur: 0.4 }, { note: 349, dur: 0.3 },
        { note: 440, dur: 0.5 }, { note: 523, dur: 0.3 }, { note: 494, dur: 0.3 }, { note: 440, dur: 0.5 },
        { note: 523, dur: 0.3 }, { note: 587, dur: 0.4 }, { note: 523, dur: 0.3 }, { note: 440, dur: 0.3 },
        { note: 349, dur: 0.5 }, { note: 330, dur: 0.3 }, { note: 294, dur: 0.6 }, { note: 0, dur: 0.5 }
    ];
    var PHASE3_BASS = [
        { note: 147, dur: 0.5 }, { note: 175, dur: 0.5 }, { note: 131, dur: 0.5 }, { note: 147, dur: 0.5 },
        { note: 175, dur: 0.5 }, { note: 220, dur: 0.5 }, { note: 175, dur: 0.5 }, { note: 147, dur: 0.5 },
        { note: 0, dur: 0.5 }
    ];

    // ---- PHASE 4: LEGACY (Eb major, epic, wide intervals) ----
    var PHASE4_MELODY = [
        { note: 311, dur: 0.5 }, { note: 392, dur: 0.5 }, { note: 466, dur: 0.4 }, { note: 523, dur: 0.6 },
        { note: 466, dur: 0.3 }, { note: 392, dur: 0.3 }, { note: 466, dur: 0.5 }, { note: 523, dur: 0.4 },
        { note: 622, dur: 0.6 }, { note: 523, dur: 0.4 }, { note: 466, dur: 0.4 }, { note: 392, dur: 0.5 },
        { note: 311, dur: 0.4 }, { note: 392, dur: 0.5 }, { note: 466, dur: 0.4 }, { note: 523, dur: 0.5 },
        { note: 622, dur: 0.4 }, { note: 698, dur: 0.6 }, { note: 622, dur: 0.4 }, { note: 523, dur: 0.4 },
        { note: 466, dur: 0.4 }, { note: 392, dur: 0.4 }, { note: 311, dur: 0.8 }, { note: 0, dur: 0.5 }
    ];
    var PHASE4_BASS = [
        { note: 156, dur: 0.6 }, { note: 196, dur: 0.6 }, { note: 175, dur: 0.6 }, { note: 156, dur: 0.6 },
        { note: 131, dur: 0.6 }, { note: 156, dur: 0.6 }, { note: 175, dur: 0.6 }, { note: 156, dur: 0.6 },
        { note: 0, dur: 0.6 }
    ];

    // ---- CRISIS THEME ----
    // Transcribed from piano score: F minor, 7/8 time, tempo 95
    // Arr. Anders Thue — brooding ostinato bass with building melody
    // Eighth note at 95 BPM = ~0.316s, grouped in 7s for the 7/8 feel
    var e = 0.316;   // eighth note
    var q = 0.632;   // quarter note
    var dq = 0.947;  // dotted quarter
    var h = 1.263;   // half note
    var dh = 1.895;  // dotted half note

    var CRISIS_MELODY = [
        // Bars 1-2: Bass only intro (melody tacet)
        { note: 0, dur: 7 * e }, { note: 0, dur: 7 * e },
        // Bars 3-4: Melody enters — sustained Ab, stepping to Eb
        { note: 415, dur: dq },  // Ab4
        { note: 349, dur: e },   // F4
        { note: 311, dur: q },   // Eb4
        { note: 415, dur: dq },  // Ab4
        { note: 349, dur: e },   // F4
        { note: 311, dur: e },   // Eb4
        // Bars 5-6: Rising phrase
        { note: 261, dur: dq },  // C4
        { note: 277, dur: e },   // Db4
        { note: 311, dur: dq },  // Eb4
        { note: 261, dur: dh },  // C4 (sustained)
        // Bars 7-8: Descending answer
        { note: 277, dur: dq },  // Db4
        { note: 0, dur: e },
        { note: 261, dur: dq },  // C4
        { note: 233, dur: e },   // Bb3
        { note: 261, dur: q },   // C4
        { note: 311, dur: e },   // Eb4
        // Bars 9-10: Sustained dotted halves
        { note: 311, dur: dh },  // Eb4
        { note: 0, dur: e },
        { note: 261, dur: dh },  // C4
        { note: 0, dur: e },
        // Bars 11-12: Still sustained, lower register
        { note: 277, dur: dh },  // Db4
        { note: 261, dur: q },   // C4
        { note: 233, dur: h },   // Bb3
        { note: 261, dur: e },   // C4
        // Bars 13-16: Building energy — quarter notes stepping up
        { note: 311, dur: q },   // Eb4
        { note: 277, dur: dq },  // Db4
        { note: 261, dur: dq },  // C4
        { note: 233, dur: q },   // Bb3
        { note: 277, dur: e },   // Db4
        { note: 349, dur: q },   // F4
        { note: 311, dur: dq },  // Eb4
        { note: 0, dur: e },
        // Bars 17-20: Forte section — driving eighths
        { note: 415, dur: e },   // Ab4
        { note: 466, dur: e },   // Bb4
        { note: 415, dur: e },   // Ab4
        { note: 349, dur: e },   // F4
        { note: 311, dur: e },   // Eb4
        { note: 349, dur: e },   // F4
        { note: 415, dur: e },   // Ab4
        { note: 466, dur: e },   // Bb4
        { note: 523, dur: e },   // C5
        { note: 466, dur: e },   // Bb4
        { note: 415, dur: e },   // Ab4
        { note: 349, dur: e },   // F4
        { note: 311, dur: e },   // Eb4
        { note: 277, dur: e },   // Db4
        // Bars 21-24: Peak melodic phrases
        { note: 311, dur: q },   // Eb4
        { note: 349, dur: e },   // F4
        { note: 311, dur: e },   // Eb4
        { note: 261, dur: dq },  // C4
        { note: 277, dur: e },   // Db4
        { note: 311, dur: q },   // Eb4
        { note: 415, dur: q },   // Ab4
        { note: 349, dur: dq },  // F4
        { note: 311, dur: dq },  // Eb4
        // Bars 25-28: Sustained high notes
        { note: 415, dur: dq },  // Ab4
        { note: 349, dur: q },   // F4
        { note: 311, dur: e },   // Eb4
        { note: 277, dur: dq },  // Db4
        { note: 261, dur: dq },  // C4
        { note: 0, dur: e },
        // Bars 29-32: Half notes — widening intervals
        { note: 311, dur: dh },  // Eb4
        { note: 0, dur: e },
        { note: 277, dur: dq },  // Db4
        { note: 261, dur: e },   // C4
        { note: 277, dur: dq },  // Db4
        { note: 311, dur: e },   // Eb4
        { note: 349, dur: dq },  // F4
        // Bars 33-36: Building to climax
        { note: 415, dur: e },   // Ab4
        { note: 466, dur: e },   // Bb4
        { note: 523, dur: q },   // C5
        { note: 466, dur: e },   // Bb4
        { note: 415, dur: e },   // Ab4
        { note: 523, dur: e },   // C5
        { note: 554, dur: e },   // Db5
        { note: 622, dur: q },   // Eb5
        { note: 554, dur: e },   // Db5
        { note: 523, dur: e },   // C5
        { note: 466, dur: e },   // Bb4
        { note: 415, dur: e },   // Ab4
        // Bars 37-40: CLIMAX — ff/fff, powerful rhythmic hits
        { note: 349, dur: e },   // F4
        { note: 349, dur: e },   // F4
        { note: 523, dur: e },   // C5
        { note: 523, dur: e },   // C5
        { note: 0, dur: e * 0.5 },
        { note: 349, dur: e },   // F4
        { note: 415, dur: e },   // Ab4
        { note: 523, dur: e },   // C5
        { note: 622, dur: e },   // Eb5
        { note: 0, dur: e * 0.5 },
        { note: 698, dur: e },   // F5
        { note: 622, dur: e },   // Eb5
        { note: 554, dur: e },   // Db5
        { note: 523, dur: e },   // C5
        { note: 466, dur: e },   // Bb4
        { note: 415, dur: e },   // Ab4
        { note: 349, dur: e },   // F4
        { note: 311, dur: e },   // Eb4
        // Bars 41-44: Final dramatic descent
        { note: 349, dur: q },   // F4
        { note: 261, dur: q },   // C4
        { note: 0, dur: e },
        { note: 349, dur: q },   // F4
        { note: 261, dur: q },   // C4
        { note: 0, dur: e },
        { note: 175, dur: q },   // F3
        { note: 0, dur: h }      // Final rest
    ];

    var CRISIS_BASS = [
        // Driving F minor ostinato in 7/8: grouped 2+2+3
        // Bar pattern 1: F-Ab root movement
        { note: 87, dur: e },    // F2
        { note: 104, dur: e },   // Ab2
        { note: 0, dur: e * 0.5 },
        { note: 87, dur: e },    // F2
        { note: 104, dur: e },   // Ab2
        { note: 0, dur: e * 0.5 },
        { note: 131, dur: e },   // C3
        // Bar pattern 2: Db-Eb movement
        { note: 87, dur: e },    // F2
        { note: 104, dur: e },   // Ab2
        { note: 0, dur: e * 0.5 },
        { note: 139, dur: e },   // Db3
        { note: 104, dur: e },   // Ab2
        { note: 0, dur: e * 0.5 },
        { note: 156, dur: e },   // Eb3
        // Bar pattern 3: Rising bass
        { note: 104, dur: e },   // Ab2
        { note: 131, dur: e },   // C3
        { note: 0, dur: e * 0.5 },
        { note: 104, dur: e },   // Ab2
        { note: 156, dur: e },   // Eb3
        { note: 0, dur: e * 0.5 },
        { note: 131, dur: e },   // C3
        // Bar pattern 4: Resolution
        { note: 87, dur: e },    // F2
        { note: 104, dur: e },   // Ab2
        { note: 0, dur: e * 0.5 },
        { note: 131, dur: e },   // C3
        { note: 87, dur: e },    // F2
        { note: 0, dur: e * 0.5 },
        { note: 87, dur: q }     // F2 (longer)
    ];

    function playMusicLoop() {
        if (!enabled || !audioCtx || musicPlaying) return;
        musicPlaying = true;
        currentTheme = 'normal';
        schedulePhrase();
    }

    function setTheme(theme) {
        if (theme === currentTheme) return;
        var wasPlaying = musicPlaying;
        stopMusic();
        currentTheme = theme;
        if (wasPlaying) {
            musicPlaying = true;
            schedulePhrase();
        }
    }

    function schedulePhrase() {
        if (!musicPlaying || !enabled || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        var themeMap = {
            normal: { melody: MELODY, bass: BASS, wave: 'triangle', mVol: 0.02, bVol: 0.012 },
            crisis: { melody: CRISIS_MELODY, bass: CRISIS_BASS, wave: 'sawtooth', mVol: 0.018, bVol: 0.014 },
            phase2: { melody: PHASE2_MELODY, bass: PHASE2_BASS, wave: 'triangle', mVol: 0.02, bVol: 0.012 },
            phase3: { melody: PHASE3_MELODY, bass: PHASE3_BASS, wave: 'triangle', mVol: 0.018, bVol: 0.012 },
            phase4: { melody: PHASE4_MELODY, bass: PHASE4_BASS, wave: 'triangle', mVol: 0.02, bVol: 0.014 }
        };
        var tm = themeMap[currentTheme] || themeMap.normal;
        var melodyData = tm.melody;
        var bassData = tm.bass;
        var melodyWave = tm.wave;
        var melodyVol = tm.mVol;
        var bassVol = tm.bVol;

        var t = audioCtx.currentTime + 0.1;

        melodyData.forEach(function(n) {
            if (n.note > 0) {
                var osc = audioCtx.createOscillator();
                var gain = audioCtx.createGain();
                osc.type = melodyWave;
                osc.frequency.value = n.note;
                gain.gain.setValueAtTime(melodyVol, t);
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
        var bassLength = 0;
        bassData.forEach(function(n) { bassLength += n.dur; });

        var bassRepeats = Math.ceil(melodyLength / bassLength);
        for (var r = 0; r < bassRepeats; r++) {
            bassData.forEach(function(n) {
                if (bt >= audioCtx.currentTime + 0.1 + melodyLength) return;
                if (n.note > 0) {
                    var osc = audioCtx.createOscillator();
                    var gain = audioCtx.createGain();
                    osc.type = 'square';
                    osc.frequency.value = n.note;
                    gain.gain.setValueAtTime(bassVol, bt);
                    gain.gain.exponentialRampToValueAtTime(0.001, bt + n.dur * 0.9);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(bt);
                    osc.stop(bt + n.dur);
                    musicNodes.push(osc);
                }
                bt += n.dur;
            });
        }

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
        setTheme: setTheme,
        playSeagull: playSeagull,
        toggle: toggle
    };
})();
