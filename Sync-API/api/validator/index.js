import { serveValidator } from "../../lib/serveValidator.js";

const DEFAULT_SCRIPT = "Example.lua";

export default function handler(req, res) {
  return serveValidator(req, res, DEFAULT_SCRIPT);
}
