import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../state";

export function AuthPage({ initialMode = "login" }: { initialMode?: "login" | "signup" }) {
  const { login } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("demo@clearmatch.app");
  const [password, setPassword] = useState("ClearMatch123!");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await login(email, password, mode);
      navigate(mode === "signup" ? "/personality-test" : "/discover");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong");
    }
  }

  return (
    <main className="authPage">
      <form className="authPanel" onSubmit={submit}>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p>Demo login is prefilled. New accounts must use a password of at least 10 characters.</p>
        <label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required /></label>
        <label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={10} required /></label>
        {error && <p className="formError">{error}</p>}
        <button className="primaryButton" type="submit">{mode === "login" ? "Log in" : "Sign up"}</button>
        <button className="textButton" type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "Create a new account" : "I already have an account"}
        </button>
      </form>
    </main>
  );
}
