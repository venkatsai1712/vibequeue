import { Route, Routes } from "react-router-dom";
import HostHomePage from "./pages/HostHomePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HostHomePage />} />
    </Routes>
  );
}

export default App;
