export interface Env {
	feedback_db: D1Database;
	AI: any;
  }
  
  function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data, null, 2), {
	  status,
	  headers: { "content-type": "application/json; charset=utf-8" },
	});
  }
  
  function html(body: string, status = 200) {
	return new Response(body, {
	  status,
	  headers: { "content-type": "text/html; charset=utf-8" },
	});
  }
  
  const UI_HTML = `<!doctype html>
  <html lang="en">
  <head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width,initial-scale=1" />
	<title>Feedback Insights</title>
	<style>
	  body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 0; background:#0b0f14; color:#e6edf3; }
	  header { padding: 18px 20px; border-bottom: 1px solid #1f2a37; background:#0b0f14; position: sticky; top:0; }
	  h1 { margin: 0; font-size: 18px; letter-spacing: .2px; }
	  main { padding: 18px 20px; max-width: 1100px; margin: 0 auto; }
	  .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 14px; }
	  @media (max-width: 900px){ .grid { grid-template-columns: 1fr; } }
	  .card { background:#0f1620; border: 1px solid #1f2a37; border-radius: 10px; padding: 14px; }
	  label { display:block; font-size: 12px; color:#9fb0c2; margin: 10px 0 6px; }
	  input, select, textarea { width:100%; box-sizing:border-box; padding: 10px; border-radius: 8px; border: 1px solid #2a3a4d; background:#0b0f14; color:#e6edf3; }
	  textarea { min-height: 90px; resize: vertical; }
	  button { padding: 10px 12px; border-radius: 8px; border: 1px solid #2a3a4d; background:#132235; color:#e6edf3; cursor:pointer; }
	  button:hover { background:#173050; }
	  button:disabled { opacity:.6; cursor:not-allowed; }
	  .row { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
	  .muted { color:#9fb0c2; font-size: 12px; }
	  .pill { display:inline-block; padding: 2px 8px; border-radius:999px; border:1px solid #2a3a4d; font-size:12px; color:#c7d2fe; }
	  .pill.neg { color:#fecaca; border-color:#7f1d1d; }
	  .pill.pos { color:#bbf7d0; border-color:#14532d; }
	  .pill.neu { color:#e5e7eb; border-color:#334155; }
	  .list { display:flex; flex-direction:column; gap:10px; margin-top: 10px; }
	  .item { border:1px solid #1f2a37; border-radius:10px; padding: 12px; background:#0b1220; }
	  .item-top { display:flex; justify-content:space-between; gap:10px; align-items:flex-start; }
	  .item pre { white-space:pre-wrap; margin: 8px 0 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas; font-size: 12px; color:#cbd5e1; }
	  .kpi { display:flex; gap:10px; flex-wrap:wrap; margin-top: 8px; }
	  .kpi div { border:1px solid #1f2a37; border-radius:10px; padding: 10px; background:#0b1220; min-width: 130px; }
	  .kpi .num { font-size:18px; margin-top: 4px; }
	  .err { color:#fecaca; }
	  .ok { color:#bbf7d0; }
	  a { color:#93c5fd; text-decoration: none; }
	  a:hover { text-decoration: underline; }
	</style>
  </head>
  <body>
	<header>
	  <h1>Feedback Insights <span class="muted">— Worker + D1 + Workers AI</span></h1>
	</header>
  
	<main>
	  <div class="grid">
		<section class="card">
		  <h2 style="margin:0 0 6px; font-size: 16px;">Add feedback</h2>
		  <div class="muted">Paste feedback from support, GitHub, social, etc. Then analyze it.</div>
  
		  <label>Source</label>
		  <select id="source">
			<option value="support">support</option>
			<option value="github">github</option>
			<option value="forum">forum</option>
			<option value="twitter">twitter</option>
			<option value="other">other</option>
		  </select>
  
		  <label>Feedback text</label>
		  <textarea id="text" placeholder="e.g., I keep getting an auth error and don’t know which token is needed."></textarea>
  
		  <div class="row" style="margin-top: 10px;">
			<button id="submitBtn">Submit</button>
			<button id="refreshBtn" type="button">Refresh list + digest</button>
			<span id="status" class="muted"></span>
		  </div>
		</section>
  
		<section class="card">
		  <h2 style="margin:0 0 6px; font-size: 16px;">Digest</h2>
		  <div class="muted">Aggregated view for PM triage: top themes + sentiment mix.</div>
  
		  <div class="kpi">
			<div>
			  <div class="muted">Total feedback</div>
			  <div id="total" class="num">—</div>
			</div>
			<div>
			  <div class="muted">Neg / Neu / Pos</div>
			  <div id="sentMix" class="num">—</div>
			</div>
		  </div>
  
		  <h3 style="margin:12px 0 6px; font-size: 14px;">Top themes</h3>
		  <div id="themes" class="list"></div>
  
		  <h3 style="margin:12px 0 6px; font-size: 14px;">Latest summaries</h3>
		  <div id="latest" class="list"></div>
		</section>
	  </div>
  
	  <section class="card" style="margin-top: 14px;">
		<div class="row" style="justify-content:space-between;">
		  <div>
			<h2 style="margin:0; font-size: 16px;">Feedback inbox</h2>
			<div class="muted">Click “Analyze” on any row to generate sentiment, themes, and a summary.</div>
		  </div>
		  <div class="muted">
			Tip: share this URL in your submission PDF
		  </div>
		</div>
  
		<div id="inbox" class="list"></div>
	  </section>
  
	  <p class="muted" style="margin-top: 14px;">
		API endpoints: <code>/api/feedback</code>, <code>/api/analyze?id=</code>, <code>/api/digest</code>
	  </p>
	</main>
  
  <script>
	const $ = (id) => document.getElementById(id);
  
	function pillClass(sent) {
	  if (sent === "negative") return "pill neg";
	  if (sent === "positive") return "pill pos";
	  return "pill neu";
	}
  
	function setStatus(msg, ok=true) {
	  $("status").textContent = msg;
	  $("status").className = ok ? "muted ok" : "muted err";
	  if (msg) setTimeout(() => { $("status").textContent = ""; $("status").className = "muted"; }, 4000);
	}
  
	async function api(path, opts) {
	  const res = await fetch(path, opts);
	  const data = await res.json().catch(() => ({}));
	  if (!res.ok) throw new Error(data?.error || ("HTTP " + res.status));
	  return data;
	}
  
	async function refreshInbox() {
	  const data = await api("/api/feedback");
	  const inbox = $("inbox");
	  inbox.innerHTML = "";
  
	  const results = data.results || [];
	  if (!results.length) {
		inbox.innerHTML = '<div class="muted">No feedback yet. Submit one above.</div>';
		return;
	  }
  
	  results.forEach(row => {
		const themes = (() => {
		  try { return JSON.parse(row.themes_json || "[]"); } catch { return []; }
		})();
  
		const el = document.createElement("div");
		el.className = "item";
  
		const sent = row.sentiment || "unscored";
		el.innerHTML = \`
		  <div class="item-top">
			<div>
			  <div class="row">
				<span class="pill">\${row.source}</span>
				<span class="\${pillClass(sent)}">\${sent}</span>
				<span class="muted">#\${row.id} • \${row.created_at}</span>
			  </div>
			  <pre>\${row.text}</pre>
			  \${row.summary ? \`<div class="muted" style="margin-top:8px;"><b>Summary:</b> \${row.summary}</div>\` : ""}
			  \${themes.length ? \`<div class="muted" style="margin-top:6px;"><b>Themes:</b> \${themes.join(", ")}</div>\` : ""}
			</div>
			<div>
			  <button data-id="\${row.id}" class="analyzeBtn">Analyze</button>
			</div>
		  </div>
		\`;
		inbox.appendChild(el);
	  });
  
	  document.querySelectorAll(".analyzeBtn").forEach(btn => {
		btn.addEventListener("click", async (e) => {
		  const id = e.target.getAttribute("data-id");
		  e.target.disabled = true;
		  e.target.textContent = "Analyzing...";
		  try {
			await api("/api/analyze?id=" + encodeURIComponent(id), { method: "POST" });
			setStatus("Analyzed feedback #" + id);
			await refreshAll();
		  } catch (err) {
			setStatus("Analyze failed: " + err.message, false);
		  } finally {
			e.target.disabled = false;
			e.target.textContent = "Analyze";
		  }
		});
	  });
	}
  
	async function refreshDigest() {
	  const data = await api("/api/digest");
	  $("total").textContent = data.total ?? "—";
  
	  const sc = data.sentiment_counts || {};
	  const neg = sc.negative || 0, neu = sc.neutral || 0, pos = sc.positive || 0;
	  $("sentMix").textContent = \`\${neg} / \${neu} / \${pos}\`;
  
	  const themes = $("themes");
	  themes.innerHTML = "";
	  (data.top_themes || []).slice(0,10).forEach(t => {
		const el = document.createElement("div");
		el.className = "item";
		el.innerHTML = \`<div class="row"><span class="pill">\${t.theme}</span><span class="muted">count: \${t.count}</span></div>\`;
		themes.appendChild(el);
	  });
	  if (!(data.top_themes || []).length) themes.innerHTML = '<div class="muted">No themes yet — analyze a few feedback items.</div>';
  
	  const latest = $("latest");
	  latest.innerHTML = "";
	  (data.latest_summaries || []).forEach(s => {
		const el = document.createElement("div");
		el.className = "item";
		el.innerHTML = \`
		  <div class="row">
			<span class="pill">\${s.source}</span>
			<span class="muted">#\${s.id} • \${s.created_at}</span>
		  </div>
		  <div style="margin-top:6px;">\${s.summary}</div>
		\`;
		latest.appendChild(el);
	  });
	  if (!(data.latest_summaries || []).length) latest.innerHTML = '<div class="muted">No summaries yet — analyze a few feedback items.</div>';
	}
  
	async function refreshAll() {
	  await Promise.all([refreshInbox(), refreshDigest()]);
	}
  
	$("submitBtn").addEventListener("click", async () => {
	  const source = $("source").value;
	  const text = $("text").value.trim();
	  if (!text) return setStatus("Please enter feedback text.", false);
  
	  $("submitBtn").disabled = true;
	  $("submitBtn").textContent = "Submitting...";
	  try {
		const created = await api("/api/feedback", {
		  method: "POST",
		  headers: { "content-type": "application/json" },
		  body: JSON.stringify({ source, text }),
		});
		$("text").value = "";
		setStatus("Submitted feedback #" + created.created.id);
		await refreshAll();
	  } catch (err) {
		setStatus("Submit failed: " + err.message, false);
	  } finally {
		$("submitBtn").disabled = false;
		$("submitBtn").textContent = "Submit";
	  }
	});
  
	$("refreshBtn").addEventListener("click", async () => {
	  try { await refreshAll(); setStatus("Refreshed."); }
	  catch (err) { setStatus("Refresh failed: " + err.message, false); }
	});
  
	// initial load
	refreshAll().catch(err => setStatus("Load failed: " + err.message, false));
  </script>
  </body>
  </html>`;
  
  export default {
	async fetch(request: Request, env: Env): Promise<Response> {
	  const url = new URL(request.url);
  
	  // UI at /
	  if (url.pathname === "/" && request.method === "GET") {
		return html(UI_HTML);
	  }
  
	  // Create feedback: POST /api/feedback
	  if (url.pathname === "/api/feedback" && request.method === "POST") {
		const body = (await request.json()) as { source?: string; text?: string };
		const source = (body.source ?? "unknown").trim();
		const text = (body.text ?? "").trim();
		if (!text) return json({ error: "text is required" }, 400);
  
		const row = await env.feedback_db
		  .prepare(
			"INSERT INTO feedback (source, text) VALUES (?, ?) RETURNING id, source, text, created_at"
		  )
		  .bind(source, text)
		  .first();
  
		return json({ created: row });
	  }
  
	  // List feedback: GET /api/feedback
	  if (url.pathname === "/api/feedback" && request.method === "GET") {
		const { results } = await env.feedback_db
		  .prepare(
			"SELECT id, source, text, created_at, sentiment, themes_json, summary FROM feedback ORDER BY id DESC LIMIT 50"
		  )
		  .all();
  
		return json({ results });
	  }
  
	  // Analyze: POST /api/analyze?id=123
	  if (url.pathname === "/api/analyze" && request.method === "POST") {
		const idStr = url.searchParams.get("id");
		if (!idStr) return json({ error: "id query param required" }, 400);
  
		const id = Number(idStr);
		if (!Number.isFinite(id)) return json({ error: "invalid id" }, 400);
  
		const item = await env.feedback_db
		  .prepare("SELECT id, source, text FROM feedback WHERE id = ?")
		  .bind(id)
		  .first<{ id: number; source: string; text: string }>();
  
		if (!item) return json({ error: "not found" }, 404);
  
		const prompt = `
  Return ONLY valid JSON (no markdown, no backticks) with this schema:
  {
	"sentiment": "positive" | "neutral" | "negative",
	"themes": string[],
	"summary": string
  }
  
  Rules:
  - themes must be 1-5 short tags (2-4 words max each)
  - summary must be one sentence, plain English
  
  Feedback source: ${item.source}
  Feedback text: ${item.text}
  `.trim();
  
		const aiResp = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", { prompt });
  
		const text =
		  typeof aiResp === "string"
			? aiResp
			: (aiResp?.response ??
				aiResp?.output_text ??
				aiResp?.result ??
				aiResp?.text ??
				JSON.stringify(aiResp));
  
		let parsed: any = null;
		try {
		  const firstBrace = text.indexOf("{");
		  const lastBrace = text.lastIndexOf("}");
		  const jsonCandidate =
			firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
			  ? text.slice(firstBrace, lastBrace + 1)
			  : text;
		  parsed = JSON.parse(jsonCandidate);
		} catch {
		  parsed = null;
		}
  
		const sentiment = parsed?.sentiment ?? "neutral";
		const themes = Array.isArray(parsed?.themes) ? parsed.themes : [];
		const summary =
		  typeof parsed?.summary === "string" ? parsed.summary : text.slice(0, 240);
  
		await env.feedback_db
		  .prepare("UPDATE feedback SET sentiment = ?, themes_json = ?, summary = ? WHERE id = ?")
		  .bind(sentiment, JSON.stringify(themes), summary, id)
		  .run();
  
		return json({ id, analysis: { sentiment, themes, summary } });
	  }
  
	  // Digest: GET /api/digest
	  if (url.pathname === "/api/digest" && request.method === "GET") {
		const totalRow = await env.feedback_db
		  .prepare("SELECT COUNT(*) as c FROM feedback")
		  .first<{ c: number }>();
		const total = totalRow?.c ?? 0;
  
		const { results: sentRows } = await env.feedback_db
		  .prepare(
			`SELECT COALESCE(sentiment, 'unscored') AS sentiment, COUNT(*) AS count
			 FROM feedback
			 GROUP BY COALESCE(sentiment, 'unscored')`
		  )
		  .all<{ sentiment: string; count: number }>();
  
		const sentiment_counts: Record<string, number> = {};
		for (const r of sentRows ?? []) sentiment_counts[r.sentiment] = r.count;
  
		const { results: themeRows } = await env.feedback_db
		  .prepare("SELECT themes_json FROM feedback WHERE themes_json IS NOT NULL")
		  .all<{ themes_json: string }>();
  
		const themeCount = new Map<string, number>();
		for (const r of themeRows ?? []) {
		  if (!r.themes_json) continue;
		  let arr: unknown;
		  try {
			arr = JSON.parse(r.themes_json);
		  } catch {
			continue;
		  }
		  if (!Array.isArray(arr)) continue;
		  for (const t of arr) {
			if (typeof t !== "string") continue;
			const key = t.trim().toLowerCase();
			if (!key) continue;
			themeCount.set(key, (themeCount.get(key) ?? 0) + 1);
		  }
		}
  
		const top_themes = Array.from(themeCount.entries())
		  .sort((a, b) => b[1] - a[1])
		  .slice(0, 10)
		  .map(([theme, count]) => ({ theme, count }));
  
		const { results: latest } = await env.feedback_db
		  .prepare(
			`SELECT id, source, summary, created_at
			 FROM feedback
			 WHERE summary IS NOT NULL
			 ORDER BY id DESC
			 LIMIT 5`
		  )
		  .all<{ id: number; source: string; summary: string; created_at: string }>();
  
		return json({
		  total,
		  sentiment_counts,
		  top_themes,
		  latest_summaries: latest ?? [],
		});
	  }
  
	  return json({ error: "not found" }, 404);
	},
  };
  