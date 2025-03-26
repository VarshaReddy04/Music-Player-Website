document.addEventListener('DOMContentLoaded', () => {
    const playlistContainer = document.getElementById('playlist-container');
    const messageContainer = document.getElementById('message-container');
    const createPlaylistBtn = document.getElementById('create_playlist_btn');
    const audio = new Audio();

    let currentButton = null;

    // Function to render playlists
    function renderPlaylists(playlists) {
        playlistContainer.innerHTML = '';

        if (playlists.length === 0) {
            messageContainer.style.display = 'block';
        } else {
            messageContainer.style.display = 'none';
            playlists.forEach(playlist => {
                const songList = playlist.songs.map(song => `
                    <div class="song">
                        <img src="${song.img}" alt="${song.name}" />
                        <div class="song_info">
                            <p>${song.name}</p>
                            <p>${song.singer}</p>
                        </div>
                        <div class="song_controls">
                            <button class="play-btn" data-song-path='${song.path}'>▶</button>
                            <button class="delete-song-btn" data-song='${JSON.stringify(song)}'>✖</button>
                        </div>
                    </div>
                `).join('');

                const playlistElement = `
                    <div class="playlist">
                        <div class="playlist_header">
                            <h3>${playlist.name}</h3>
                            <div class="buttons">
                                <button class="playlist-play-btn" data-song-path='${playlist.songs.length ? playlist.songs[0].path : ''}'>▶</button>
                                <button class="add-btn" data-playlist='${JSON.stringify(playlist)}'>+</button>
                                <button class="delete-btn" data-playlist='${JSON.stringify(playlist)}'>✖</button>
                            </div>
                        </div>
                        <div class="songs">
                            ${songList}
                        </div>
                    </div>
                `;
                playlistContainer.insertAdjacentHTML('beforeend', playlistElement);
            });

            // Add event listeners for buttons
            document.querySelectorAll('.add-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const playlist = JSON.parse(button.getAttribute('data-playlist'));
                    localStorage.setItem('currentPlaylist', playlist.name);
                    window.location.href = 'index.html';
                });
            });

            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const playlist = JSON.parse(button.getAttribute('data-playlist'));
                    deletePlaylist(playlist.name);
                });
            });

            document.querySelectorAll('.play-btn, .playlist-play-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const songPath = button.getAttribute('data-song-path');
                    if (songPath) {
                        togglePlaySong(songPath, button);
                    } else {
                        alert('No song available to play.');
                    }
                });
            });

            document.querySelectorAll('.delete-song-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const song = JSON.parse(button.getAttribute('data-song'));
                    deleteSongFromPlaylist(song);
                });
            });
        }
    }

    // Function to play or pause a song
    function togglePlaySong(songPath, button) {
        console.log('Current song:', audio.src);
        console.log('Requested song:', songPath);
        if (audio.src !== songPath) {
            // New song: pause the current, reset the button, and play the new song
            if (currentButton) {
                currentButton.textContent = '▶'; // Reset previous button
            }
            audio.src = songPath;
            audio.play();
            button.textContent = '❚❚'; // Set button to pause symbol
            currentButton = button;
        } else if (audio.paused) {
            // Resume the current song
            audio.play();
            button.textContent = '❚❚'; // Set button to pause symbol
        } else {
            // Pause the current song
            audio.pause();
            button.textContent = '▶'; // Set button to play symbol
            if (currentButton === button) {
                currentButton = null; // Clear the reference to the current button
            }
        }

        // Update all buttons with the same song path to show correct state
        updateButtonStates(songPath);
    }

    // Function to update all buttons with the current play/pause state
    function updateButtonStates(songPath) {
        document.querySelectorAll('.play-btn, .playlist-play-btn').forEach(button => {
            if (button.getAttribute('data-song-path') === songPath) {
                button.textContent = audio.paused ? '▶' : '❚❚';
            } else {
                button.textContent = '▶';
            }
        });
    }

    // Function to delete a playlist
    function deletePlaylist(playlistName) {
        let playlists = JSON.parse(localStorage.getItem('playlists')) || [];
        const currentSongPath = audio.src;

        playlists = playlists.filter(p => p.name !== playlistName);
        localStorage.setItem('playlists', JSON.stringify(playlists));

        
    if (playlists.every(p => !p.songs.some(s => s.path === currentSongPath))) {
        // Stop playback if the current song was from the deleted playlist
        if (audio.src === currentSongPath) {
            audio.pause(); // Pause the audio
            audio.currentTime = 0; // Reset playback time to the start
            audio.src = ''; // Clear the audio source
            if (currentButton) {
                currentButton.textContent = '▶'; // Reset the play button
                currentButton = null; // Clear the reference to the current button
            }
        }
    }

        fetchPlaylists();
    }

    // Function to delete a song from a playlist
    function deleteSongFromPlaylist(song) {
        if (audio.src === song.path) {
            audio.pause(); // Pause the audio
            audio.currentTime = 0; // Reset playback time to the start
            audio.src = ''; // Clear the audio source
            audio.removeEventListener('ended', handleSongEnd); // Remove the 'ended' event listener

            if (currentButton) {
                currentButton.textContent = '▶'; // Reset the play button
                currentButton = null; // Clear the reference to the current button
            }
        }

        let playlists = JSON.parse(localStorage.getItem('playlists')) || [];
        playlists.forEach(playlist => {
            playlist.songs = playlist.songs.filter(s => s.name !== song.name);
        });
        localStorage.setItem('playlists', JSON.stringify(playlists));
        location.reload();
        
    }
    function handleSongEnd() {
        if (currentButton) {
            currentButton.textContent = '▶'; // Reset the play button when the song ends
        }
    }

    // Function to fetch and render playlists
    function fetchPlaylists() {
        const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
        renderPlaylists(playlists);
    }

    // Event listener for create playlist button
    createPlaylistBtn.addEventListener('click', () => {
        const playlistName = prompt("Enter the name of the new playlist:");
        if (playlistName) {
            let playlists = JSON.parse(localStorage.getItem('playlists')) || [];
            if (!playlists.some(p => p.name === playlistName)) {
                playlists.push({ name: playlistName, songs: [] });
                localStorage.setItem('playlists', JSON.stringify(playlists));
                fetchPlaylists();
            } else {
                alert(`Playlist "${playlistName}" already exists.`);
            }
        }
    });

    // Initial fetch of playlists
    fetchPlaylists();
});
