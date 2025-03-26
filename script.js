document.addEventListener('DOMContentLoaded', () => {
    const tracksContainer = document.getElementById('tracks-container');
    const searchInput = document.getElementById('search');
    const searchButton = document.getElementById('search_btn');
    const noResultsMessage = document.getElementById('noResultsMessage');
    let allSongs = [];

    if (!tracksContainer) {
        console.error('Tracks container not found');
        return;
    }

    // Fetch and render songs
    function fetchSongs() {
        fetch('songs.json')
            .then(response => response.json())
            .then(data => {
                allSongs = data; // Save the data for searching
                filterAndRenderSongs(data);
            })
            .catch(error => {
                console.error('Error fetching song data:', error);
            });
    }

    // Function to filter songs based on playlist
    function filterAndRenderSongs(songs) {
        const urlParams = new URLSearchParams(window.location.search);
        const playlistName = urlParams.get('playlist');
        
        if (playlistName) {
            const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
            const playlist = playlists.find(p => p.name === playlistName);
            if (playlist) {
                const filteredSongs = songs.filter(song => 
                    playlist.songs.some(plSong => plSong.name === song.name)
                );
                renderSongs(filteredSongs, playlistName);
            } else {
                console.error('Playlist not found:', playlistName);
                renderSongs([]); // Render empty list if playlist not found
            }
        } else {
            renderSongs(songs); // Render all songs if no playlist is specified
        }
    }

    // Function to render songs
    function renderSongs(songs, playlistName = '') {
        tracksContainer.innerHTML = '';

        if (songs.length === 0) {
            noResultsMessage.style.display = 'block';
        } else {
            noResultsMessage.style.display = 'none';
            songs.forEach(song => {
                const songElement = `
                    <div class="song">
                        <div class="img">
                            <img src="${song.img}" alt="${song.name}" />
                        </div>
                        <div class="more">
                            <div class="song_info">
                                <p id="title">${song.name}</p>
                                <p>${song.singer}</p>
                            </div>
                            <div class="controls">
                                <a href="song_detail.html?id=${encodeURIComponent(song.name)}&playlist=${encodeURIComponent(playlistName)}" class="btn1">
                                    <i class="fa fa-play" aria-hidden="true"></i>
                                </a>
                                <button class="add-btn" data-song='${JSON.stringify(song)}'>+</button>
                            </div>
                        </div>
                    </div>
                `;
                tracksContainer.insertAdjacentHTML('beforeend', songElement);
            });

            // Add event listeners to add buttons
            document.querySelectorAll('.add-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const song = JSON.parse(button.getAttribute('data-song'));
                    addToPlaylist(song);
                });
            });
        }
    }

    // Function to search songs
    function searchSongs() {
        const searchInputValue = searchInput.value.toLowerCase();
        const filteredSongs = allSongs.filter(song =>
            song.name.toLowerCase().includes(searchInputValue) ||
            song.singer.toLowerCase().includes(searchInputValue)
        );
        renderSongs(filteredSongs);
    }

    function addToPlaylist(song) {
        const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
        const currentPlaylistName = localStorage.getItem('currentPlaylist');
        if (!currentPlaylistName) {
            alert('No current playlist found. Please select a playlist.');
            return;
        }
        
        const playlist = playlists.find(p => p.name === currentPlaylistName);
        if (playlist) {
            // Check if the song is already in the playlist
           const isSongInPlaylist = playlist.songs.some(plSong => plSong.name === song.name);
            if (isSongInPlaylist) {
            alert('Song is already in the playlist.');
        } else {
            playlist.songs.push(song);
            localStorage.setItem('playlists', JSON.stringify(playlists));
            alert('Song added to playlist!');
        }
        } else {
            alert('Playlist not found.');
        }
    }
    

    // Event listeners for search
    searchButton.addEventListener('click', searchSongs);
    searchInput.addEventListener('input', searchSongs);

    // Initial fetch of songs
    fetchSongs();

    // Clear currentPlaylist when navigating away
    window.addEventListener('beforeunload', () => {
        localStorage.removeItem('currentPlaylist');
    });
});
