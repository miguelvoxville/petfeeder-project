// File: src/components/Navbar.tsx
import { supabase } from '../lib/supabase'

export function Navbar() {
  const handleLogout = async () => {
    await supabase.auth.signOut()
    // podes também limpar estado ou redirecionar para a página de login:
    window.location.reload()
  }

  return (
    <div className="navbar bg-base-100 px-4 shadow">
      {/* Título / Logo */}
      <div className="flex-1">
        <span className="btn btn-ghost normal-case text-xl">PetFeeder</span>
      </div>

      {/* Botão de menu / logout */}
      <div className="flex-none">
        <div className="dropdown dropdown-end">
          {/* Ícone “hamburger” */}
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
          {/* Dropdown com opção de logout */}
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-44"
          >
            <li>
              <button onClick={handleLogout} className="justify-between">
                🚪 Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
