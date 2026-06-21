const API_BASE = "http://localhost:3001/api";

const defaultOptions = {
  credentials: "include",
  headers: { "Content-Type": "application/json" },
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
};

// Auth endpoints
export async function logIn(credentials) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      ...defaultOptions,
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function getSession() {
  try {
    const res = await fetch(`${API_BASE}/auth/session`, {
      method: "GET",
      credentials: "include",
    });

    if (res.status === 401) return null;

    if (!res.ok) throw new Error("Session error");

    return await res.json();
  } catch (error) {
    console.error("Session check error:", error);
    return null;
  }
}

export async function logOut() {
  try {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      ...defaultOptions,
    });
    return res.ok;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}

// Game endpoints
export async function startGame() {
  try {
    const res = await fetch(`${API_BASE}/game/start`, {
      method: "POST",
      ...defaultOptions,
    });
    return handleResponse(res);
  } catch (error) {
    console.error("Start game error:", error);
    throw error;
  }
}

export async function submitGameApi(gameId, route) {
  try {
    if (!gameId || !Array.isArray(route)) {
      throw new Error("Invalid gameId or route");
    }

    const res = await fetch(`${API_BASE}/game/submit`, {
      method: "POST",
      ...defaultOptions,
      body: JSON.stringify({ gameId, route }),
    });
    return handleResponse(res);
  } catch (error) {
    console.error("Submit game error:", error);
    throw error;
  }
}

export async function getMyGames() {
  try {
    const res = await fetch(`${API_BASE}/game/my-games`, {
      method: "GET",
      ...defaultOptions,
    });
    return handleResponse(res);
  } catch (error) {
    console.error("Get my games error:", error);
    throw error;
  }
}

export async function getGameDetail(gameId) {
  try {
    const res = await fetch(`${API_BASE}/game/${gameId}`, {
      method: "GET",
      ...defaultOptions,
    });
    return handleResponse(res);
  } catch (error) {
    console.error("Get game detail error:", error);
    throw error;
  }
}

// Network endpoints
export async function getNetwork() {
  try {
    const res = await fetch(`${API_BASE}/network`, {
      method: "GET",
      ...defaultOptions,
    });
    return handleResponse(res);
  } catch (error) {
    console.error("Get network error:", error);
    throw error;
  }
}

// Ranking endpoints
export async function getRanking() {
  try {
    const res = await fetch(`${API_BASE}/ranking`, {
      method: "GET",
      ...defaultOptions,
    });
    return handleResponse(res);
  } catch (error) {
    console.error("Get ranking error:", error);
    throw error;
  }
}