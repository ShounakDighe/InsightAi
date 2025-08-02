import { useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";
import Menubar from "./Menubar.jsx";
import Sidebar from "./Sidebar.jsx";

const Dashboard = ({children}) => {
    const {user} = useContext(AppContext);
    return (
        <div>
            <Menubar/>

            {user && (
                <div className="flex">
                    <div className="max-[1080px]:hidden">
                        {/*Sidebar Content*/}
                        <Sidebar/>
                    </div>
                    <div className="grow mx-5">{children}</div>
                </div>
            )}
        </div>
    )
}

export default Dashboard;