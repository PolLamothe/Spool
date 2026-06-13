import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Folders from "./pages/Folders";
import Settings from "./pages/Settings";
import FolderPage from "./pages/Folder";
import {Page, Folder} from "./structures";
import "./App.css";

function App() {
  useEffect(() => {
    console.log("React App initialized - Testing console logs");
  }, []);
    const [currentPage, setCurrentPage] = useState(Page.Home);
    const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

    const navigateToFolder = (folder: Folder) => {
        setSelectedFolder(folder);
        setCurrentPage(Page.FolderDetail);
    };

    console.log("App initialized - Log");
    console.info("App initialized - Info");
    console.error("App initialized - Error");

    return (
        <main className="container" id="container">
            <Sidebar currentPage={currentPage} updatePage={setCurrentPage} />
            <div id="content-area">
                {currentPage == Page.Playlists && <Folders onSelectFolder={navigateToFolder} />}
                {currentPage == Page.Settings && <Settings />}
                {currentPage == Page.Home && <p>{currentPage}</p>}
                {currentPage == Page.FolderDetail && selectedFolder && (
                    <FolderPage 
                        folder={selectedFolder} 
                        onBack={() => setCurrentPage(Page.Playlists)} 
                    />
                )}
            </div>
        </main>
    );
}

export default App;
