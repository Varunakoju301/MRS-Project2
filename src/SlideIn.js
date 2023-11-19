import React, { useState } from "react";
import { errorHandling } from './functions.js';
import { GenresList } from "./FiltersBar.js"


function SlideIn({ token, maxPerPage, genres, renderPicked, setAlbumsData, setMusicistsData, setPlaylistsData,
  setTracksData, setPrevPage, setNextPage, pickedMusic, setPickedMusic, 
  savePlaylist, // New prop for the savePlaylist function
  setSaveSuccess, // Function to set save success state in the parent component
}) {
  const [playlistName, setPlaylistName] = useState("");
  const [saveSuccess, setSaveSuccessState] = useState(false); // State to track save success
  const [showAlert, setShowAlert] = useState(false); // State to manage alert visibility

  async function seeResults() {
    let genres = [];

    const checkboxes = document.getElementsByClassName("fluid-row-content")[0].querySelectorAll("input[type=checkbox]:checked");
    Array.from(checkboxes).forEach(checkbox => genres = [...genres, checkbox.parentElement.innerText]);

    const pickedSearchResults = document.getElementsByClassName("picked-music-grid")[0].getElementsByClassName("search-result");

    const itemsCount = genres.length + pickedSearchResults.length;
    if (itemsCount > 0 && itemsCount <= 10) {
      let tracks = [];
      let artists = [];
      pickedMusic.forEach(music => {
        if (music.type === "track") tracks = [...tracks, music.id];
        else if (music.type === "artist") artists = [...artists, music.id];
      })


      let url = "https://api.spotify.com/v1/recommendations?market=PL&limit=" + maxPerPage;
      url += artists.length ? "&seed_artists=" + artists : "";
      url += genres.length ? "&seed_genres=" + genres : "";
      url += tracks.length ? "&seed_tracks=" + tracks : "";

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        let data = await response.json();

        setAlbumsData([]);
        setMusicistsData([]);
        setPlaylistsData([]);
        setTracksData(data.tracks);
        setPrevPage("");
        setNextPage("");

        document.getElementsByClassName("slide-in")[0].classList.remove("shown"); // show results immediately

      } else errorHandling(response);

    } else window.alert("Please choose between 1 and 10 items to get recommendations on.");
  }


  function resetProgress() {
    const checkboxes = document.getElementsByClassName("fluid-row-content")[0].querySelectorAll("input[type=checkbox]:checked");
    Array.from(checkboxes).forEach(checkbox => checkbox.checked = false);

    setPickedMusic([]);
  }

  // 12-11 changes starts
  async function handleSavePlaylist() {
    savePlaylist(playlistName).then((result) => {
      if (result.success) {
        setSaveSuccess(result.playlistId);
        setShowAlert(true); // Show the alert when playlist creation is successful
      }
    });
  }
  //12-11 ends

  return (
    <div className='slide-in'>
      <div className='slide-in-header'>
        <div className='close-slide-in-container'>
          <button className='close-slide-in' onClick={(e) => e.target.closest(".slide-in").classList.remove("shown")}>
            <img src={process.env.PUBLIC_URL + "/images/close.webp"} alt='close' />
          </button>
        </div>
        <div className='note-container'>
          <span className='note'>Only up to 10 choices can be selected in total from genres, artists and tracks.</span>
        </div>
      </div>
      <div className='user-contribution'>
        <div className='add-genres-container'>
          <div className='default-button-container'>
            <button>Add genre</button>
          </div>
          <div className='fluid-row'>
            <div className='fluid-row-content'>
              <GenresList genres={genres} />
            </div>
          </div>
        </div>
        <div className='default-button-container'>
          <button onClick={seeResults}>See results</button>
        </div>
        <div className='default-button-container'>
          <button onClick={resetProgress}>Reset progress</button>
        </div>

        <div className='default-button-container'>
          <input
            type="text"
            placeholder="Playlist Name"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
          />
          <button onClick={handleSavePlaylist}>Save Playlist in SPOTIFY</button>
          {/* Display success message if saveSuccess state is true */}
          // {saveSuccess && <p>Playlist created successfully in Spotify!</p>}
        </div>

      </div>
      <div className='picked-music-container'>
        <div className='picked-music-grid'>
          {pickedMusic.length && renderPicked(pickedMusic, true)}
        </div>
      </div>

      {/* Display alert if showAlert state is true */}
      // {showAlert && (
      //   <div className='alert'>
      //     <span>Playlist created successfully in Spotify!</span>
      //     <button onClick={() => setShowAlert(false)}>Close</button>
      //   </div>
      // )}
    </div>
  );
}

export default SlideIn;
