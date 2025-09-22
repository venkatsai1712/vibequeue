import axios from "axios";
import { useContext, useRef, useState } from "react";
import { useEffect } from "react";
import LoginPage from "./LoginPage";
import SongCard from "../components/SongCard";
import { AppContext } from "../App";
import { Link } from "react-router-dom";

function HostHomePage() {
  const { user, session } = useContext(AppContext);
  const [searchInput, setSearchInput] = useState("");
  const [songsList, setSongsList] = useState([]);
  const [playListSongs, setPlayListSongs] = useState([]);
  const [playListName, setPlayListName] = useState("");
  const [songsLoaded, setSongsLoaded] = useState(false);
  const clickPlaylistButton = useRef(null);

  useEffect(() => {
    if (session === null) clickPlaylistButton.current.click();
    else setPlayListName(session?.playlist_session_id?.name);
  }, []);

  async function searchSong() {
    if (!searchInput.trim()) return;
    try {
      const res = await axios.get("https://spotify23.p.rapidapi.com/search", {
        params: {
          type: "tracks",
          q: searchInput,
          limit: 10,
        },
        headers: {
          "x-rapidapi-key": import.meta.env.VITE_Spotify_API_Key,
          "x-rapidapi-host": "spotify23.p.rapidapi.com",
        },
      });
      console.log(res);
      setSongsList(res.data.tracks.items);
      setSongsLoaded(true);
    } catch (err) {
      console.log(err);
    }
  }

  async function savePlayListName() {
    if (!playListName.trim()) return;
    try {
      const res = await axios.post(
        "http://localhost:3000/save-playlist-name",
        {
          playlistName: playListName,
        },
        {
          withCredentials: true,
        }
      );
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  }

  function addSongsToPlaylist(song) {
    if (playListSongs.find((s) => s.id === song.data.id)) {
      setPlayListSongs(playListSongs.filter((s) => s.id !== song.data.id));
    } else {
      setPlayListSongs([
        ...playListSongs,
        { id: song.data.id, data: song.data },
      ]);
    }
  }

  async function savePlayList(e) {
    try {
      const res = await axios.post(
        "http://localhost:3000/save-playlist",
        {
          playlist: playListSongs,
        },
        { withCredentials: true }
      );
      setPlayListSongs([]);
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  }

  return Object.keys(user).length > 0 ? (
    <div className="d-flex flex-column justify-content-center align-items-center">
      {playListSongs.length > 0 ? (
        <div className="fixed-bottom p-2 d-flex justify-content-evenly align-items-center border border-white bg-success  border-bottom-0 border-start-0 border-end-0  border-3 rounded">
          <p className="text-black p-2 rounded bg-transparent fw-bold m-0">
            Changes in Playlist ({session.playlist_session_id.name})
          </p>
          <div className="w-25 bg-transparent d-flex gap-2">
            <button
              className="btn btn-white bg-white text-black fw-bold"
              onClick={() => {
                setPlayListSongs([]);
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-white bg-white text-black fw-bold"
              onClick={(e) => {
                savePlayList(e);
              }}
              disabled={playListSongs.length === 0}
            >
              Save
            </button>
          </div>
        </div>
      ) : null}
      <div
        className="d-flex align-items-center justify-content-center m-5"
        style={{ height: "50px" }}
      >
        <div className="input-group h-100">
          <input
            type="text"
            className="form-control bg-black text-white"
            placeholder="Search Songs..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
            }}
          />
          <button
            className="btn btn-outline-white border text-white"
            onClick={searchSong}
          >
            Search
          </button>
        </div>
        <Link to="/Playlist">
          <button
            // ref={clickPlaylistButton}
            className="btn border border-0"
            // data-bs-toggle="modal"
            // data-bs-target="#mymodal"
          >
            <i
              className="bi bi-music-note-list ms-3"
              style={{ fontSize: "2rem" }}
            ></i>
          </button>
        </Link>
      </div>
      <div className="modal" id="mymodal">
        <div className="modal-dialog">
          <div className="modal-content bg-black border border-2 border-secondary">
            <div className="modal-header">Add Playlist</div>
            <div className="modal-body border border-secondary">
              <input
                className="form-control bg-black w-75 text-white"
                placeholder="Playlist Name..."
                type="text"
                value={
                  session !== null
                    ? session.playlist_session_id.name
                    : playListName
                }
                onChange={(e) => {
                  setPlayListName(e.target.value);
                }}
              />
            </div>
            <div className="modal-footer m-2 bg-black border border-0">
              <button className="btn btn-danger" data-bs-dismiss="modal">
                Close
              </button>
              <button
                className="btn btn-primary"
                data-bs-dismiss="modal"
                onClick={savePlayListName}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
      <div>
        {songsList.length > 0
          ? songsList.map((song, index) => {
              return (
                <div
                  key={song.data.id}
                  className="d-flex align-items-center justify-content-center"
                >
                  <SongCard song={song} />
                  <i
                    className={
                      playListSongs.find((s) => s.id === song.data.id)
                        ? "bi bi-check-circle ms-2"
                        : "bi bi-plus-circle ms-2"
                    }
                    style={{ fontSize: "2.5rem" }}
                    onClick={(e) => {
                      addSongsToPlaylist(song);
                    }}
                  ></i>
                </div>
              );
            })
          : null}
      </div>
    </div>
  ) : (
    <LoginPage />
  );
}

export default HostHomePage;
