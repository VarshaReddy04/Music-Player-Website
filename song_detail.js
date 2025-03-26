document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play_pause_btn');
    const backwardBtn = document.getElementById('backward_btn');
    const forwardBtn = document.getElementById('forward_btn');
    const slider = document.getElementById('slider');
    const currentDuration = document.getElementById('current_duration');
    const totalDuration = document.getElementById('total_duration');
    const songImg = document.getElementById('song-img');
    const songTitle = document.getElementById('song-title');
    const songSinger = document.getElementById('song-singer');

    const urlParams = new URLSearchParams(window.location.search);
    const songName = urlParams.get('id');

    if (!songName) {
        console.error('Song name is missing in query string.');
        return;
    }

    fetch('songs.json')
        .then(response => response.json())
        .then(data => {
            const song = data.find(song => song.name === songName);
            if (!song) {
                console.error('Song not found:', songName);
                return;
            }

            audioPlayer.src = song.path;
            songImg.src = song.img;
            songTitle.textContent = song.name;
            songSinger.textContent = song.singer;

            // Ensure the song plays by default
            audioPlayer.play();

            // Set the play icon initially
            playPauseBtn.innerHTML = '<i class="fa fa-pause" aria-hidden="true"></i>';

            audioPlayer.addEventListener('loadedmetadata', () => {
                totalDuration.textContent = formatTime(audioPlayer.duration);
                slider.max = audioPlayer.duration;
            });

            audioPlayer.addEventListener('timeupdate', updateSlider);
        })
        .catch(error => console.error('Error fetching song data:', error));

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function updateSlider() {
        slider.value = audioPlayer.currentTime;
        currentDuration.textContent = formatTime(audioPlayer.currentTime);
    }

    playPauseBtn.addEventListener('click', () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseBtn.innerHTML = '<i class="fa fa-pause" aria-hidden="true"></i>';
        } else {
            audioPlayer.pause();
            playPauseBtn.innerHTML = '<i class="fa fa-play" aria-hidden="true"></i>';
        }
    });

    backwardBtn.addEventListener('click', () => {
        fetch('songs.json')
            .then(response => response.json())
            .then(data => {
                const songList = data;
                const currentSongIndex = songList.findIndex(s => s.name === songName);
                const prevSongIndex = (currentSongIndex - 1 + songList.length) % songList.length;
                const prevSong = songList[prevSongIndex];
                if (prevSong) {
                    window.location.href = `song_detail.html?id=${encodeURIComponent(prevSong.name)}`;
                }
            })
            .catch(error => console.error('Error fetching song data:', error));
    });

    forwardBtn.addEventListener('click', () => {
        fetch('songs.json')
            .then(response => response.json())
            .then(data => {
                const songList = data;
                const currentSongIndex = songList.findIndex(s => s.name === songName);
                const nextSongIndex = (currentSongIndex + 1) % songList.length;
                const nextSong = songList[nextSongIndex];
                if (nextSong) {
                    window.location.href = `song_detail.html?id=${encodeURIComponent(nextSong.name)}`;
                }
            })
            .catch(error => console.error('Error fetching song data:', error));
    });

    slider.addEventListener('input', () => {
        audioPlayer.currentTime = slider.value;
    });

    audioPlayer.addEventListener('ended', () => {
        fetch('songs.json')
            .then(response => response.json())
            .then(data => {
                const songList = data;
                const currentSongIndex = songList.findIndex(s => s.name === songName);
                const nextSongIndex = (currentSongIndex + 1) % songList.length;
                const nextSong = songList[nextSongIndex];
                if (nextSong) {
                    window.location.href = `song_detail.html?id=${encodeURIComponent(nextSong.name)}`;
                }
            })
            .catch(error => console.error('Error fetching song data:', error));
    });
});
