// Workout Tracker - Main JavaScript
class WorkoutTracker {
    constructor() {
        this.audioContext = null;
        this.stopwatchRunning = false;
        this.stopwatchTime = 0;
        this.stopwatchInterval = null;
        
        this.metronomeRunning = false;
        this.metronomeInterval = null;
        this.metronomeEnabled = false;
        this.metronomeIntervalMinutes = 5;
        this.metronomeLastBeep = 0;
        
        this.restTimerRunning = false;
        this.restTimerInterval = null;
        this.restTimerDuration = 60;
        this.restTimerRemaining = 0;
        this.metronomeWasEnabled = false;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.updateDisplays();
        await this.initAudio();
    }

    async initAudio() {
        try {
            // Create audio context on user interaction
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
        } catch (error) {
            console.error('Audio initialization failed:', error);
        }
    }

    setupEventListeners() {
        // Stopwatch controls
        document.getElementById('start-btn').addEventListener('click', () => this.startStopwatch());
        document.getElementById('stop-btn').addEventListener('click', () => this.stopStopwatch());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetStopwatch());

        // Metronome controls
        document.getElementById('metronome-toggle').addEventListener('change', (e) => this.toggleMetronome(e.target.checked));
        document.getElementById('interval-input').addEventListener('change', (e) => {
            this.metronomeIntervalMinutes = parseInt(e.target.value);
            this.updateMetronomeStatus();
        });

        // Rest timer controls
        document.getElementById('rest-duration').addEventListener('change', (e) => {
            this.restTimerDuration = parseInt(e.target.value);
        });
        document.getElementById('rest-start-btn').addEventListener('click', () => this.startRestTimer());
    }

    // Stopwatch functionality
    startStopwatch() {
        if (!this.stopwatchRunning) {
            this.stopwatchRunning = true;
            this.stopwatchInterval = requestAnimationFrame(() => this.updateStopwatch());
            
            document.getElementById('start-btn').disabled = true;
            document.getElementById('stop-btn').disabled = false;
            document.getElementById('stopwatch-display').classList.add('active');
        }
    }

    stopStopwatch() {
        if (this.stopwatchRunning) {
            this.stopwatchRunning = false;
            if (this.stopwatchInterval) {
                cancelAnimationFrame(this.stopwatchInterval);
            }
            
            document.getElementById('start-btn').disabled = false;
            document.getElementById('stop-btn').disabled = true;
            document.getElementById('stopwatch-display').classList.remove('active');
        }
    }

    resetStopwatch() {
        this.stopStopwatch();
        this.stopwatchTime = 0;
        this.updateStopwatchDisplay();
    }

    updateStopwatch() {
        if (this.stopwatchRunning) {
            this.stopwatchTime += 16.67; // Approximately 60fps
            this.updateStopwatchDisplay();
            this.checkMetronome();
            this.stopwatchInterval = requestAnimationFrame(() => this.updateStopwatch());
        }
    }

    updateStopwatchDisplay() {
        const hours = Math.floor(this.stopwatchTime / 3600000);
        const minutes = Math.floor((this.stopwatchTime % 3600000) / 60000);
        const seconds = Math.floor((this.stopwatchTime % 60000) / 1000);
        
        const display = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('stopwatch-display').textContent = display;
    }

    // Metronome functionality
    toggleMetronome(enabled) {
        this.metronomeEnabled = enabled;
        
        if (enabled && !this.restTimerRunning) {
            this.startMetronome();
        } else {
            this.stopMetronome();
        }
        
        this.updateMetronomeStatus();
    }

    startMetronome() {
        if (!this.metronomeRunning && this.metronomeEnabled && !this.restTimerRunning) {
            this.metronomeRunning = true;
            this.metronomeLastBeep = this.stopwatchTime;
            this.playMetronomeBeep();
        }
    }

    stopMetronome() {
        this.metronomeRunning = false;
        if (this.metronomeInterval) {
            clearTimeout(this.metronomeInterval);
            this.metronomeInterval = null;
        }
    }

    checkMetronome() {
        if (this.metronomeRunning && this.metronomeEnabled && !this.restTimerRunning) {
            const intervalMs = this.metronomeIntervalMinutes * 60000;
            const timeSinceLastBeep = this.stopwatchTime - this.metronomeLastBeep;
            
            if (timeSinceLastBeep >= intervalMs) {
                this.playMetronomeBeep();
                this.metronomeLastBeep = this.stopwatchTime;
            }
        }
    }

    updateMetronomeStatus() {
        const statusElement = document.getElementById('metronome-status');
        if (this.metronomeEnabled && !this.restTimerRunning) {
            statusElement.textContent = `Active - Beeping every ${this.metronomeIntervalMinutes} minute(s)`;
            statusElement.classList.add('active');
        } else if (this.restTimerRunning) {
            statusElement.textContent = 'Paused during rest timer';
            statusElement.classList.remove('active');
        } else {
            statusElement.textContent = 'Disabled';
            statusElement.classList.remove('active');
        }
    }

    // Rest timer functionality
    startRestTimer() {
        if (!this.restTimerRunning) {
            // Store metronome state
            this.metronomeWasEnabled = this.metronomeEnabled;
            
            // Stop metronome
            this.stopMetronome();
            this.metronomeEnabled = false;
            document.getElementById('metronome-toggle').checked = false;
            
            // Start rest timer
            this.restTimerRunning = true;
            this.restTimerRemaining = this.restTimerDuration * 1000;
            this.updateRestDisplay();
            
            document.getElementById('rest-start-btn').disabled = true;
            document.getElementById('rest-display').classList.add('active');
            
            this.restTimerInterval = setInterval(() => this.updateRestTimer(), 1000);
        }
    }

    updateRestTimer() {
        this.restTimerRemaining -= 1000;
        this.updateRestDisplay();
        
        if (this.restTimerRemaining <= 0) {
            this.completeRestTimer();
        }
    }

    updateRestDisplay() {
        const minutes = Math.floor(this.restTimerRemaining / 60000);
        const seconds = Math.floor((this.restTimerRemaining % 60000) / 1000);
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('rest-display').textContent = display;
    }

    completeRestTimer() {
        this.restTimerRunning = false;
        clearInterval(this.restTimerInterval);
        
        // Play completion sound
        this.playRestCompletionBeep();
        
        // Restore metronome if it was enabled
        if (this.metronomeWasEnabled) {
            setTimeout(() => {
                this.metronomeEnabled = true;
                document.getElementById('metronome-toggle').checked = true;
                this.startMetronome();
                this.updateMetronomeStatus();
            }, 1000);
        }
        
        document.getElementById('rest-start-btn').disabled = false;
        document.getElementById('rest-display').classList.remove('active');
        document.getElementById('rest-display').textContent = '--:--';
    }

    // Audio functionality
    async playMetronomeBeep() {
        await this.playBeep(800, 0.3, 'sine');
    }

    async playRestCompletionBeep() {
        await this.playBeep(400, 0.5, 'square');
        setTimeout(() => this.playBeep(600, 0.3, 'sine'), 200);
    }

    async playBeep(frequency, duration, type = 'sine') {
        if (!this.audioContext) {
            await this.initAudio();
        }

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
            
        } catch (error) {
            console.error('Error playing beep:', error);
        }
    }

    updateDisplays() {
        this.updateStopwatchDisplay();
        this.updateRestDisplay();
        this.updateMetronomeStatus();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WorkoutTracker();
});

// Handle page visibility changes to pause/resume timers
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden - could implement pause functionality here
        console.log('Page hidden');
    } else {
        // Page is visible again
        console.log('Page visible');
    }
});

// Handle audio context suspension
document.addEventListener('click', async () => {
    // Resume audio context on first user interaction
    if (window.workoutTracker && window.workoutTracker.audioContext) {
        if (window.workoutTracker.audioContext.state === 'suspended') {
            await window.workoutTracker.audioContext.resume();
        }
    }
}, { once: true }); 