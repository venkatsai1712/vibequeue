import { Route, Routes } from "react-router-dom";
import UserHomePage from "./pages/UserHomePage";
import HostHomePage from "./pages/HostHomePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HostHomePage />} />
      <Route path="/User" element={<UserHomePage />} />
    </Routes>
  );
}

export default App;
