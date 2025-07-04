// File: src/assets/Login.tsx
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      alert("❌ Erro: " + error.message);
    } else {
      alert("✅ Login com sucesso!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-sm shadow-lg bg-base-100">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">🔐 Entrar</h2>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="seu@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Palavra-passe</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control mt-6">
            <button
              onClick={login}
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              disabled={loading || !email || !password}
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

