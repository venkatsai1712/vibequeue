import { useState } from "react";
import axios from "axios";
import SongCard from "../components/SongCard";
import { useEffect } from "react";
import socket from "../sockets/socket";
import "./PlaylistPage.css";

function UserHomePage() {
  const [sessionId, setSessionId] = useState("");
  const [playListSongs, setPlayListSongs] = useState([]);
  const [show, setShow] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [songsList, setSongsList] = useState([]);
  const [addSongs, setAddSongs] = useState([]);
  const [searchFocus, setSearchFocus] = useState(false);
  const [socketId, setSocketId] = useState("");
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);

  useEffect(() => {
    socket.on("playlist-updated-added", (songs) => {
      setPlayListSongs((playListSongs) => [...playListSongs, ...songs]);
    });

    socket.on("playlist-updated", (songs) => {
      setPlayListSongs([...songs]);
    });

    socket.on("socket-id", (id) => {
      setSocketId(id);
    });

    socket.on("song-upvoted", ({ song, songId }) => {
      setPlayListSongs((prevSongs) =>
        prevSongs.map((s) =>
          s.id == songId ? { ...s, upvote: song.upvote } : s
        )
      );
    });

    socket.on("playlist-updated-deleted", (songs) => {
      setPlayListSongs(
        playListSongs.filter((psong) => {
          if (songs.find((song) => song.id === psong.id)) return false;
          else return true;
        })
      );
    });

    socket.on("current-playing-updated", (index) => {
      setCurrentSongIndex(index);
    });

    return () => {
      socket.off("playlist-updated-added");
      socket.off("playlist-updated-deleted");
      socket.off("current-playing-updated");
      socket.off("socket-id");
      socket.off("song-upvoted");
      socket.off("playlist-updated");
    };
  }, []);

  async function upVote(id) {
    try {
      const res = await axios.post(
        `http://localhost:3000/upvote/${id}`,
        {
          sessionId: sessionId,
          socketId: socketId,
        },
        { withCredentials: true }
      );
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  }

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
    } catch (err) {
      console.log(err);
    }
  }

  async function getPlaylistSongs() {
    if (!sessionId.trim()) return;
    try {
      const res = await axios.get(
        "http://localhost:3000/user/playlist/" + sessionId,
        { withCredentials: true }
      );

      console.log(res);
      setShow(false);
      setPlayListSongs(res.data.data[0].songs_queue);
    } catch (err) {
      console.log(err);
    }
  }

  function addSongsToPlaylist(song) {
    if (addSongs.find((s) => s.id === song.data.id)) {
      setAddSongs(addSongs.filter((s) => s.id !== song.data.id));
    } else {
      setAddSongs([...addSongs, { id: song.data.id, data: song.data }]);
    }
  }

  async function savePlayList() {
    try {
      const res = await axios.post(
        "http://localhost:3000/user-save-playlist",
        {
          playlist: addSongs,
          sessionId: sessionId,
        },
        { withCredentials: true }
      );
      setAddSongs([]);
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="d-flex flex-column justify-content-center align-items-center gap-2">
      {show ? (
        <div className="position-fixed top-0 bottom-0 start-0 end-0 d-flex justify-content-center align-items-center gap-2">
          <input
            className="form-control w-50 text-white bg-black"
            value={sessionId}
            onChange={(e) => {
              setSessionId(e.target.value);
            }}
          ></input>
          <button
            className="btn btn-black border border-white text-white"
            onClick={getPlaylistSongs}
          >
            Join
          </button>
        </div>
      ) : (
        <div className="d-flex flex-column justify-content-center align-items-center">
          {addSongs.length > 0 ? (
            <div className="fixed-bottom p-2 d-flex justify-content-evenly align-items-center border border-white bg-success  border-bottom-0 border-start-0 border-end-0  border-3 rounded">
              <p className="text-black p-2 rounded bg-transparent fw-bold m-0">
                {
                  "Changes in Playlist" /*({session.playlist_session_id.name}) */
                }
              </p>
              <div className="w-25 bg-transparent d-flex gap-2">
                <button
                  className="btn btn-white bg-white text-black fw-bold"
                  onClick={() => {
                    setAddSongs([]);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-white bg-white text-black fw-bold"
                  onClick={(e) => {
                    savePlayList(e);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : null}
          <div
            className="d-flex align-items-center justify-content-center m-4 gap-4"
            style={{ height: "50px" }}
          >
            {searchFocus ? (
              <div
                onClick={() => {
                  setSearchFocus(false);
                  setSongsList([]);
                }}
              >
                <i className="bi bi-x-lg" style={{ fontSize: "1.5rem" }}></i>
              </div>
            ) : null}
            <div className="input-group h-100">
              <input
                type="text"
                className="form-control bg-black text-white"
                placeholder="Search Songs..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                }}
                onFocus={() => {
                  setSearchFocus(true);
                }}
              />
              <button
                className="btn btn-outline-white border text-white"
                onClick={searchSong}
              >
                Search
              </button>
            </div>
          </div>
          {searchFocus ? (
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
                            addSongs.find((s) => s.id === song.data.id)
                              ? "bi bi-check-circle ms-2"
                              : "bi bi-plus-circle ms-2"
                          }
                          style={{ fontSize: "1.5rem" }}
                          onClick={(e) => {
                            addSongsToPlaylist(song);
                          }}
                        ></i>
                      </div>
                    );
                  })
                : null}
            </div>
          ) : (
            <div>
              {playListSongs.length > 0
                ? playListSongs.map((song, index) => {
                    return (
                      <div
                        key={song.data.id}
                        className="d-flex align-items-center justify-content-center gap-1"
                      >
                        {index == currentSongIndex ? (
                          <SongCard song={song} effect="bi bi-soundwave" />
                        ) : (
                          <SongCard song={song} effect="" />
                        )}
                        <div className="d-flex flex-column gap-2">
                          <p
                            className="bi bi-hand-thumbs-up m-0"
                            onClick={() => {
                              upVote(song.data.id);
                            }}
                          >
                            {song.upvote.length > 0 ? " "+song.upvote.length : ""}
                          </p>
                          <p className="bi bi-hand-thumbs-down m-0">
                             {song.downvote.length > 0
                              ? " "+song.downvote.length
                              : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })
                : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserHomePage;
