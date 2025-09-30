import { useEffect, useRef } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function SongPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [songName, setSongName] = useState("");
  const [songMovie, setSongMovie] = useState("");
  const [songUrl, setSongUrl] = useState("");
  const [songImage, setSongImage] = useState("");
  const audioRef = useRef(null);
  const { id } = useParams();

  useEffect(() => {
    async function getTrack() {
      const options = {
        method: "GET",
        url: "https://spotify23.p.rapidapi.com/tracks/",
        params: {
          ids: id,
        },
        headers: {
          "x-rapidapi-key":
            "ad7dc01ce7msh80ed06d7d56428ep1e69c5jsna79aa9dc4237",
          "x-rapidapi-host": "spotify23.p.rapidapi.com",
        },
      };

      try {
        const response = await axios.request(options);
        setSongName(response.data.tracks[0].name);
        setSongMovie(response.data.tracks[0].album.name);
        setSongUrl(response.data.tracks[0].preview_url);
        setSongImage(response.data.tracks[0].album.images[0].url);
        console.log(response.data.tracks[0].preview_url);
      } catch (error) {
        console.error(error);
      }
    }
    getTrack();
  }, []);

  function progressUpdate() {
    let currtime = audioRef.current.currentTime;
    let duration = audioRef.current.duration;
    setProgress((currtime / duration) * 100);
  }

  function playPause() {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }

  return (
    <div className="d-flex justify-content-center flex-column align-items-center">
      <audio
        ref={audioRef}
        src={songUrl}
        onEnded={() => {
          setIsPlaying(false);
        }}
        onTimeUpdate={progressUpdate}
      />
      <img src={songImage} className="w-75 rounded m-5" />
      <div>
        <h2>{songName}</h2>
      </div>
      <div>
        <h6>{songMovie}</h6>
      </div>
      <div
        className="bg-white rounded m-2"
        style={{ width: "50%", height: "4px" }}
      >
        <div
          className="bg-danger h-100"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div>
        <i
          className={isPlaying ? "bi bi-pause-circle" : "bi bi-play-circle"}
          style={{ fontSize: "2rem" }}
          onClick={playPause}
        ></i>
      </div>
    </div>
  );
}

export default SongPlayer;
