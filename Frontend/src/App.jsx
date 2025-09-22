import { Route, Routes } from "react-router-dom";
import UserHomePage from "./pages/UserHomePage";
import HostHomePage from "./pages/HostHomePage";
import axios from "axios";
import { createContext, useState } from "react";
import { useEffect } from "react";
import Playlist from "./pages/PlaylistPage";

export const AppContext = createContext();
function App() {
  const [user, setUser] = useState({});
  const [session, setSession] = useState({});

  useEffect(() => {
    async function getUser() {
      try {
        const res = await axios.get("http://localhost:3000", {
          withCredentials: true,
        });
        console.log(res);
        setUser(res.data.user);
        setSession(res.data.session);
      } catch (err) {
        console.log(err.message);
      }
    }
    getUser();
  }, []);

  return (
    <AppContext.Provider value={{ user, session }}>
      <Routes>
        <Route path="/" element={<HostHomePage />} />
        <Route path="/User" element={<UserHomePage />} />
        <Route path="/Playlist" element={<Playlist />} />
      </Routes>
    </AppContext.Provider>
  );
}

export default App;
