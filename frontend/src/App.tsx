import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from './pages/Home';
import { Login } from './pages/Login';
import AllMails from './pages/AllMails';

function App() {
  return (
    <BrowserRouter>
      <nav className="p-4 flex gap-4">
        <Link to="/">Home</Link>
        <Link to="/all-mails">All Mails</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/all-mails" element={<AllMails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;