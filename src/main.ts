import "./styles.css";
import { createGameApp } from "./game/createGameApp";

const root = document.querySelector<HTMLDivElement>("#app");

if (!root) {
  throw new Error("Missing #app root element.");
}

root.textContent = "Loading...";

const app = await createGameApp(root);
app.start();
