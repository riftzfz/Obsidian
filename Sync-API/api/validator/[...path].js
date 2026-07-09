import { serveValidator } from "../../lib/serveValidator.js";

export default function handler(req, res) {
  const pathSegments = req.query.path;
  const joinedPath = Array.isArray(pathSegments) ? pathSegments.join("/") : String(pathSegments || "");
  return serveValidator(req, res, joinedPath);
}
