import ReactDOM from "react-dom/client";
import App from "./App";
import { attachConsole, info } from "@tauri-apps/plugin-log";

attachConsole().then(() => {
  console.log("Console attached successfully");
  info("Manual log from frontend via plugin-log");
}).catch(console.error);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
