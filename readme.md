# Workout Tracker

A mobile-first web application for tracking workouts with integrated stopwatch, metronome, and rest timer functionality.

## Features

### 🏃‍♂️ Stopwatch
- **Large, prominent display** showing hours:minutes:seconds
- **Start/Stop/Reset controls** with touch-friendly buttons
- **Real-time counting** using requestAnimationFrame for smooth updates
- **Visual feedback** with pulsing animation when active

### 🎵 Metronome
- **Configurable intervals** from 1-10 minutes
- **Toggle on/off** with modern switch UI
- **Independent operation** - runs alongside other timers
- **Audio feedback** using Web Audio API oscillator
- **Status display** showing current state and interval

### ⏰ Rest Timer
- **Custom duration** input (10-600 seconds)
- **Countdown display** with minutes:seconds format
- **Metronome integration** - automatically pauses metronome during rest
- **Auto-restart** - resumes metronome when rest timer completes
- **Distinct completion sound** - different from metronome beeps

### 🔊 Audio System
- **Web Audio API integration** for high-quality sound generation
- **Permission handling** - requests audio permissions on first use
- **Two distinct sounds**:
  - Metronome: 800Hz sine wave (0.3s duration)
  - Rest completion: 400Hz square wave + 600Hz sine wave sequence
- **Automatic audio context management** with suspend/resume handling

## Design Principles

### Mobile-First
- **Touch-optimized** buttons with minimum 50px height
- **Responsive layout** that adapts to different screen sizes
- **Large text** and generous spacing for easy interaction
- **Smooth animations** and visual feedback

### Accessibility
- **Keyboard navigation** support
- **High contrast mode** compatibility
- **Focus indicators** for all interactive elements
- **Semantic HTML** structure

### Performance
- **Efficient timing** using requestAnimationFrame
- **Memory management** with proper cleanup
- **Audio optimization** with gain control and proper disposal

## Technical Stack

- **HTML5** - Semantic structure and form elements
- **CSS3** - Modern styling with gradients, animations, and responsive design
- **Vanilla JavaScript** - No frameworks or libraries
- **Web Audio API** - High-quality sound generation
- **Local Storage** - Ready for future data persistence

## Browser Compatibility

- **Chrome/Edge** - Full support
- **Firefox** - Full support
- **Safari** - Full support (iOS 14.5+)
- **Mobile browsers** - Optimized for touch interaction

## Usage Instructions

### Getting Started
1. Open `index.html` in a modern web browser
2. Allow audio permissions when prompted (for metronome/rest timer sounds)
3. Start your workout!

### Stopwatch
- Click **Start** to begin timing your workout
- Click **Stop** to pause the timer
- Click **Reset** to return to 00:00:00

### Metronome
- Set your desired interval (1-10 minutes) using the number input
- Toggle the switch to **Enable Metronome**
- The metronome will beep at regular intervals during your workout
- Status shows current state and interval

### Rest Timer
- Enter your rest duration in seconds (10-600)
- Click **Start Rest** to begin countdown
- Metronome automatically pauses during rest
- When rest completes, metronome resumes (if it was enabled)
- Distinct completion sound plays

## File Structure

```
workouttracker/
├── index.html          # Main application file
├── styles.css          # Mobile-first responsive styles
├── script.js           # Core functionality and timer logic
├── README.md           # This documentation
└── livenote.md         # Development notes and requirements
```

## Future Enhancements

### Planned Features
- **Routine Player** - Pre-programmed workout sequences
- **RocketJourney API Integration** - External workout data
- **AI Workout Companion** - Intelligent workout suggestions

### Technical Improvements
- **Local Storage** - Save workout history and settings
- **Service Worker** - Offline functionality
- **Progressive Web App** - Installable on mobile devices
- **Data Export** - Share workout data

## Development Notes

### Audio Implementation
- Uses Web Audio API for cross-browser compatibility
- Implements proper gain control to prevent audio clipping
- Handles audio context suspension/resumption
- Requests permissions only when needed

### Timer Precision
- Stopwatch uses requestAnimationFrame for smooth 60fps updates
- Metronome integrates with stopwatch for precise timing
- Rest timer uses setInterval for accurate countdown

### State Management
- Independent timer systems that can run simultaneously
- Proper cleanup of intervals and audio contexts
- Visual state indicators for all components

## License

This project is open source and available under the MIT License.
