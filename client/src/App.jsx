import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import TreesList from './pages/TreesList.jsx'
import TreeDetail from './pages/TreeDetail.jsx'
import TreeForm from './pages/TreeForm.jsx'
import UpdateForm from './pages/UpdateForm.jsx'
import MapView from './pages/MapView.jsx'
import Sites from './pages/Sites.jsx'
import SiteDetail from './pages/SiteDetail.jsx'
import PrintTags from './pages/PrintTags.jsx'
import NearMe from './pages/NearMe.jsx'
import { useLang, LANGS } from './i18n.jsx'

export default function App() {
  const { pathname } = useLocation()
  const { lang, setLang, t } = useLang()
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  function cycleLang() {
    const i = LANGS.findIndex(l => l.code === lang)
    setLang(LANGS[(i + 1) % LANGS.length].code)
  }

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">
          <img src="/icon.svg" alt="" width="34" height="34" />
          <div>
            <strong>Aranya · अरण्य</strong>
            <span>{t('app_subtitle')}</span>
          </div>
        </Link>
        <div className="topbar-actions">
          <button className="theme-toggle lang-toggle" onClick={cycleLang} title="Change language">
            🌐 {LANGS.find(l => l.code === lang)?.short}
          </button>
          <button
            className="theme-toggle"
            onClick={() => setTheme(tm => (tm === 'light' ? 'dark' : 'light'))}
            title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trees" element={<TreesList />} />
          <Route path="/trees/new" element={<TreeForm />} />
          <Route path="/tree/:id" element={<TreeDetail />} />
          <Route path="/tree/:id/update" element={<UpdateForm />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/near" element={<NearMe />} />
          <Route path="/sites" element={<Sites />} />
          <Route path="/site/:id" element={<SiteDetail />} />
          <Route path="/site/:id/print" element={<PrintTags />} />
        </Routes>
      </main>

      {pathname !== '/trees/new' && (
        <Link to="/trees/new" className="fab" title={t('add_new_tree')}>+</Link>
      )}

      <nav className="bottomnav">
        <NavLink to="/" end><span>🏠</span>{t('nav_home')}</NavLink>
        <NavLink to="/sites"><span>🏞️</span>{t('nav_sites')}</NavLink>
        <NavLink to="/near"><span>📍</span>{t('nav_near')}</NavLink>
        <NavLink to="/trees"><span>🌳</span>{t('nav_trees')}</NavLink>
        <NavLink to="/map"><span>🗺️</span>{t('nav_map')}</NavLink>
      </nav>
    </div>
  )
}
