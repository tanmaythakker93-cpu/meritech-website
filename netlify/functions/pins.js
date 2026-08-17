const GITHUB_API = "https://api.github.com";
const REPO = process.env.GITHUB_REPO || "tanmaythakker93-cpu/meritech-website";
const TOKEN = process.env.GITHUB_TOKEN;
const LABEL = "pin";

function json(status, body) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function ghHeaders() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "meritech-pin-widget",
  };
}

// Pin metadata is stored as a fenced JSON block at the top of the issue body,
// so the widget can round-trip position/page data through GitHub Issues.
function encodeBody(meta, comment) {
  return "```pin-meta\n" + JSON.stringify(meta, null, 2) + "\n```\n\n" + comment;
}

function decodeIssue(issue) {
  const match = issue.body && issue.body.match(/```pin-meta\n([\s\S]*?)\n```\n\n([\s\S]*)/);
  let meta = {};
  let comment = issue.body || "";
  if (match) {
    try {
      meta = JSON.parse(match[1]);
    } catch (e) {
      meta = {};
    }
    comment = match[2];
  }
  return {
    id: issue.number,
    number: issue.number,
    html_url: issue.html_url,
    state: issue.state,
    page: meta.page || null,
    xPercent: meta.xPercent,
    yPercent: meta.yPercent,
    selector: meta.selector || null,
    comment,
    author: issue.user && issue.user.login ? issue.user.login : meta.author || "Anonymous",
    createdAt: issue.created_at,
  };
}

async function listPins(page) {
  const res = await fetch(
    `${GITHUB_API}/repos/${REPO}/issues?labels=${LABEL}&state=all&per_page=100`,
    { headers: ghHeaders() }
  );
  if (!res.ok) {
    throw new Error(`GitHub list failed: ${res.status} ${await res.text()}`);
  }
  const issues = await res.json();
  return issues
    .filter((i) => !i.pull_request)
    .map(decodeIssue)
    .filter((p) => !page || p.page === page);
}

async function createPin(data) {
  const meta = {
    page: data.page,
    xPercent: data.xPercent,
    yPercent: data.yPercent,
    selector: data.selector || null,
    author: data.author || "Anonymous",
  };
  const title = `Pin: ${data.page} — ${(data.comment || "").slice(0, 60)}`;
  const res = await fetch(`${GITHUB_API}/repos/${REPO}/issues`, {
    method: "POST",
    headers: ghHeaders(),
    body: JSON.stringify({
      title,
      body: encodeBody(meta, data.comment || ""),
      labels: [LABEL],
    }),
  });
  if (!res.ok) {
    throw new Error(`GitHub create failed: ${res.status} ${await res.text()}`);
  }
  const issue = await res.json();
  return decodeIssue(issue);
}

async function addComment(id, data) {
  const body = `**${data.author || "Anonymous"}:** ${data.comment || ""}`;
  const res = await fetch(`${GITHUB_API}/repos/${REPO}/issues/${id}/comments`, {
    method: "POST",
    headers: ghHeaders(),
    body: JSON.stringify({ body }),
  });
  if (!res.ok) {
    throw new Error(`GitHub comment failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function setState(id, state) {
  const res = await fetch(`${GITHUB_API}/repos/${REPO}/issues/${id}`, {
    method: "PATCH",
    headers: ghHeaders(),
    body: JSON.stringify({ state }),
  });
  if (!res.ok) {
    throw new Error(`GitHub state update failed: ${res.status} ${await res.text()}`);
  }
  const issue = await res.json();
  return decodeIssue(issue);
}

async function getIssue(id) {
  const res = await fetch(`${GITHUB_API}/repos/${REPO}/issues/${id}`, {
    headers: ghHeaders(),
  });
  if (!res.ok) {
    throw new Error(`GitHub get issue failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function editPin(id, data) {
  const issue = await getIssue(id);
  const current = decodeIssue(issue);
  const meta = {
    page: current.page,
    xPercent: current.xPercent,
    yPercent: current.yPercent,
    selector: current.selector,
    author: current.author,
  };
  const res = await fetch(`${GITHUB_API}/repos/${REPO}/issues/${id}`, {
    method: "PATCH",
    headers: ghHeaders(),
    body: JSON.stringify({ body: encodeBody(meta, data.comment || "") }),
  });
  if (!res.ok) {
    throw new Error(`GitHub edit failed: ${res.status} ${await res.text()}`);
  }
  const updated = await res.json();
  return decodeIssue(updated);
}

async function deletePin(id) {
  const issue = await getIssue(id);
  const query = `mutation($issueId: ID!) { deleteIssue(input: { issueId: $issueId }) { clientMutationId } }`;
  const res = await fetch(`${GITHUB_API}/graphql`, {
    method: "POST",
    headers: ghHeaders(),
    body: JSON.stringify({ query, variables: { issueId: issue.node_id } }),
  });
  const result = await res.json();
  if (!res.ok || result.errors) {
    throw new Error(`GitHub delete failed: ${res.status} ${JSON.stringify(result.errors || result)}`);
  }
  return { deleted: true, id };
}

exports.handler = async (event) => {
  if (!TOKEN) {
    return json(500, { error: "GITHUB_TOKEN is not configured on this site." });
  }

  const params = event.queryStringParameters || {};

  try {
    if (event.httpMethod === "GET") {
      const pins = await listPins(params.page);
      return json(200, pins);
    }

    if (event.httpMethod === "POST") {
      const data = JSON.parse(event.body || "{}");

      if (params.id && params.action === "comment") {
        const comment = await addComment(params.id, data);
        return json(201, comment);
      }
      if (params.id && params.action === "resolve") {
        const pin = await setState(params.id, "closed");
        return json(200, pin);
      }
      if (params.id && params.action === "reopen") {
        const pin = await setState(params.id, "open");
        return json(200, pin);
      }
      if (params.id && params.action === "edit") {
        if (!data.comment) {
          return json(400, { error: "comment is required to edit a pin." });
        }
        const pin = await editPin(params.id, data);
        return json(200, pin);
      }
      if (params.id && params.action === "delete") {
        const result = await deletePin(params.id);
        return json(200, result);
      }

      if (!data.page || data.xPercent == null || data.yPercent == null) {
        return json(400, { error: "page, xPercent, and yPercent are required." });
      }
      const pin = await createPin(data);
      return json(201, pin);
    }

    return json(405, { error: "Method not allowed" });
  } catch (err) {
    return json(502, { error: err.message });
  }
};
