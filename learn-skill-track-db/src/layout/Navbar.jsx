import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import Button from "../components/ui/Button";
import "../style/navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 567);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 567);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/login", { replace: true });
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      {/* Logo */}
      <div className="nav-logo" onClick={() => handleNavigate("/dashboard")}>
        <span className="logo-text">LST</span>
        <span className="logo-sub">Learn · Skill · Track</span>
      </div>

      {/* Desktop Links */}
      <nav className="nav-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/subjects">Subjects</NavLink>
        <NavLink to="/tasks">Tasks</NavLink>
        <NavLink to="/progress">Progress</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </nav>

      {/* Desktop Logout */}
      {!isMobile && (
        <Button variant="danger" onClick={handleLogout} className="logout-btn">
          Logout
        </Button>
      )}

      {/* Hamburger */}
      <div
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? "show" : ""}`}>
        <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>
          Dashboard
        </NavLink>
        <NavLink to="/subjects" onClick={() => setMenuOpen(false)}>
          Subjects
        </NavLink>
        <NavLink to="/tasks" onClick={() => setMenuOpen(false)}>
          Tasks
        </NavLink>
        <NavLink to="/progress" onClick={() => setMenuOpen(false)}>
          Progress
        </NavLink>
        <NavLink to="/profile" onClick={() => setMenuOpen(false)}>
          Profile
        </NavLink>
        <NavLink to="/contact" onClick={() => setMenuOpen(false)}>
          Contact
        </NavLink>
        <Button
          variant="danger"
          onClick={handleLogout}
          className="logout-btn mobile-btn"
        >
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
