const APIController = (function() {
    const clientId = '5aea41756cde41eabf78886c9761c584';
    const clientSecret = '7baba6884c9b4661a4344b5a9e8014d4';

    const _getToken = async () => {
        try {
            const result = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
                },
                body: 'grant_type=client_credentials'
            });

            if (!result.ok) throw new Error('Failed to fetch token');
            const data = await result.json();
            return data.access_token;
        } catch (error) {
            console.error('Error fetching token:', error);
            return null;
        }
    };

    const _getGenres = async (token) => {
        try {
            const result = await fetch(`https://api.spotify.com/v1/browse/categories?locale=sv_US`, {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (!result.ok) throw new Error('Failed to fetch genres');
            const data = await result.json();
            return data.categories.items;
        } catch (error) {
            console.error('Error fetching genres:', error);
            return [];
        }
    };

    const _getPlaylistByGenre = async (token, genreId) => {
        try {
            const limit = 10;
            const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`, {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (!result.ok) throw new Error('Failed to fetch playlists');
            const data = await result.json();
            return data.playlists.items;
        } catch (error) {
            console.error('Error fetching playlists:', error);
            return [];
        }
    };

    const _getTracks = async (token, tracksEndPoint) => {
        try {
            const limit = 15;
            const result = await fetch(`${tracksEndPoint}?limit=${limit}`, {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (!result.ok) throw new Error('Failed to fetch tracks');
            const data = await result.json();
            return data.items;
        } catch (error) {
            console.error('Error fetching tracks:', error);
            return [];
        }
    };

    const _getTrack = async (token, trackEndPoint) => {
        try {
            const result = await fetch(`${trackEndPoint}`, {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (!result.ok) throw new Error('Failed to fetch track');
            const data = await result.json();
            return data;
        } catch (error) {
            console.error('Error fetching track:', error);
            return null;
        }
    };

    return {
        getToken() {
            return _getToken();
        },
        getGenres(token) {
            return _getGenres(token);
        },
        getPlaylistByGenre(token, genreId) {
            return _getPlaylistByGenre(token, genreId);
        },
        getTracks(token, tracksEndPoint) {
            return _getTracks(token, tracksEndPoint);
        },
        getTrack(token, trackEndPoint) {
            return _getTrack(token, trackEndPoint);
        }
    };
})();

const UIController = (function() {
    const DOMElements = {
        selectGenre: '#select_genre',
        selectPlaylist: '#select_playlist',
        buttonSubmit: '#btn_submit',
        divSongDetail: '#song-detail',
        hfToken: '#hidden_token',
        divSonglist: '.song-list',
        audioPlayer: '#audio-player',
        favoriteSongs: '.favorite-songs'
    };

    return {
        inputField() {
            return {
                genre: document.querySelector(DOMElements.selectGenre),
                playlist: document.querySelector(DOMElements.selectPlaylist),
                tracks: document.querySelector(DOMElements.divSonglist),
                submit: document.querySelector(DOMElements.buttonSubmit),
                songDetail: document.querySelector(DOMElements.divSongDetail),
                audioPlayer: document.querySelector(DOMElements.audioPlayer),
                favoriteSongs: document.querySelector(DOMElements.favoriteSongs)
            };
        },

        createGenre(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend', html);
        },

        createPlaylist(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectPlaylist).insertAdjacentHTML('beforeend', html);
        },

        createTrack(id, name, previewUrl) {
            const sanitizedId = id.replace(/[^a-zA-Z0-9-_]/g, '_');
            const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${sanitizedId}" data-preview-url="${previewUrl}">${name} <button class="btn btn-sm btn-outline-secondary float-right add-favorite">Add to Favorites</button></a>`;
            document.querySelector(DOMElements.divSonglist).insertAdjacentHTML('beforeend', html);
        },

        createTrackDetail(img, title, artist) {
            const detailDiv = document.querySelector(DOMElements.divSongDetail);
            detailDiv.innerHTML = '';

            const html = `
                <div class="row col-sm-12 px-0">
                    <img src="${img}" alt="">
                </div>
                <div class="row col-sm-12 px-0">
                    <label for="Genre" class="form-label col-sm-12">${title}:</label>
                </div>
                <div class="row col-sm-12 px-0">
                    <label for="artist" class="form-label col-sm-12">By ${artist}:</label>
                </div>
            `;
            detailDiv.insertAdjacentHTML('beforeend', html);
        },

        createFavoriteTrack(id, name, previewUrl) {
            const sanitizedId = id.replace(/[^a-zA-Z0-9-_]/g, '_');
            const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${sanitizedId}" data-preview-url="${previewUrl}">${name} <button class="btn btn-sm btn-outline-danger float-right remove-favorite">Remove</button></a>`;
            document.querySelector(DOMElements.favoriteSongs).insertAdjacentHTML('beforeend', html);
            console.log(`Favorite track created with ID: ${sanitizedId}`);
        },
        removeFavoriteTrack(id) {
            const favoriteSongs = document.querySelector(DOMElements.favoriteSongs);
            const track = document.getElementById(id);
            
            if (track) {
              track.parentNode.removeChild(track);
              console.log(`Removed track with ID: ${id}`);
            } else {
              console.log(`Track with ID: ${id} not found`);
            }
          },

        resetTrackDetail() {
            this.inputField().songDetail.innerHTML = '';
        },

        resetTracks() {
            this.inputField().tracks.innerHTML = '';
            this.resetTrackDetail();
        },

        resetPlaylist() {
            this.inputField().playlist.innerHTML = '';
            this.resetTracks();
        },

        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            };
        }
    };

})();

const APPController = (function(UICtrl, APICtrl) {
    const DOMInputs = UICtrl.inputField();

    const loadGenres = async () => {
        const token = await APICtrl.getToken();
        if (!token) {
            console.error('Failed to load token');
            return;
        }
        UICtrl.storeToken(token);
        const genres = await APICtrl.getGenres(token);
        genres.forEach(element => UICtrl.createGenre(element.name, element.id));
    };

    const setupEventListeners = () => {
        DOMInputs.genre.addEventListener('change', async () => {
            UICtrl.resetPlaylist();
            const token = UICtrl.getStoredToken().token;
            const genreSelect = UICtrl.inputField().genre;
            const genreId = genreSelect.options[genreSelect.selectedIndex].value;
            const playlist = await APICtrl.getPlaylistByGenre(token, genreId);
            playlist.forEach(p => UICtrl.createPlaylist(p.name, p.tracks.href));
        });

        DOMInputs.submit.addEventListener('click', async (e) => {
            e.preventDefault();
            UICtrl.resetTracks();
            const token = UICtrl.getStoredToken().token;
            const playlistSelect = UICtrl.inputField().playlist;
            const tracksEndPoint = playlistSelect.options[playlistSelect.selectedIndex].value;
            const tracks = await APICtrl.getTracks(token, tracksEndPoint);
            tracks.forEach(el => UICtrl.createTrack(el.track.id, el.track.name, el.track.preview_url));
        });

        DOMInputs.tracks.addEventListener('click', async (e) => {
            e.preventDefault();
            if (e.target && e.target.dataset.previewUrl) {
                UICtrl.resetTrackDetail();
                const audioPlayer = UICtrl.inputField().audioPlayer;
                audioPlayer.src = e.target.dataset.previewUrl;
                audioPlayer.play();

                const token = UICtrl.getStoredToken().token;
                const trackEndpoint = `https://api.spotify.com/v1/tracks/${e.target.id}`;
                const track = await APICtrl.getTrack(token, trackEndpoint);
                if (track) {
                    UICtrl.createTrackDetail(track.album.images[2].url, track.name, track.artists[0].name);
                } else {
                    console.error('Failed to fetch track details');
                }
            } else if (e.target.classList.contains('add-favorite')) {
                const trackElement = e.target.closest('.list-group-item');
                const trackId = trackElement.id;
                const trackName = trackElement.innerText.replace('Add to Favorites', '').trim();
                const previewUrl = trackElement.dataset.previewUrl;
                const sanitizedId = trackId.replace(/[^a-zA-Z0-9-_]/g, '_');
                UICtrl.createFavoriteTrack(sanitizedId, trackName, previewUrl);
            }
        });

        DOMInputs.favoriteSongs.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('remove-favorite')) {
                const trackElement = e.target.closest('.list-group-item');
                if(trackElement){
                    const trackId = trackElement.id;
                    UICtrl.removeFavoriteTrack(trackId);
                }
            }
        });
    };

    return {
        init() {
            console.log('App is starting');
            loadGenres();
            setupEventListeners();
        }
    };

})(UIController, APIController);

document.addEventListener('DOMContentLoaded', () => {
    APPController.init();
});
