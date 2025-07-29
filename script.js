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
        this.metronomeIntervalMinutes = 1;
        this.metronomeLastBeep = 0;
        
        this.timerRunning = false;
        this.timerInterval = null;
        this.timerDuration = 1;
        this.timerRemaining = 0;
        this.timerStartTime = 0; // Track when timer started for sync
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
            // Create audio context with iOS compatibility
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Audio context created, state:', this.audioContext.state);
            
            // For iOS, we need to resume the context on first user interaction
            if (this.audioContext.state === 'suspended') {
                console.log('Audio context suspended, waiting for user interaction');
            }
        } catch (error) {
            console.error('Audio initialization failed:', error);
        }
    }

    setupEventListeners() {
        // Stopwatch controls
        document.getElementById('start-btn').addEventListener('click', () => this.startStopwatch());
        document.getElementById('discard-btn').addEventListener('click', () => this.discardWorkout());
        document.getElementById('finish-btn').addEventListener('click', () => this.finishWorkout());

        // Metronome controls
        document.getElementById('metronome-subsection').addEventListener('click', () => this.toggleMetronome());

        // Settings modal controls
        document.getElementById('settings-btn').addEventListener('click', () => this.openSettings());
        document.getElementById('close-settings-btn').addEventListener('click', () => this.closeSettings());
        document.getElementById('save-settings-btn').addEventListener('click', () => this.saveSettings());
        document.getElementById('cancel-settings-btn').addEventListener('click', () => this.closeSettings());

        // Timer controls
        document.getElementById('timer-subsection').addEventListener('click', () => this.toggleTimer());

        // Summary screen controls
        document.getElementById('summary-reset-btn').addEventListener('click', () => this.resetFromSummary());

        // Test beep button
        document.getElementById('test-beep-btn').addEventListener('click', () => this.testBeep());

        // iOS-specific audio context handling
        this.setupIOSAudioHandling();
    }

    // Settings modal functionality
    openSettings() {
        const modal = document.getElementById('settings-modal');
        const timerDurationInput = document.getElementById('settings-timer-duration');
        const metronomeIntervalInput = document.getElementById('settings-metronome-interval');
        
        // Populate form with current values
        timerDurationInput.value = this.timerDuration;
        metronomeIntervalInput.value = this.metronomeIntervalMinutes;
        
        modal.classList.remove('hidden');
    }

    closeSettings() {
        const modal = document.getElementById('settings-modal');
        modal.classList.add('hidden');
    }

    saveSettings() {
        const timerDurationInput = document.getElementById('settings-timer-duration');
        const metronomeIntervalInput = document.getElementById('settings-metronome-interval');
        
        // Validate inputs
        const newTimerDuration = parseInt(timerDurationInput.value);
        const newMetronomeInterval = parseInt(metronomeIntervalInput.value);
        
        if (newTimerDuration < 1 || newTimerDuration > 60) {
            alert('Timer duration must be between 1 and 60 minutes');
            return;
        }
        
        if (newMetronomeInterval < 1 || newMetronomeInterval > 10) {
            alert('Metronome interval must be between 1 and 10 minutes');
            return;
        }
        
        // Save settings
        this.timerDuration = newTimerDuration;
        this.metronomeIntervalMinutes = newMetronomeInterval;
        
        // Update displays
        this.updateValueDisplays();
        
        // Close modal
        this.closeSettings();
    }

    updateValueDisplays() {
        // Update timer duration display
        const timerDisplay = document.getElementById('timer-duration-display');
        timerDisplay.textContent = `${this.timerDuration} min`;
        
        // Update metronome interval display
        const metronomeDisplay = document.getElementById('metronome-interval-display');
        metronomeDisplay.textContent = `${this.metronomeIntervalMinutes} min`;
    }

    setupIOSAudioHandling() {
        // Resume audio context on any user interaction (required for iOS)
        const resumeAudio = async () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                try {
                    await this.audioContext.resume();
                    console.log('Audio context resumed on user interaction');
                } catch (error) {
                    console.error('Failed to resume audio context:', error);
                }
            }
        };

        // Add listeners for various user interactions
        const events = ['touchstart', 'touchend', 'click', 'keydown'];
        events.forEach(event => {
            document.addEventListener(event, resumeAudio, { passive: true, once: false });
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', async () => {
            if (!document.hidden && this.audioContext && this.audioContext.state === 'suspended') {
                try {
                    await this.audioContext.resume();
                    console.log('Audio context resumed on page visibility change');
                } catch (error) {
                    console.error('Failed to resume audio context on visibility change:', error);
                }
            }
        });
    }

    // Synchronized visual pulse animation
    triggerSyncPulse() {
        const displays = [
            document.getElementById('stopwatch-display'),
            document.getElementById('timer-display'),
            document.getElementById('timer-duration-time-main')
        ];
        
        displays.forEach(display => {
            if (display) {
                display.classList.add('sync-pulse');
                setTimeout(() => {
                    display.classList.remove('sync-pulse');
                }, 300);
            }
        });
    }

    // Stopwatch functionality
    startStopwatch() {
        if (!this.stopwatchRunning) {
            this.stopwatchRunning = true;
            this.stopwatchInterval = setInterval(() => this.updateStopwatch(), 1000);
            
            // Play metronome beep when starting
            this.playMetronomeBeep();
            this.triggerSyncPulse();
            
            // Show active state buttons
            document.getElementById('start-btn').classList.add('hidden');
            document.getElementById('discard-btn').classList.remove('hidden');
            document.getElementById('finish-btn').classList.remove('hidden');
            
            document.getElementById('stopwatch-display').classList.add('active');
            
            // Update timer button state
            this.updateTimerButtonState();
        }
    }

    discardWorkout() {
        // Stop the stopwatch if running
        if (this.stopwatchRunning) {
            this.stopwatchRunning = false;
            if (this.stopwatchInterval) {
                clearInterval(this.stopwatchInterval);
            }
        }
        
        // Deactivate timebox if running
        if (this.timerRunning) {
            this.completeTimer();
        }
        
        // Reset to initial state
        this.stopwatchTime = 0;
        this.timerStartTime = 0;
        this.updateStopwatchDisplay();
        
        // Show initial state buttons
        document.getElementById('start-btn').classList.remove('hidden');
        document.getElementById('discard-btn').classList.add('hidden');
        document.getElementById('finish-btn').classList.add('hidden');
        
        document.getElementById('stopwatch-display').classList.remove('active');
        
        // Update timer button state
        this.updateTimerButtonState();
    }

    finishWorkout() {
        if (this.stopwatchRunning) {
            this.stopwatchRunning = false;
            if (this.stopwatchInterval) {
                clearInterval(this.stopwatchInterval);
            }
        }
        
        // Show initial state buttons
        document.getElementById('start-btn').classList.remove('hidden');
        document.getElementById('discard-btn').classList.add('hidden');
        document.getElementById('finish-btn').classList.add('hidden');
        
        document.getElementById('stopwatch-display').classList.remove('active');
        
        // Update timer button state
        this.updateTimerButtonState();
        
        this.showSummary();
    }

    resetFromSummary() {
        this.hideSummary();
        this.stopwatchTime = 0;
        this.timerStartTime = 0;
        this.updateStopwatchDisplay();
        
        // Show initial state buttons
        document.getElementById('start-btn').classList.remove('hidden');
        document.getElementById('discard-btn').classList.add('hidden');
        document.getElementById('finish-btn').classList.add('hidden');
        
        document.getElementById('stopwatch-display').classList.remove('active');
        
        // Update timer button state
        this.updateTimerButtonState();
    }

    closeSummary() {
        this.hideSummary();
    }

    showSummary() {
        const overlay = document.getElementById('summary-overlay');
        const summaryTime = document.getElementById('summary-time');
        const summaryDate = document.getElementById('summary-date');
        const summaryTimestamp = document.getElementById('summary-timestamp');
        
        // Format the workout time
        const hours = Math.floor(this.stopwatchTime / 3600000);
        const minutes = Math.floor((this.stopwatchTime % 3600000) / 60000);
        const seconds = Math.floor((this.stopwatchTime % 60000) / 1000);
        const timeDisplay = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Get current date and time
        const now = new Date();
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        
        summaryTime.textContent = timeDisplay;
        summaryDate.textContent = now.toLocaleDateString('en-US', dateOptions);
        summaryTimestamp.textContent = now.toLocaleTimeString('en-US', timeOptions);
        
        overlay.classList.remove('hidden');
    }

    hideSummary() {
        const overlay = document.getElementById('summary-overlay');
        overlay.classList.add('hidden');
    }

    updateStopwatch() {
        if (this.stopwatchRunning) {
            this.stopwatchTime += 1000; // 1 second
            this.updateStopwatchDisplay();
            this.updateTimer(); // Update timer logic
            this.checkMetronome();
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
    toggleMetronome() {
        // Allow metronome to work alongside timer
        this.metronomeEnabled = !this.metronomeEnabled;
        
        if (this.metronomeEnabled) {
            this.startMetronome();
        } else {
            this.stopMetronome();
        }
        
        this.updateMetronomeStatus();
    }

    startMetronome() {
        if (!this.metronomeRunning && this.metronomeEnabled) {
            this.metronomeRunning = true;
            this.metronomeLastBeep = this.stopwatchTime;
            this.playMetronomeBeep();
            this.triggerSyncPulse();
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
        if (this.metronomeRunning && this.metronomeEnabled) {
            const intervalMs = this.metronomeIntervalMinutes * 60000;
            const timeSinceLastBeep = this.stopwatchTime - this.metronomeLastBeep;
            
            if (timeSinceLastBeep >= intervalMs) {
                this.playMetronomeBeep();
                this.triggerSyncPulse();
                this.metronomeLastBeep = this.stopwatchTime;
            }
        }
    }

    updateMetronomeStatus() {
        const iconElement = document.getElementById('metronome-icon');
        
        if (this.metronomeEnabled) {
            iconElement.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
            iconElement.style.color = '#ffcc00';
        } else {
            iconElement.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>';
            iconElement.style.color = '#6a6a6a';
        }
    }

    updateTimerStatus() {
        const iconElement = document.getElementById('timer-icon');
        
        if (this.timerRunning) {
            iconElement.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
            iconElement.style.color = '#ffcc00';
        } else {
            iconElement.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>';
            iconElement.style.color = '#6a6a6a';
        }
    }

    // Timer functionality with synchronized timing
    toggleTimer() {
        if (this.timerRunning) {
            this.endTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        if (!this.timerRunning) {
            // Start timer with synchronized timing
            this.timerRunning = true;
            this.timerStartTime = this.stopwatchTime; // Sync to current stopwatch time
            this.timerRemaining = this.timerDuration * 60000; // Convert minutes to milliseconds
            this.updateTimerDisplay();
            
            // Play timer start beep
            this.playMetronomeBeep();
            this.triggerSyncPulse();
            
            // Show timer display (keep duration display visible)
            document.querySelector('.timer-display').classList.remove('hidden');
            
            // Show main timer duration display
            document.getElementById('timer-duration-display-main').classList.remove('hidden');
            
            // Update timer status
            document.getElementById('timer-display').classList.add('active');
            this.updateTimerStatus();
        }
    }

    updateTimer() {
        // Timer now updates based on stopwatch time for perfect sync
        if (this.timerRunning) {
            const elapsedSinceStart = this.stopwatchTime - this.timerStartTime;
            this.timerRemaining = Math.max(0, (this.timerDuration * 60000) - elapsedSinceStart);
            this.updateTimerDisplay();
            
            if (this.timerRemaining <= 0) {
                this.completeTimer();
            }
        }
    }

    updateTimerDisplay() {
        if (this.timerRunning) {
            const minutes = Math.floor(this.timerRemaining / 60000);
            const seconds = Math.floor((this.timerRemaining % 60000) / 1000);
            const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            document.getElementById('timer-display').textContent = display;
            
            // Update main timer duration display
            document.getElementById('timer-duration-time-main').textContent = display;
        } else {
            document.getElementById('timer-display').textContent = '--:--';
        }
    }

    endTimer() {
        if (this.timerRunning) {
            this.completeTimer();
        }
    }

    completeTimer() {
        this.timerRunning = false;
        
        // Play completion sound
        this.playTimerCompletionBeep();
        this.triggerSyncPulse();
        
        // Hide timer display (duration display stays visible)
        document.querySelector('.timer-display').classList.add('hidden');
        
        // Hide main timer duration display
        document.getElementById('timer-duration-display-main').classList.add('hidden');
        
        // Update timer status
        document.getElementById('timer-display').classList.remove('active');
        document.getElementById('timer-display').textContent = '--:--';
        this.updateTimerStatus();
    }

    // Audio functionality
    async playMetronomeBeep() {
        await this.playBeep(800, 0.3, 'sine');
    }

    async playTimerCompletionBeep() {
        // Play triple beep using metronome sound
        await this.playBeep(800, 0.3, 'sine');
        setTimeout(() => this.playBeep(800, 0.3, 'sine'), 200);
        setTimeout(() => this.playBeep(800, 0.3, 'sine'), 400);
    }

    async testBeep() {
        console.log('Testing beep...');
        console.log('Audio context state:', this.audioContext?.state);
        console.log('User agent:', navigator.userAgent);
        await this.playBeep(800, 0.5, 'sine');
    }

    async testTimerEndBeep() {
        console.log('Testing timer end beep...');
        console.log('Audio context state:', this.audioContext?.state);
        await this.playTimerCompletionBeep();
    }

    debugAudioContext() {
        if (this.audioContext) {
            console.log('Audio Context Debug Info:');
            console.log('- State:', this.audioContext.state);
            console.log('- Sample Rate:', this.audioContext.sampleRate);
            console.log('- Current Time:', this.audioContext.currentTime);
            console.log('- Destination Max Channel Count:', this.audioContext.destination.maxChannelCount);
        } else {
            console.log('No audio context available');
        }
    }

    async playBeep(frequency, duration, type = 'sine') {
        if (!this.audioContext) {
            await this.initAudio();
        }

        try {
            // Ensure audio context is running (required for iOS)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
                console.log('Audio context resumed');
            }

            // Wait a bit for iOS to process the resume
            if (this.audioContext.state === 'running') {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                oscillator.type = type;
                
                // Create a more iOS-friendly envelope
                const now = this.audioContext.currentTime;
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
                
                oscillator.start(now);
                oscillator.stop(now + duration);
                
                console.log(`Playing beep: ${frequency}Hz, ${duration}s, ${type}`);
            } else {
                console.warn('Audio context not running, trying fallback method');
                await this.playBeepFallback(frequency, duration);
            }
            
        } catch (error) {
            console.error('Error playing beep:', error);
            // Try fallback method
            try {
                await this.playBeepFallback(frequency, duration);
            } catch (fallbackError) {
                console.error('Fallback audio also failed:', fallbackError);
            }
            // Try to reinitialize audio context on error
            try {
                await this.initAudio();
            } catch (reinitError) {
                console.error('Failed to reinitialize audio:', reinitError);
            }
        }
    }

    async playBeepFallback(frequency, duration) {
        // Fallback using HTML5 Audio API for iOS compatibility
        try {
            // Create a simple beep using AudioContext with a different approach
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
            
            console.log(`Fallback beep played: ${frequency}Hz, ${duration}s`);
            
        } catch (error) {
            console.error('Fallback audio failed:', error);
            throw error;
        }
    }

    updateDisplays() {
        this.updateStopwatchDisplay();
        this.updateTimerDisplay();
        this.updateMetronomeStatus();
        this.updateTimerStatus();
        this.updateValueDisplays();
    }

    updateTimerButtonState() {
        // This function updates the timer button state based on current conditions
        // Currently just calls the existing update functions
        this.updateMetronomeStatus();
        this.updateTimerStatus();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.workoutTracker = new WorkoutTracker();
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

// iOS-specific audio context handling is now managed within the WorkoutTracker class 