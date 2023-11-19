import './App.css';
import React, { useEffect, useState, useRef } from "react";
import { errorHandling, addTypesToUrl } from "./functions.js";
import ResultTemplate from "./ResultTemplate.js";
import { FiltersBar } from "./FiltersBar.js";
import SlideIn from "./SlideIn.js";
import Header from "./Header"; // Import the Header component

function Placeholder() {
  return (
    <div className='placeholder'>
      <h2>No results found</h2>
      <img src={process.env.PUBLIC_URL + "/images/notFound.webp"} alt="results not found" />
      <span>Try changing filters and search text</span>
    </div>
  )
}


function App() {
  //const CLIENT_ID = "eae286ae2c30452f876d62116733da2a"; 
  const CLIENT_ID = "0c2f2f206cfa45bfba979b5015e57d6e";
  const REDIRECT_URI = "http://localhost:3001/"; //Dev
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const SCOPES = "playlist-modify-private playlist-modify-public"; // Add the necessary scopes here

  //12-11 changes
  const [playlistName, setPlaylistName] = useState("");
  const [playlistCreated, setPlaylistCreated] = useState(false);

  let maxPerPage = 10;
  if (window.innerWidth >= 700) maxPerPage = 20;

  const [token, setToken] = useState("");
  const searchInput = useRef();
  const [albumsData, setAlbumsData] = useState([]);
  const [artistsData, setMusicistsData] = useState([]);
  const [playlistsData, setPlaylistsData] = useState([]);
  const [tracksData, setTracksData] = useState([]);
  const [genres, setGenres] = useState([]);
  const [prevPage, setPrevPage] = useState("");
  const [nextPage, setNextPage] = useState("");
  const [pickedMusic, setPickedMusic] = useState([]);
  const typeParameter = useRef("");

  useEffect(() => {
    const hash = window.location.hash;

    let tokenVariable = window.localStorage.getItem("token");

    if (hash) {
      tokenVariable = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", tokenVariable);
    }

    setToken(tokenVariable);
  }, [])


  useEffect(() => {
    const fetchGenres = async () => {
      if (token) {
        let response = await fetch("https://api.spotify.com/v1/recommendations/available-genre-seeds", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          let data = await response.json();
          setGenres(data.genres);

        } else errorHandling(response);
      }
    }

    fetchGenres()
      .catch(console.error);
  }, [token])


  function getUrlFromClient(e) {
    e.preventDefault();

    const typesOptions = document.getElementById("type-options");
    const dateOptions = document.getElementById("date-options");
    const genreOptions = document.getElementById("genre-options");


    const typeCheckboxes = typesOptions.querySelectorAll("input[type=checkbox]:checked");
    let types = [];
    Array.from(typeCheckboxes).forEach(checkbox => {
      types = [...types, (checkbox.parentElement.innerText || checkbox.parentElement.textContent)];
    })

    typeParameter.current = "&type=" + types;
    typeParameter.dataLimit = Math.floor(maxPerPage / types.length);


    const isTagChecked = dateOptions.querySelector("input[type=checkbox]:checked");
    const tagParameter = (isTagChecked && (typeParameter.current === "&type=album")) ? " tag:new" : "";


    let yearParameter = '';
    if (!types.includes("playlist")) {
      const yearInputs = dateOptions.querySelectorAll("input[type=text]");

      let startDate = Number(yearInputs[0].value);
      let endDate = Number(yearInputs[1].value);

      if (startDate || endDate) { // checking if inputs weren't empty or only made with 0s
        if (startDate <= endDate) {
          yearParameter = " year:" + Math.max(startDate, 1000) + '-' + Math.min(endDate, 2999);

        } else {
          window.alert("Incorrect year range logic inputted");
        }
      }
    }


    const genreCheckboxes = genreOptions.querySelectorAll("input[type=checkbox]:checked");
    let genreParameter = "";

    Array.from(genreCheckboxes).forEach(checkbox => {
      genreParameter += (" genre:\"" + (checkbox.parentElement.innerText || checkbox.parentElement.textContent) + "\"");
    })


    const url = "https://api.spotify.com/v1/search?q=" + searchInput.current.value
      + tagParameter + yearParameter + genreParameter + typeParameter.current
      + "&limit=" + typeParameter.dataLimit;

    return url;
  }


  async function fetchData(url, notify = false) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (response.ok) {
      const data = await response.json();


      if (notify) {
        const popUp = document.querySelector(".notification.left");
        popUp.classList.add("shown-notification");
        setTimeout(() => popUp.classList.remove("shown-notification"), 3000);
      }


      if (!data.items) { // default search for items
        setAlbumsData(data.albums ? data.albums.items : []);
        setMusicistsData(data.artists ? (data.artists.items ? data.artists.items : data.artists) : []);
        setPlaylistsData(data.playlists ? data.playlists.items : []);
        setTracksData(data.tracks ? (data.tracks.items ? data.tracks.items : data.tracks) : []);

        const pageData = data.albums || data.artists || data.playlists || data.tracks;
        setPrevPage(addTypesToUrl(pageData.previous || null, typeParameter.current));
        setNextPage(addTypesToUrl(pageData.next || null, typeParameter.current));


      } else { // always one type of data

        let playlistTracks = [];

        if (data.items[0].disc_number) { // disc_number is unique for album tracks
          const img = { url: document.getElementsByClassName("search-results-grid")[0].getElementsByClassName("result-image")[0].src };
          // tracks from album by default don't have image provided
          data.items.forEach(track => track.images || (track.images = [img]));

        } else if (data.items[0].added_by) {// added_by is unique for plalists tracks
          data.items.forEach(item => playlistTracks = [...playlistTracks, item.track]); // formatting data
        }

        const type = data.items[0].type;
        setAlbumsData(type === "album" ? data.items : []);
        setMusicistsData(data.artists ? data.artists.items : []);
        setPlaylistsData(data.playlists ? data.playlists.items : []);
        setTracksData(type === "track" ? data.items : (playlistTracks.length ? playlistTracks : []));

        setPrevPage(data.previous);
        setNextPage(data.next);
      }
    } else errorHandling(response);
  }


  function renderData(displayData, isPicked) {
    let idx = 0; // makes sure that keys are unique
    return displayData.map(elem => (
      <ResultTemplate
        type={elem.type}
        img={(elem.images && elem.images.length
          ? elem.images[0].url : '')
          ||
          (elem.album && elem.album.images && elem.album.images.length
            ? elem.album.images[0].url : '')
        }
        name={elem.name.length < 30 ? elem.name : (elem.name.slice(0, 25) + "...")}
        idForTracks={elem.id}
        artistId={elem.artists ? elem.artists.map(artist => artist.id) : elem.id}
        spotifyUrl={elem.external_urls.spotify}
        typeParameter={typeParameter}
        maxPerPage={maxPerPage}
        isPicked={isPicked}
        fetchData={fetchData}
        pickedMusic={pickedMusic}
        setPickedMusic={setPickedMusic}
        key={'' + elem.id + idx++}
      />
    ))
  }


  function resetFilters() {
    const filtersList = document.getElementsByClassName("filters-list")[0];

    const inputs = filtersList.querySelectorAll("input[type=text]");
    Array.from(inputs).forEach(input => input.value = "");

    const checkboxes = filtersList.querySelectorAll("input[type=checkbox]:checked");
    Array.from(checkboxes).forEach(checkbox => checkbox.checked = false);

    const hiddenGenres = document.getElementById("genre-options").getElementsByClassName("hidden");
    Array.from(hiddenGenres).forEach(genre => genre.classList.remove("hidden"));
  }

  //12-11 changes

  async function savePlaylist(playlistName) {
    if (pickedMusic.length > 0) {
      // Get the IDs of the selected tracks
      const trackIds = pickedMusic.filter(music => music.type === "track").map(track => track.id);

      // Check if the token is still valid
      // You might need to implement your own token validation logic based on your authentication flow
      // if (!isValidToken()) {
      //   // If the token is not valid, refresh it
      //   await refreshAccessToken();
      // }

      // Create a new playlist
      const response = await fetch("https://api.spotify.com/v1/me/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: playlistName || "My Playlist",
          public: false
        })
      });

      console.log("response -->", response);
      if (response.ok) {
        const playlistData = await response.json();

        // Add tracks to the created playlist
        await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            uris: trackIds.map(id => `spotify:track:${id}`)
          })
        });

        // Display an alert or perform any actions needed upon successful playlist creation
        alert("Playlist created successfully!"); // Example: Display an alert
        // Show a success message to the user
         return { success: true, playlistId: playlistData.id }; // Return the playlistId for further handling
      } else {
        console.error("Error creating playlist:", response.status, response.statusText);
        console.error("Error creating playlist:", response.status, response.statusText);
        const errorData = await response.json();
        console.error("Error details:", errorData);
        // errorHandling(response);
      }
    }
    return { success: false };
  }

  function handlePlaylistCreationSuccess(playlistId) {
    // Perform any actions needed with the playlistId if necessary
    console.log(`Playlist created with ID: ${playlistId}`);
    setPlaylistCreated(true); // Update the playlistCreated state to true
  }

  //12-11 changes ends


  return (
    <div className="App">
      {/* <Header />  */}
      {/* Include the Header component here */}
      <FiltersBar genres={genres} />
      <SlideIn
        token={token}
        maxPerPage={maxPerPage}
        genres={genres}
        renderPicked={renderData}
        setAlbumsData={setAlbumsData}
        setMusicistsData={setMusicistsData}
        setPlaylistsData={setPlaylistsData}
        setTracksData={setTracksData}
        setPrevPage={setPrevPage}
        setNextPage={setNextPage}
        pickedMusic={pickedMusic}
        setPickedMusic={setPickedMusic}
        //12-11
        savePlaylist={savePlaylist} //{/* Pass the savePlaylist function to the SlideIn component */}
        setSaveSuccess={handlePlaylistCreationSuccess}
      />
      <div className='site-content'>
        <div className='user-contribution'>
          <div className='default-button-container'>
            <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(SCOPES)}`}>Get token</a>
          </div>
          <div className='default-button-container'>
            <button onClick={resetFilters}>Reset filters</button>
          </div>
          <div className='search-form-container'>
            <form className='search-form' onSubmit={e => fetchData(getUrlFromClient(e), true)}>
              <input className='search-input' type="text" placeholder='Search for music' ref={searchInput} />
              <button className='submit-button' type='submit'>Submit</button>
              <div className='fluid-row'>
                <div className='notification left'>
                  <span>Submitted</span>
                </div>
              </div>
            </form>
          </div>
          <div className='search-results-container'>
            <div className='search-results-grid'>
              {!!albumsData.length && renderData(albumsData, false)}
              {!!artistsData.length && renderData(artistsData, false)}
              {!!playlistsData.length && renderData(playlistsData, false)}
              {!!tracksData.length && renderData(tracksData, false)}
              {!!(albumsData.length || artistsData.length || playlistsData.length || tracksData.length)
                || <Placeholder />}
            </div>
          </div>
        </div>
      </div>


      <footer>
        <div className='change-page-button-container'>
          <button className='change-page-button' disabled={!prevPage} onClick={() => fetchData(prevPage)}>
            <img src={process.env.PUBLIC_URL + "/images/prevPage.webp"} alt='prev page' />
          </button>
        </div>
        <div className='credits-container'>
          <div className='credits-slide'>
            All of the data from: <img src={process.env.PUBLIC_URL + "/Spotify_Logo_RGB_Green.webp"} alt="Spotify logo"></img>
          </div>
        </div>
        <div className='change-page-button-container'>
          <button
            className='change-page-button'
            disabled={
              (!nextPage) || // Spotify allows setting an offset larger than the number of elements. This is in order to prevent empty pages being shown
              (albumsData.length < typeParameter.dataLimit && artistsData.length < typeParameter.dataLimit
                && playlistsData.length < typeParameter.dataLimit && tracksData.length < typeParameter.dataLimit)
            }
            onClick={() => fetchData(nextPage)}
          >
            <img src={process.env.PUBLIC_URL + "/images/nextPage.webp"} alt='next page' />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;