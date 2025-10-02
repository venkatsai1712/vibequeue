import { Link } from "react-router-dom";
import "../pages/PlaylistPage.css";

function SongCard({ song, effect }) {
  return (
    <Link
      className="card w-75 m-2 p-1 bg-black border border-white"
      to={`/Song/${song.data.id}`}
    >
      <div className="d-flex justify-content-between p-1">
        <div className="">
          <h5 className="card-title">
            {song.data.name + ` (${song.data.albumOfTrack.name}) `}
          </h5>
          <p className="card-subtitle">
            {song.data.artists.items[0].profile.name}
          </p>
          <p className="card-subtitle">
            {(song.data.duration.totalMilliseconds / 1000 / 60).toFixed(2) +
              " mins"}
          </p>
        </div>
        <div className="p-1">
          <div>
            <img
              src={song.data.albumOfTrack.coverArt.sources[0].url}
              className={`rounded`}
              style={{ maxHeight: "85px" }}
            />
            {effect !== "" ? (
              <i
                className={`${effect}`}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "1.5rem",
                  color: "white",
                  pointerEvents: "none",
                }}
              ></i>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default SongCard;
