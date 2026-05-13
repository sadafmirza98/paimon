import admin from "firebase-admin";

/**
 * Verifies the Firebase ID token sent in the Authorization header.
 * Attaches `req.uid` and `req.user` on success.
 */
const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: no token provided." });
  }

  const token = header.slice(7);
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth token verification failed:", err.message);
    return res.status(401).json({ message: "Unauthorized: invalid or expired token." });
  }
};

export default requireAuth;
