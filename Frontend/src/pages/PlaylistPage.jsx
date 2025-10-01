import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SongCard from "../components/SongCard";
import socket from "../sockets/socket";
import "./PlaylistPage.css";

function Playlist() {
  const [playListSongs, setPlayListSongs] = useState([]);
  const [deletedSongs, setDeletedSongs] = useState([]);
  const [playListName, setPlayListName] = useState("");
  const [songsCount, setSongsCount] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const audioRef = useRef(null);
  const playButton = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function getPlaylistSongs() {
      try {
        const res = await axios.get("http://localhost:3000/playlist", {
          withCredentials: true,
        });
        console.log(res);
        if (res.data.data.playlist_session_id !== null) {
          setPlayListName(res.data.data.playlist_session_id.name);
          setSongsCount(res.data.data.playlist_session_id.songs_queue.length);
          setSessionId(res.data.data.playlist_session_id.session_id);
          setPlayListSongs(res.data.data.playlist_session_id.songs_queue);
        }
      } catch (err) {
        console.log(err);
      }
    }
    getPlaylistSongs();

    socket.on("playlist-updated-added", (songs) => {
      setPlayListSongs((playListSongs) => [...playListSongs, ...songs]);
    });

    socket.on("playlist-updated-deleted", (songs) => {
      setPlayListSongs(
        playListSongs.filter((psong) => {
          if (songs.find((song) => song.id === psong.id)) return false;
          else return true;
        })
      );
    });

    return () => {
      socket.off("playlist-updated-added");
      socket.off("playlist-updated-deleted");
    };
  }, []);

  function addSongsToPlaylist(song) {
    setDeletedSongs([...deletedSongs, song]);
  }

  async function editPlayList(e) {
    setPlayListSongs(
      playListSongs.filter((song) => {
        if (deletedSongs.find((s) => s.id === song.data.id)) return false;
        return true;
      })
    );
    console.log(playListSongs);
    try {
      const res = await axios.post(
        "http://localhost:3000/edit-playlist",
        {
          playlist: deletedSongs,
        },
        { withCredentials: true }
      );
      setDeletedSongs([]);
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  }

  async function playSongs(index) {
    if (index >= playListSongs.length) return;
    const options = {
      method: "GET",
      url: "https://spotify23.p.rapidapi.com/tracks/",
      params: {
        ids: playListSongs[index].data.id,
      },
      headers: {
        "x-rapidapi-key": "ad7dc01ce7msh80ed06d7d56428ep1e69c5jsna79aa9dc4237",
        "x-rapidapi-host": "spotify23.p.rapidapi.com",
      },
    };
    try {
      const response = await axios.request(options);
      audioRef.current.src = response.data.tracks[0].preview_url;
      await audioRef.current.play();
      if (playButton.current) {
        playButton.current.className = "bi bi-pause-circle";
      }
    } catch (error) {
      console.error(error);
    }
  }

  function playSong() {
    if (!audioRef.current.src) {
      setCurrentSongIndex(0);
      playSongs(0);
    } else {
      if (audioRef.current.paused) {
        audioRef.current.play();
        playButton.current.className = "bi bi-pause-circle";
      } else {
        audioRef.current.pause();
        playButton.current.className = "bi bi-play-circle";
      }
    }
  }
  useEffect(() => {
    if (!audioRef.current) return;

    const handleEnded = () => {
      setCurrentSongIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex < playListSongs.length) {
          playSongs(nextIndex);
          return nextIndex;
        } else {
          playButton.current.className = "bi bi-play-circle";
          return 0;
        }
      });
    };

    audioRef.current.addEventListener("ended", handleEnded);

    return () => {
      audioRef.current.removeEventListener("ended", handleEnded);
    };
  }, [playListSongs]);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center">
      {deletedSongs.length > 0 ? (
        <div className="fixed-bottom p-2 d-flex justify-content-evenly align-items-center border border-white bg-success  border-bottom-0 border-start-0 border-end-0  border-3 rounded">
          <p className="text-black p-2 rounded bg-transparent fw-bold m-0">
            {/* Changes in Playlist ({session?.playlist_session_id?.name}) */}
          </p>
          <div className="w-25 bg-transparent d-flex gap-2">
            <button
              className="btn btn-white bg-white text-black fw-bold"
              onClick={() => {
                setDeletedSongs([]);
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-white bg-white text-black fw-bold"
              onClick={(e) => {
                editPlayList(e);
              }}
              disabled={playListSongs.length === 0}
            >
              Save
            </button>
          </div>
        </div>
      ) : null}
      <div className="d-flex flex-row  justify-content-center align-items-center gap-2">
        <div
          className="align-self-start mt-4"
          onClick={() => {
            navigate("/");
          }}
        >
          <i
            className="bi bi-arrow-left-circle"
            style={{ fontSize: "2rem" }}
          ></i>
        </div>
        <div className="m-4">
          <h1>Playlist ( {playListName} )</h1>
          <div className="d-flex flex-row gap-5">
            <div>
              <h5>{songsCount} Songs</h5>
              <h6>Shareable Id : {sessionId}</h6>
            </div>
            <div className="align-self-center" onClick={playSong}>
              <i
                ref={playButton}
                className={"bi bi-play-circle"}
                style={{ fontSize: "2.5rem" }}
              ></i>
              <audio ref={audioRef}></audio>
            </div>
          </div>
        </div>
      </div>
      <div>
        {playListSongs.length > 0
          ? playListSongs.map((song, index) => {
              return (
                <div
                  key={song.data.id}
                  className="d-flex align-items-center justify-content-center"
                >
                  {index === currentSongIndex ? (
                    <SongCard song={song} effect="bi bi-soundwave" />
                  ) : (
                    <SongCard song={song} effect="" />
                  )}
                  <div className="d-flex flex-column gap-2">
                    <p className="bi bi-hand-thumbs-up m-0"> 5</p>
                    <p className="bi bi-hand-thumbs-down m-0"> 1</p>
                    <i
                      className={
                        deletedSongs.find((s) => s.id === song.data.id)
                          ? "bi bi-trash-fill ms-2"
                          : "bi bi-trash ms-2"
                      }
                      onClick={(e) => {
                        addSongsToPlaylist(song);
                      }}
                    ></i>
                  </div>
                </div>
              );
            })
          : null}
      </div>
    </div>
  );
}

export default Playlist;
