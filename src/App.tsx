import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Folders from "./pages/Folders";
import Settings from "./pages/Settings";
import {Page} from "./structures";
import "./App.css";

function App() {
  useEffect(() => {
    console.log("React App initialized - Testing console logs");
  }, []);
    const [currentPage, setCurrentPage] = useState(Page.Home);
    console.log("App initialized - Log");
    console.info("App initialized - Info");
    console.error("App initialized - Error");

    return (
        <main className="container" id="container">
            <Sidebar currentPage={currentPage} updatePage={setCurrentPage} />
            <div id="content-area">
                {currentPage == Page.Playlists && <Folders />}
                {currentPage == Page.Settings && <Settings />}
                {currentPage == Page.Home && <p>{currentPage}</p>}
            </div>
        </main>
    );
}

export default App;
