import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Folders from "./pages/Folders";
import Settings from "./pages/Settings";
import {Page} from "./structures";
import "./App.css";

function App() {
    const [currentPage, setCurrentPage] = useState(Page.Home);

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
