import axios from "axios";
import { useEffect, useState } from "react";
import SongCard from "../components/SongCard";

function Playlist() {
  const [playListSongs, setPlayListSongs] = useState([]);
  const [playListName, setPlayListName] = useState("");
  const [songsCount, setSongsCount] = useState("");
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    async function getPlaylistSongs() {
      try {
        const res = await axios.get("http://localhost:3000/playlist", {
          withCredentials: true,
        });
        console.log(res);
        setPlayListName(res.data.data.playlist_session_id.name);
        setSongsCount(res.data.data.playlist_session_id.songs_queue.length);
        setSessionId(res.data.data.playlist_session_id.session_id);
        setPlayListSongs(res.data.data.playlist_session_id.songs_queue);
      } catch (err) {
        console.log(err);
      }
    }
    getPlaylistSongs();
  }, []);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center">
      <div className="m-4">
        <h1>Playlist ( {playListName} )</h1>
        <h5>{songsCount} Songs</h5>
        <h6>Shareable Id : {sessionId}</h6>
      </div>
      <div>
        {playListSongs.length > 0
          ? playListSongs.map((song, index) => {
              return (
                <div
                  key={song.data.id}
                  className="d-flex align-items-center justify-content-center"
                >
                  <SongCard song={song} />
                </div>
              );
            })
          : null}
      </div>
    </div>
  );
}

export default Playlist;
