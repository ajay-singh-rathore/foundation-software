import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import TreesList from './pages/TreesList.jsx'
import TreeDetail from './pages/TreeDetail.jsx'
import TreeForm from './pages/TreeForm.jsx'
import UpdateForm from './pages/UpdateForm.jsx'
import MapView from './pages/MapView.jsx'

export default function App() {
  const { pathname } = useLocation()
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">
          <img src="/icon.svg" alt="" width="34" height="34" />
          <div>
            <strong>Foundation Software</strong>
            <span>Tree Plantation Tracker</span>
          </div>
        </Link>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trees" element={<TreesList />} />
          <Route path="/trees/new" element={<TreeForm />} />
          <Route path="/tree/:id" element={<TreeDetail />} />
          <Route path="/tree/:id/update" element={<UpdateForm />} />
          <Route path="/map" element={<MapView />} />
        </Routes>
      </main>

      {pathname !== '/trees/new' && (
        <Link to="/trees/new" className="fab" title="Add new tree">+</Link>
      )}

      <nav className="bottomnav">
        <NavLink to="/" end><span>🏠</span>Home</NavLink>
        <NavLink to="/trees"><span>🌳</span>Trees</NavLink>
        <NavLink to="/map"><span>🗺️</span>Map</NavLink>
        <NavLink to="/trees/new"><span>➕</span>Add</NavLink>
      </nav>
    </div>
  )
}
