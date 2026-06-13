import {Page} from "../structures";

function Sidebar({ currentPage, updatePage } : { currentPage: Page, updatePage: (newPage : Page ) => void }){
    return <div id="sidebarWrapper">
        {Object.values(Page).filter(p => p !== Page.FolderDetail).map((button)=>{
            return <button 
                key={button} 
                className={currentPage === button ? "active" : ""} 
                onClick={() => updatePage(button)}
            >
                {button}
            </button>
        })}
    </div>
}

export default Sidebar