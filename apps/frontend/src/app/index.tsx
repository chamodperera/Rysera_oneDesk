import "./styles.css";

function App() {
  return (
    <div className="container">
      <h1 className="title">
        OneDesk <br />
        <span>Desk Management System</span>
      </h1>
      <p className="description">
        Built With{" "}
        <a
          href="https://turborepo.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Turborepo
        </a>
        {" & "}
        <a href="https://vitejs.dev/" target="_blank" rel="noopener noreferrer">
          Vite
        </a>
      </p>
    </div>
  );
}

export default App;
