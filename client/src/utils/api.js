const API_BASE = "http://localhost:3001/api";

const defaultOptions = {
  credentials: "include",
  headers: { "Content-Type": "application/json" },
};

async function apiRequest(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...defaultOptions,
    ...options,
  });

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({
      error: "Unknown error",
    }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

/* =======================
   AUTH
======================= */

export async function login(credentials) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function getSession() {
  try {
    return await apiRequest("/auth/session", {
      method: "GET",
    });
  } catch (e) {
    if (e.message === "UNAUTHORIZED") return null;
    return null;
  }
}

export async function logOut() {
  try {
    await apiRequest("/auth/logout", {
      method: "POST",
    });
    return true;
  } catch {
    return false;
  }
}

/* =======================
   GAME
======================= */

export async function startGame() {
  return apiRequest("/game/start", {
    method: "POST",
  });
}

export async function submitGameApi(gameId, route) {
  if (!gameId || !Array.isArray(route)) {
    throw new Error("Invalid gameId or route");
  }

  return apiRequest("/game/submit", {
    method: "POST",
    body: JSON.stringify({ gameId, route }),
  });
}

export async function getMyGames() {
  return apiRequest("/game/my-games");
}

export async function getGameDetail(gameId) {
  return apiRequest(`/game/${gameId}`);
}

/* =======================
   NETWORK / RANKING
======================= */

export async function getNetwork() {
  return apiRequest("/network");
}

export async function getRanking() {
  return apiRequest("/ranking");
}