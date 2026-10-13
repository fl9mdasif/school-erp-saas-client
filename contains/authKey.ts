// Name of the harmless "has a session" flag cookie. It holds no token: the access token lives
// only in memory (Redux) and the refresh token is an httpOnly cookie set by the API.
export const authKey = "asm_session";
