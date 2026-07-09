const BLOCKED_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>403 Forbidden</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0a0a0f;
      color: #e8e8ef;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .panel {
      text-align: center;
      padding: 3rem 2.5rem;
      border: 1px solid #1f1f2e;
      border-radius: 12px;
      background: #111118;
      max-width: 420px;
    }
    .code { font-size: 4rem; font-weight: 700; color: #ff4d6d; }
    h1 { margin: 0.5rem 0 1rem; font-size: 1.25rem; font-weight: 600; }
    p { color: #8b8b9e; line-height: 1.6; font-size: 0.95rem; }
  </style>
</head>
<body>
  <div class="panel">
    <div class="code">403</div>
    <h1>Access Denied</h1>
    <p>This resource is restricted to authorized clients only.</p>
  </div>
</body>
</html>`;

export function sendBlocked(res) {
  res.status(403);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.send(BLOCKED_HTML);
}

export function sendDeniedScript(res) {
  res.status(403);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.send("-- Access Denied: Validation failed");
}
