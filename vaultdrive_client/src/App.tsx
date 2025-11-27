import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import Login from "./pages/login";

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </Navbar>
      </div>
    </Router>
  );
}

export default App;
