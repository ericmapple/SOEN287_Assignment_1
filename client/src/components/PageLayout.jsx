import { Link, useLocation, useNavigate } from "react-router-dom";

import { getFirstName } from "../utils";

function PageLayout(props) {
  const {
    currentUser,
    title,
    subtitle,
    navItems,
    menuExtra,
    children,
    footerText,
    onLogout,
    pageClassName = "portal-page",
  } = props;
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    onLogout();
    navigate("/", { replace: true });
  }

  return (
    <div className={pageClassName}>
      <div className="page-shell">
        <aside className="menu">
          <div className="menu-intro">
            <p className="eyebrow">SOEN 287 Portal</p>
            <h2>
              Hello,
              <br />
              {getFirstName(currentUser?.name)}!
            </h2>
          </div>

          <nav className="menu-links">
            {navItems.map(function (item) {
              const isActive = location.pathname === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={isActive ? "active-link" : ""}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {menuExtra ? <div className="menu-panel">{menuExtra}</div> : null}

          <button type="button" className="menu-button logout-button" onClick={handleLogout}>
            Log out
          </button>
        </aside>

        <header className="header1">
          <div>
            {subtitle ? <p className="eyebrow">{subtitle}</p> : null}
            <h1>{title}</h1>
          </div>
        </header>

        <main className="content">{children}</main>

        <footer className="footer">{footerText || "SOEN 287 Course Management System"}</footer>
      </div>
    </div>
  );
}

export default PageLayout;
