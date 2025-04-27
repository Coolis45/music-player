class MusicPlayer {
    constructor() {
        this.audioPlayer = new Audio();
        this.playlist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;

        // DOM Elements
        this.playButton = document.getElementById('play');
        this.prevButton = document.getElementById('prev');
        this.nextButton = document.getElementById('next');
        this.volumeSlider = document.getElementById('volume');
        this.progressBar = document.getElementById('progress');
        this.currentTimeSpan = document.getElementById('current-time');
        this.durationSpan = document.getElementById('duration');
        this.currentSongDisplay = document.getElementById('current-song');
        this.playlistElement = document.getElementById('playlist');
        this.fileUpload = document.getElementById('file-upload');
        this.folderUpload = document.getElementById('folder-upload');

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File upload handling
        this.fileUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        this.folderUpload.addEventListener('change', (e) => this.handleFileUpload(e));

        // Playback controls
        this.playButton.addEventListener('click', () => this.togglePlay());
        this.prevButton.addEventListener('click', () => this.playPrevious());
        this.nextButton.addEventListener('click', () => this.playNext());
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));

        // Progress bar
        this.progressBar.parentElement.addEventListener('click', (e) => this.seek(e));
        
        // Audio player events
        this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.audioPlayer.addEventListener('ended', () => this.handleTrackEnd());
        this.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
    }

    handleFileUpload(event) {
        const files = Array.from(event.target.files).filter(file => {
            // Filter only audio files
            return file.type.startsWith('audio/') || 
                   file.name.endsWith('.mp3') || 
                   file.name.endsWith('.wav') || 
                   file.name.endsWith('.ogg') ||
                   file.name.endsWith('.m4a');
        });
        
        if (files.length === 0) {
            alert('Inga ljudfiler hittades. Stödda format: MP3, WAV, OGG, M4A');
            return;
        }

        // Sort files by folder structure (if any) and then by name
        files.sort((a, b) => {
            const aPath = a.webkitRelativePath || a.name;
            const bPath = b.webkitRelativePath || b.name;
            return aPath.localeCompare(bPath);
        });
        
        // Add files to playlist
        files.forEach(file => {
            const fileURL = URL.createObjectURL(file);
            // Use relative path if available (for folders), otherwise use filename
            const displayName = file.webkitRelativePath || file.name;
            this.playlist.push({
                name: displayName,
                url: fileURL
            });
        });

        this.updatePlaylistDisplay();
        
        // If this is the first upload, start playing
        if (this.playlist.length === files.length) {
            this.playTrack(0);
        }
    }

    updatePlaylistDisplay() {
        this.playlistElement.innerHTML = '';
        this.playlist.forEach((track, index) => {
            const li = document.createElement('li');
            li.textContent = track.name;
            li.onclick = () => this.playTrack(index);
            if (index === this.currentTrackIndex) {
                li.classList.add('active');
            }
            this.playlistElement.appendChild(li);
        });
    }

    playTrack(index) {
        if (index >= 0 && index < this.playlist.length) {
            this.currentTrackIndex = index;
            this.audioPlayer.src = this.playlist[index].url;
            this.audioPlayer.play();
            this.isPlaying = true;
            this.updatePlayButton();
            this.updateCurrentSongDisplay();
            this.updatePlaylistDisplay();
        }
    }

    togglePlay() {
        if (this.playlist.length === 0) return;

        if (this.isPlaying) {
            this.audioPlayer.pause();
        } else {
            this.audioPlayer.play();
        }
        this.isPlaying = !this.isPlaying;
        this.updatePlayButton();
    }

    updatePlayButton() {
        const icon = this.playButton.querySelector('i');
        icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }

    playNext() {
        if (this.playlist.length === 0) return;
        const nextIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        this.playTrack(nextIndex);
    }

    playPrevious() {
        if (this.playlist.length === 0) return;
        const prevIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
        this.playTrack(prevIndex);
    }

    setVolume(value) {
        this.audioPlayer.volume = value;
    }

    updateProgress() {
        if (!this.audioPlayer.duration) return;
        
        const progress = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
        this.progressBar.style.width = `${progress}%`;
        
        this.currentTimeSpan.textContent = this.formatTime(this.audioPlayer.currentTime);
    }

    updateDuration() {
        this.durationSpan.textContent = this.formatTime(this.audioPlayer.duration);
    }

    seek(event) {
        const progressBar = event.currentTarget;
        const clickPosition = event.offsetX / progressBar.offsetWidth;
        const seekTime = clickPosition * this.audioPlayer.duration;
        this.audioPlayer.currentTime = seekTime;
    }

    handleTrackEnd() {
        this.playNext();
    }

    updateCurrentSongDisplay() {
        if (this.playlist[this.currentTrackIndex]) {
            this.currentSongDisplay.textContent = this.playlist[this.currentTrackIndex].name;
        }
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Initialize the music player when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
}); 