import { useState } from "react";
import axios from "axios";
import SongCard from "../components/SongCard";

function UserHomePage() {
  const [sessionId, setSessionId] = useState("");
  const [playListSongs, setPlayListSongs] = useState([]);

  async function getPlaylistSongs() {
    if (!sessionId.trim()) return;
    try {
      const res = await axios.get(
        "http://localhost:3000/user/playlist/" + sessionId,
        { withCredentials: true }
      );

      console.log(res);
      setPlayListSongs(res.data.data[0].songs_queue);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="d-flex flex-column justify-content-center align-items-center m-4 gap-2">
      <div className="d-flex justify-content-center align-items-center gap-2">
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
          Get
        </button>
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

export default UserHomePage;
