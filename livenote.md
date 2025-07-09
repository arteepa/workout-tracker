### workout tracker

## v1 - stopwatch

# General
• 100% mobile focused, but usable on desktop
• touch-first
• HTML, CSS, and JS (no frameworks or libraries)

# Features
    • a stopwatch that counts up to track the overall workout duration
        • UI
            • big numbers, main element
            • start button
            • stop button
            • reset button
    • a metronome that beeps every N minutes
        • runs independently of other timers
        • UI
            • set duration: number picker, 1-10 minutes
            • enable/disable: toggle
    • a rest timer: A once-off countdown timer with a user-set duration for rest periods 
        • runs independent of other times
        • disables the metronome beep while running
        • restart the metronome beep when it finishes (with a distinct beep)
        • UI
            • input field for duration
            • start button
    • Audio
        • request audio permissions for playing sounds when user activates either metronome or rest timer
        • Oscillator from Web Audio API

## icebox
• routine player
• RocketJourney API integration
• ai workout companion


## first prompt

Plan a mobile-first workout tracker web app using HTML, CSS, and JavaScript (no frameworks or libraries). The app should include the following features:

Stopwatch: Counts up to track the overall workout duration.
UI: Large, prominent display for the timer, with start, stop, and reset buttons.
Metronome: Beeps every N minutes, where N is set by the user.
Runs independently of other timers.
UI: Number picker (1-10 minutes) to set the interval, and a toggle to enable/disable it.
Rest Timer: A once-off countdown timer with a user-set duration for rest periods.
Runs independently of other timers.
Disables the metronome beep while running and restarts it with a distinct beep when finished.
UI: Input field for the duration and a start button.
Audio: Use the Web Audio API to generate beeps for the metronome and rest timer (distinct beep for rest timer completion). Request audio permissions when the user activates the metronome or rest timer.
Design: Ensure the UI is touch-friendly and optimized for mobile devices, but also usable on desktop.