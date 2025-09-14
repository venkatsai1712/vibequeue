import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import LoginPage from "./LoginPage";

function HostHomePage() {
  const [isUser, setUser] = useState(0);
  const [isLoaded, setLoaded] = useState(false);

  useEffect(() => {
    async function getUser() {
      try {
        const res = await axios.get("http://localhost:3000", {
          withCredentials: true,
        });
        console.log(res);
        setUser(1);
        setLoaded(true);
      } catch (err) {
        console.log(err);
        setLoaded(true);
      }
    }
    getUser();
  }, []);
  return isLoaded === true ? (
    isUser === 1 ? (
      <div className="d-flex flex-column justify-content-center align-items-center">
        <div>
          <div className="input-group mt-5">
            <input
              type="text"
              className="form-control bg-black"
              placeholder="Search Songs..."
            />
            <button className="btn btn-outline-white border">Search</button>
          </div>
        </div>
        <div className="card w-75 m-5 p-2 bg-black border border-white">
          <div className="d-flex justify-content-between">
            <div className="">
              <h5 className="card-title">Title Song</h5>
              <p className="card-subtitle">Song Info</p>
            </div>
            <div className="">
              <img
                src="logo.svg"
                className=" rounded"
                style={{ maxHeight: "75px" }}
              />
            </div>
          </div>
        </div>
      </div>
    ) : (
      <LoginPage />
    )
  ) : null;
}

export default HostHomePage;
