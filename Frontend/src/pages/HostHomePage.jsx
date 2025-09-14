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
      <h1>Host Home Page</h1>
    ) : (
      <LoginPage />
    )
  ) : null;
}

export default HostHomePage;
