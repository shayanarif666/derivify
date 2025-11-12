import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { FiZap, FiEdit3, FiGrid, FiBookOpen, FiX, FiHash } from "react-icons/fi";
import { CiKeyboard } from "react-icons/ci";
import * as math from "mathjs";
import "./App.css"

export default function DerivifyApp() {
  const mfRef = useRef(null);
  const [mlLoaded, setMlLoaded] = useState(false);

  // expression state (what mathjs evaluates)
  const [expr, setExpr] = useState("x^2 + x*y");
  const [latex, setLatex] = useState("");

  // derivative order
  const [order, setOrder] = useState("x"); // 'x' | 'y' | 'xx' | 'yy' | 'xy' | 'yx'

  // practice tabs
  const tabs = ["Polynomial", "Exponential", "Trigonometric", "Logarithmic", "Misc"];
  const [activeTab, setActiveTab] = useState("Polynomial");

  // y slices for multi-var plotting
  const ySlices = useMemo(() => [-2, 0, 2], []);

  // load Mathlive once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await import("mathlive");
        if (mounted) setMlLoaded(true);
      } catch (e) {
        console.error("Failed to load Mathlive", e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // helper: normalize ASCIIMath coming from Mathlive
  const normalizeAscii = (s = "") => {
    // map common math italic / fullwidth variants to plain
    const mapWeirdLetters = (ch) => {
      const map = {
        "𝑥": "x", "𝐱": "x", "𝘹": "x", "ｘ": "x",
        "𝑦": "y", "𝐲": "y", "𝘺": "y", "ｙ": "y",
        "𝑋": "x", "𝑌": "y", // just in case
      };
      return map[ch] || ch;
    };

    const normalized =
      Array.from(s)
        .map(mapWeirdLetters)
        .join("")
        .replace(/\u00A0/g, " ")                         // NBSP → space
        .replace(/[−]/g, "-")                            // unicode minus → -
        // implicit multiplications
        .replace(/([0-9a-zA-Z\)])\s+(\()/g, "$1*$2")     // x (y+1) → x*(y+1)
        .replace(/(\))\s+([0-9a-zA-Z])/g, "$1*$2")       // (x+1) y → (x+1)*y
        .replace(/([0-9a-zA-Z])\s+([0-9a-zA-Z])/g, "$1*$2"); // x y → x*y, 2 x → 2*x

    return normalized.trim();
  };

  // init math-field & bind live input
  useEffect(() => {
    if (!mlLoaded || !mfRef.current) return;
    const mf = mfRef.current;

    try {
      mf.setOptions?.({
        virtualKeyboardMode: "manual",
        virtualKeyboards: "all",
        smartFence: true,
        plonkSound: null,
      });
      // initialize once
      mf.setValue?.("x^2 + x y", { silenceNotifications: true });
    } catch { }

    const handleInput = () => {
      try {
        const ascii = mf.getValue?.("ASCIIMath") || "";
        const latexValue = mf.getValue?.("latex") || "";
        // console.log("ASCIIMath:", ascii, "LaTeX:", latexValue);
        applyExpression(ascii || latexValue);
      } catch (err) {
        console.error(err);
      }
    };

    mf.addEventListener("input", handleInput);
    return () => mf.removeEventListener("input", handleInput);
  }, [mlLoaded]); // eslint-disable-line

  // ---- math helpers -------------------------------------------------------
  const parsed = useMemo(() => {
    try { return math.parse(expr); } catch { return null; }
  }, [expr]);

  const variables = useMemo(() => {
    if (!parsed) return new Set();
    const vars = new Set();
    parsed.traverse((node) => {
      if (node.isSymbolNode && !math[node.name]) vars.add(node.name);
    });
    return vars;
  }, [parsed]);

  const derivativeNode = useMemo(() => {
    if (!parsed) return null;
    try {
      const d = (node, wrt) => math.derivative(node, wrt);
      switch (order) {
        case "x": return d(parsed, "x");
        case "y": return d(parsed, "y");
        case "xx": return d(d(parsed, "x"), "x");
        case "yy": return d(d(parsed, "y"), "y");
        case "xy": return d(d(parsed, "x"), "y");
        case "yx": return d(d(parsed, "y"), "x");
        default: return d(parsed, "x");
      }
    } catch { return null; }
  }, [parsed, order]);

  const derivativeStr = useMemo(() => {
    try { return derivativeNode ? derivativeNode.toString({ parenthesis: "auto" }) : ""; }
    catch { return ""; }
  }, [derivativeNode]);

  const derivativeTex = useMemo(() => {
    try { return derivativeNode ? derivativeNode.toTex({ parenthesis: "auto" }) : ""; }
    catch { return ""; }
  }, [derivativeNode]);

  // chart data
  const chartData = useMemo(() => {
    const data = [];
    const hasY = variables.has("y");
    const hasX = variables.has("x") || !hasY;
    if (!parsed || !hasX) return data;

    const code = parsed.compile();

    for (let x = -6; x <= 6; x += 0.25) {
      const row = { x: Number(x.toFixed(2)) };
      if (hasY) {
        ySlices.forEach((ys) => {
          try {
            const val = code.evaluate({ x, y: ys });
            row[`y=${ys}`] = Number(Number.isFinite(val) ? val : NaN);
          } catch { row[`y=${ys}`] = NaN; }
        });
      } else {
        try {
          const val = code.evaluate({ x });
          row.f = Number(Number.isFinite(val) ? val : NaN);
        } catch { row.f = NaN; }
      }
      data.push(row);
    }
    return data;
  }, [parsed, variables, ySlices]);

  // samples & practice
  const samples = [
    { label: "x^2 + y^2", value: "x^2 + y^2" },
    { label: "x*y^2 + x^2*y", value: "x*y^2 + x^2*y" },
    { label: "e^(x y)", value: "exp(x*y)" },
    { label: "sin(x) + cos(y)", value: "sin(x) + cos(y)" },
    { label: "log(x^2 + y + 1)", value: "log(x^2 + y + 1)" },
    { label: "x^3 y^2", value: "x^3 * y^2" },
  ];

  const practices = {
    Polynomial: ["x^3 + 3x^2 y + y^2", "x^2 y + x y^2", "x^4 - y^4"],
    Exponential: ["exp(x+y)", "e^(x y)", "2^(x) * 3^(y)"],
    Trigonometric: ["sin(x y)", "cos(x) + sin(y)", "tan(x) * sec(y)"],
    Logarithmic: ["log(4x^2 + y^2 + 2x + 1)", "log(x^3 + 2y + 7)", "log(x^2 + 3y + 5)"],
    Misc: ["x^y", "sqrt(x^2 + y^2)", "abs(x*y)"]
  };

  const setFromSample = (value) => {
    // send into math-field UI
    if (mfRef.current) {
      try {
        mfRef.current.setValue?.(value, { silenceNotifications: true });
      } catch (err) {
        console.error(err);
      }
    }
    // and through the same normalization used for typing
    applyExpression(value);
  };

  const resetInput = () => {
    if (mfRef.current) {
      try { mfRef.current.setValue?.("", { silenceNotifications: true }); } catch { }
    }
    applyExpression("");
  };

  const openKeyboard = () => {
    if (!mfRef.current) return;
    try { mfRef.current.executeCommand?.("showVirtualKeyboard"); } catch { }
  };

  const applyExpression = (rawAsciiOrLatex = "") => {
    const ascii = normalizeAscii(rawAsciiOrLatex);
    setExpr(ascii || "");      // what mathjs reads
    setLatex(rawAsciiOrLatex); // just for display / future use
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600/30">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-slate-900 shadow-lg shadow-blue-500/20">
              <FiZap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Derivify</h1>
              <p className="-mt-1 text-xs text-slate-400">Partial Derivative Calculator</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="text-xs text-slate-400">Built with React · Tailwind · Mathlive · Recharts</span>
          </div>
        </div>
      </header>

      {/* Graph */}
      <section className="mx-auto max-w-7xl px-4 pt-6">
        <div className="rounded-2xl border border-white/5 bg-slate-900 p-4 shadow-xl shadow-black/30">
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-300">
            <FiGrid /><span>Function plot</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {variables.has("y") ? (
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="x" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
                  <Legend />
                  {ySlices.map((ys) => (
                    <Line key={ys} type="monotone" dataKey={`y=${ys}`} dot={false} strokeWidth={2} />
                  ))}
                </LineChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="x" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
                  <Legend />
                  <Line type="monotone" dataKey="f" dot={false} strokeWidth={2} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Main grid */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-12">
        {/* Left: Input & Results */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-5 shadow-xl shadow-black/30">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-300"><FiEdit3 /><span>Enter your function</span></div>
              <button onClick={() => { resetInput(); openKeyboard(); }} className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/5">
                <FiX className="-ml-0.5" />Clear
              </button>
            </div>

            {/* Mathlive field */}
            <div className="relative rounded-2xl border border-white/10 bg-slate-950/60 p-3">
              {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
              <math-field
                ref={mfRef}
                autoFocus
                className="w-full max-h-[100px] rounded-xl bg-transparent p-3 text-lg outline-none"
                style={{ color: "#e2e8f0" }}
              >
                x^2 + x y
              </math-field>

              <button
                type="button"
                onClick={openKeyboard}
                title="Open math keyboard"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
              >
                <CiKeyboard size={24} />
              </button>

              {/* <p className="mt-2 text-xs text-slate-400">
                Tip: use variables <span className="font-mono text-slate-300">x</span> and <span className="font-mono text-slate-300">y</span>.
                Supported: <span className="font-mono">+, −, *, /, ^, sin, cos, exp, ln, log, sqrt</span>.
              </p> */}
            </div>

            {/* Derivative controls */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-slate-400">Derivative:</span>
              {[
                { k: "x", label: "∂/∂x" },
                { k: "y", label: "∂/∂y" },
                { k: "xx", label: "∂²/∂x²" },
                { k: "yy", label: "∂²/∂y²" },
                { k: "xy", label: "∂²/∂x∂y" },
                { k: "yx", label: "∂²/∂y∂x" },
              ].map((b) => (
                <button
                  key={b.k}
                  onClick={() => setOrder(b.k)}
                  className={`rounded-xl px-3 py-1.5 text-sm transition ${order === b.k ? "bg-blue-600 text-white" : "bg-white/5 text-slate-200 hover:bg-white/10"}`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Result */}
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-300"><FiHash /> <span>Result (updates live)</span></div>
              {derivativeNode ? (
                <div className="overflow-x-auto">
                  <div className="font-mono text-lg">{derivativeStr}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    LaTeX: <span className="font-mono">{derivativeTex}</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-rose-300">
                  Cannot parse this expression. Try something like <span className="font-mono">x^2 + x*y</span>.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Samples & Practice */}
        <aside className="lg:col-span-4 mb-12">
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-5 shadow-xl shadow-black/30">
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-300"><FiBookOpen /> <span>Sample Examples</span></div>
            <div className="grid grid-cols-2 gap-2">
              {samples.map((s) => (
                <button key={s.label} onClick={() => setFromSample(s.value)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm hover:bg-white/10">
                  {s.label}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <div className="mb-2 text-sm text-slate-300">Practice Questions</div>

              {/* Tabs */}
              <div className="mb-3 flex flex-wrap gap-2">
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${activeTab === t ? "bg-blue-600 text-white" : "bg-white/5 text-slate-200 hover:bg-white/10"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Active panel */}
              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                <div className="grid grid-cols-1 gap-2">
                  {practices[activeTab].map((it, i) => (
                    <button key={i} onClick={() => setFromSample(it)} className="rounded-lg bg-white/5 px-3 py-2 text-left text-sm hover:bg-white/10">
                      {it}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <footer className="mx-auto w-full fixed bottom-0 bg-slate-900 p-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Derivify — made by <span className="text-slate-400 ms-2">Muhammad Shayan</span>.
      </footer>
    </div>
  );
}
