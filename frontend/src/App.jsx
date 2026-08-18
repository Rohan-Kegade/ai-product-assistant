import { useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeProduct = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
        }),
      });

      const data = await response.json();

      setResult(data);
    } catch (error) {
      setResult({
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Amazon Product Analyzer</h1>

      <input
        type="text"
        placeholder="Enter Amazon product URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{
          width: "500px",
          padding: "10px",
        }}
      />

      <button
        onClick={analyzeProduct}
        disabled={loading}
        style={{
          marginLeft: "10px",
          padding: "10px 20px",
        }}
      >
        {loading ? "Analyzing..." : "Analyze Product"}
      </button>

      {result && (
        <pre
          style={{
            marginTop: "30px",
            padding: "20px",
            background: "#f5f5f5",
            whiteSpace: "pre-wrap",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;
