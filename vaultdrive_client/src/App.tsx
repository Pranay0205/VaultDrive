import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import Login from "./pages/login";
import Files from "./pages/files";
import Shared from "./pages/shared";
import About from "./pages/about";

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/files" element={<Files />} />
            <Route path="/shared" element={<Shared />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Navbar>
      </div>
    </Router>
  );
}

export default App;
