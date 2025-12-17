import { useEffect, useState } from "react";
import "./App.css";

// map product id -> public image URL
const productImage = (id) => {
  const map = {
    smart_tv_x: "/assets/smart_tv_x.png",
    laptop_x: "/assets/laptop_x.png",
    fridge_y: "/assets/fridge_y.png",
    ac_z: "/assets/ac_z.png",
    washing_machine_x: "/assets/washing_machine_x.png",
    microwave_x: "/assets/microwave_x.png",
    soundbar_x: "/assets/soundbar_x.png",
    router_x: "/assets/router_x.png",
    monitor_x: "/assets/monitor_x.png",
    smartphone_x: "/assets/smartphone_x.png",
  };
  return map[id] || "/assets/smart_tv_x.png";
};

// map retailer name -> logo
const retailerLogo = (name) => {
  const map = {
    Amazon: "/logos/amazon.png",
    Flipkart: "/logos/flipkart.png",
    Croma: "/logos/croma.png",
  };
  return map[name] || "/logos/amazon.png";
};

// map retailer name -> external search URL
const retailerUrl = (retailer, productName) => {
  const query = encodeURIComponent(productName);
  if (retailer === "Amazon") return `https://www.amazon.in/s?k=${query}`;
  if (retailer === "Flipkart") return `https://www.flipkart.com/search?q=${query}`;
  if (retailer === "Croma") return `https://www.croma.com/search/?text=${query}`;
  return "#";
};

function App() {
  // auth + simple login form (demo only)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // app data
  const [products, setProducts] = useState([]);
  const [detail, setDetail] = useState(null);
  const [page, setPage] = useState("home"); // "home" | "scanner" | "summary"

  const [wPrice, setWPrice] = useState(0.5);
  const [wEnergy, setWEnergy] = useState(0.25);
  const [wTco, setWTco] = useState(0.25);

  // load products only after login
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, [isAuthenticated]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginId.trim() || !loginPassword.trim()) {
      setLoginError("Please enter email / username and password.");
      return;
    }
    setLoginError("");
    setIsAuthenticated(true);
  };

  const loadDetail = async (id) => {
    const url = `/product/${id}?w_price=${wPrice}&w_energy=${wEnergy}&w_tco=${wTco}`;
    const res = await fetch(url);
    const data = await res.json();
    // expected: data.price_history = [{date: "2025-07-21", price: 24999}, ...]
    setDetail(data);
    setPage("scanner"); // go to Deal Scanner page
  };

  const goBackHome = () => {
    setDetail(null);
    setPage("home");
  };

  const bestRetailer = detail
    ? Object.entries(detail.retailers).reduce((best, [ret, info]) =>
        info.deal_score > (best?.info?.deal_score || 0) ? { ret, info } : best
      )
    : null;

  // Flipkart vs Croma savings summary
  const savingsInfo = detail
    ? (() => {
        const retailers = detail.retailers;
        const flip = retailers["Flipkart"];
        const croma = retailers["Croma"];
        if (!flip || !croma) return null;

        const best =
          flip.deal_score >= croma.deal_score
            ? {
                name: "Flipkart",
                info: flip,
                otherName: "Croma",
                otherInfo: croma,
              }
            : {
                name: "Croma",
                info: croma,
                otherName: "Flipkart",
                otherInfo: flip,
              };

        const nowSaving =
          best.otherInfo.current_price - best.info.current_price;
        const tcoSaving =
          best.otherInfo.tco_5_years - best.info.tco_5_years;

        return {
          bestName: best.name,
          otherName: best.otherName,
          nowSaving,
          tcoSaving,
        };
      })()
    : null;

  const maxDealScore = detail
    ? Math.max(
        ...Object.values(detail.retailers).map((info) => info.deal_score)
      )
    : null;

  const dealLabel =
    maxDealScore == null
      ? ""
      : maxDealScore >= 80
      ? "Great Deal"
      : maxDealScore >= 60
      ? "Okay Deal"
      : "Weak Deal";

  // ---------- LOGIN SCREEN ----------
  if (!isAuthenticated) {
    return (
      <div className="landing-root">
        <div className="landing-overlay" />
        <header className="landing-header">
          <span className="landing-logo-dot" />
          <span className="landing-logo-text">ElectroSave</span>
        </header>

        <main className="landing-main">
          <section className="landing-hero-card">
            <div className="landing-hero-left">
              <h1>
                Smarter deals for
                <br />
                every watt you pay.
              </h1>
              <p>
                ElectroSave predicts future prices and energy costs for TVs,
                laptops, ACs and more, so you can buy once and save for years.
              </p>

              <form className="login-form" onSubmit={handleLoginSubmit}>
                <label className="login-label">
                  Email or username
                  <input
                    type="text"
                    className="login-input"
                    placeholder="you@example.com"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                  />
                </label>

                <label className="login-label">
                  Password
                  <input
                    type="password"
                    className="login-input"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </label>

                {loginError && (
                  <div className="login-error">{loginError}</div>
                )}

                <button type="submit" className="primary-cta login-submit">
                  Login
                </button>
              </form>

              <p className="landing-footnote">
                Demo login only. Any email / username and password will enter
                the app.
              </p>
            </div>

            <div className="landing-hero-right">
              <div className="landing-mock-card">
                <div className="landing-mock-header">
                  <span>Live demo</span>
                  <span className="landing-mock-pill">AI deal scanner</span>
                </div>
                <div className="landing-mock-body">
                  <div className="landing-mock-product">
                    <div className="landing-mock-thumb" />
                    <div>
                      <h3>Laptop X • 14&quot; OLED</h3>
                      <p>Seamless comparison across Amazon, Flipkart, Croma.</p>
                    </div>
                  </div>

                  <div className="landing-mock-gauge">
                    <div className="landing-mock-gauge-track">
                      <div
                        className="landing-mock-gauge-indicator"
                        style={{ left: "84%" }}
                      />
                    </div>
                    <span className="landing-mock-gauge-label">
                      Great deal • 84
                    </span>
                  </div>

                  <ul className="landing-mock-list">
                    <li>Instant best retailer suggestion</li>
                    <li>5‑year energy and TCO projection</li>
                    <li>Smart “buy now vs wait” advice</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // ---------- MAIN APP (AFTER LOGIN) ----------
  // Build price-history points for summary graph
  const history = detail?.price_history || [];
history.map(p => p.price)

  const minPrice =
    history.length > 0
      ? Math.min(...history.map((p) => p.price))
      : 0;
  const maxPrice =
    history.length > 0
      ? Math.max(...history.map((p) => p.price))
      : 1;
  const range = maxPrice - minPrice || 1;

  const graphPoints =
    history.length > 0
      ? history.map((p, idx) => {
          const x =
            (idx / Math.max(history.length - 1, 1)) * 100;
          const y =
            100 -
            ((p.price - minPrice) / range) * 100;
          return { x, y };
        })
      : [];

  return (
    <div className="app-root">
      <header className="hero-header">
        <h1>ElectroSave</h1>
        <p>AI Price Prediction &amp; Energy-Aware Deals</p>
      </header>

      {/* PAGE 1: home – products only */}
      {page === "home" && (
        <>
          <div className="products-grid">
            {products.map((p) => (
              <div
                key={p.id}
                className="product-pill"
                onClick={() => loadDetail(p.id)}
              >
                <div className="product-pill-inner">
                  <img
                    src={productImage(p.id)}
                    alt={p.name}
                    className="product-thumb"
                  />
                  <div>
                    <h3>{p.name}</h3>
                    <p>
                      ₹{p.min_price} - ₹{p.max_price}
                    </p>
                    <span className="product-pill-cta">
                      View smart deals →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* PAGE 2: scanner – hero + Deal Scanner + sliders */}
      {page === "scanner" && detail && (
        <>
          <div className="back-btn" onClick={goBackHome}>
            ← Back to Products
          </div>

          <div className="detail-hero-grid">
            <div className="detail-header">
              <div className="detail-hero-wrapper">
                <img
                  src={productImage(detail.id)}
                  alt={detail.name}
                  className="detail-hero-image"
                />
              </div>
              <h2>{detail.name}</h2>
              {bestRetailer && (
                <p className="best-deal-text">
                  Best now: {bestRetailer.ret} at ₹
                  {bestRetailer.info.current_price.toLocaleString()} (Score:{" "}
                  {bestRetailer.info.deal_score.toFixed(2)}) – Buy now
                </p>
              )}
            </div>

            {maxDealScore != null && (
              <div className="deal-scanner-card">
                <h3>Deal Scanner</h3>

                <div className="deal-scanner-gauge">
                  <div className="deal-gauge-track">
                    <div
                      className="deal-gauge-indicator"
                      style={{ left: `${Math.min(maxDealScore, 100)}%` }}
                    />
                  </div>
                  <span className="deal-gauge-score">
                    {maxDealScore.toFixed(0)}
                  </span>
                </div>

                <p className="deal-scanner-label">{dealLabel}</p>

                {bestRetailer && (
                  <>
                    <ul className="deal-scanner-points">
                      <li>
                        Best offer from <strong>{bestRetailer.ret}</strong> at ₹
                        {bestRetailer.info.current_price.toLocaleString()}.
                      </li>
                      <li>
                        5‑year TCO: ₹
                        {bestRetailer.info.tco_5_years.toLocaleString()}.
                      </li>
                      <li>
                        Prediction: price may{" "}
                        {bestRetailer.info.predicted_future_price <
                        bestRetailer.info.current_price
                          ? "drop"
                          : "stay similar"}{" "}
                        soon.
                      </li>
                    </ul>

                    <div className="deal-breakdown-row">
                      <div className="deal-breakdown-pill">
                        <span className="deal-break-label">Price score</span>
                        <span className="deal-break-value">
                          {bestRetailer.info.price_score.toFixed(0)}/100
                        </span>
                      </div>
                      <div className="deal-breakdown-pill">
                        <span className="deal-break-label">Energy cost</span>
                        <span className="deal-break-value">
                          ₹
                          {bestRetailer.info.annual_energy_cost.toLocaleString()}
                          /yr
                        </span>
                      </div>
                      <div className="deal-breakdown-pill">
                        <span className="deal-break-label">
                          5‑yr savings vs next
                        </span>
                        <span className="deal-break-value">
                          ₹
                          {Math.max(
                            0,
                            savingsInfo?.nowSaving || 0
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="sliders-section">
            <label>Price Weight: {Math.round(wPrice * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={wPrice}
              onChange={(e) => setWPrice(parseFloat(e.target.value))}
            />
            <label>Energy Weight: {Math.round(wEnergy * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={wEnergy}
              onChange={(e) => setWEnergy(parseFloat(e.target.value))}
            />
            <label>TCO Weight: {Math.round(wTco * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={wTco}
              onChange={(e) => setWTco(parseFloat(e.target.value))}
            />
            <button
              className="update-btn"
              onClick={() => loadDetail(detail.id)}
            >
              Update Scores
            </button>
          </div>

          <button
            className="update-btn"
            style={{ marginTop: 12 }}
            onClick={() => setPage("summary")}
          >
            View full savings table
          </button>
        </>
      )}

      {/* PAGE 3: summary – price history + savings + big table */}
      {page === "summary" && detail && (
        <>
          <div className="back-btn" onClick={() => setPage("scanner")}>
            ← Back to Deal Scanner
          </div>

          <div className="price-history-card">
            <div className="price-history-header">
              <h3>Price History</h3>
              <div className="price-history-tabs">
                <button className="ph-tab">1 Month</button>
                <button className="ph-tab">3 Month</button>
                <button className="ph-tab ph-tab-active">Max</button>
              </div>
            </div>

            <div className="price-history-body">
              <div className="price-history-yaxis">
                <span>₹30K</span>
                <span>₹20K</span>
                <span>₹10K</span>
                <span>0</span>
              </div>

              <div className="price-history-graph">
                <div className="price-history-fill" />

                {graphPoints.length > 0 && (
                  <svg
                    viewBox="0 0 100 100"
                    className="price-history-svg"
                    preserveAspectRatio="none"
                  >
                    {/* area */}
                    <path
                      className="ph-area"
                      d={
                        `M ${graphPoints[0].x},100 ` +
                        graphPoints
                          .map((p) => `L ${p.x},${p.y}`)
                          .join(" ") +
                        ` L ${graphPoints[graphPoints.length - 1].x},100 Z`
                      }
                    />
                    {/* step line */}
                    <path
                      className="ph-line"
                      d={
                        `M ${graphPoints[0].x},${graphPoints[0].y} ` +
                        graphPoints
                          .map((p, i, arr) =>
                            i === 0
                              ? ""
                              : `L ${p.x},${arr[i - 1].y} L ${p.x},${p.y}`
                          )
                          .join(" ")
                      }
                    />
                  </svg>
                )}

                <div className="price-history-xaxis">
                  {/* static sample labels; optional to map from history */}
                  <span>21 Jul</span>
                  <span>4 Aug</span>
                  <span>18 Aug</span>
                  <span>1 Sep</span>
                  <span>15 Sep</span>
                  <span>29 Sep</span>
                  <span>13 Oct</span>
                  <span>27 Oct</span>
                  <span>10 Nov</span>
                  <span>24 Nov</span>
                  <span>8 Dec</span>
                </div>
              </div>
            </div>
          </div>

          {savingsInfo && (
            <div className="savings-card">
              <h3>Savings summary</h3>
              <p>
                Choosing <strong>{savingsInfo.bestName}</strong> saves{" "}
                <strong>
                  ₹{savingsInfo.nowSaving.toLocaleString()}
                </strong>{" "}
                compared to <strong>{savingsInfo.otherName}</strong> on the
                upfront price today.
              </p>
              <p>
                Over 5 years, you save{" "}
                <strong>
                  ₹{savingsInfo.tcoSaving.toLocaleString()}
                </strong>{" "}
                in total cost of ownership versus{" "}
                <strong>{savingsInfo.otherName}</strong>.
              </p>
            </div>
          )}

          {bestRetailer && (
            <div className="summary-strip">
              <span>🔍 Smart suggestion:</span>
              <strong>{bestRetailer.ret}</strong> is currently the best choice
              with deal score{" "}
              <strong>{bestRetailer.info.deal_score.toFixed(2)}</strong> and
              price ₹{bestRetailer.info.current_price.toLocaleString()}.
            </div>
          )}

          <div className="deals-card">
            <table className="deals-table">
              <thead>
                <tr>
                  <th>Retailer</th>
                  <th>Current Price</th>
                  <th>Predicted Price</th>
                  <th>Annual Energy</th>
                  <th>TCO 5 Years</th>
                  <th>Price Score</th>
                  <th>Deal Score</th>
                  <th>Advice</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(detail.retailers).map(([ret, info]) => (
                  <tr
                    key={ret}
                    className={bestRetailer?.ret === ret ? "best-row" : ""}
                  >
                    <td className="retailer-cell">
                      <div className="retailer-info">
                        <img
                          src={retailerLogo(ret)}
                          alt={ret}
                          className="retailer-logo"
                        />
                        <span
                          className={`badge ${ret
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {ret}
                        </span>
                      </div>
                      <a
                        href={retailerUrl(ret, detail.name)}
                        target="_blank"
                        rel="noreferrer"
                        className="retailer-link"
                      >
                        Go to site →
                      </a>
                    </td>
                    <td className="price-strong">
                      ₹{info.current_price.toLocaleString()}
                    </td>
                    <td>₹{info.predicted_future_price.toLocaleString()}</td>
                    <td>₹{info.annual_energy_cost.toLocaleString()}</td>
                    <td>₹{info.tco_5_years.toLocaleString()}</td>
                    <td>{info.price_score.toFixed(2)}</td>
                    <td className="deal-score-strong">
                      {info.deal_score.toFixed(2)}
                    </td>
                    <td
                      className={
                        info.advice === "Buy now"
                          ? "advice-buy"
                          : "advice-wait"
                      }
                    >
                      {info.advice}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
