import { Link } from "react-router-dom";

import "../styles.css";

function DashboardPage(){
    return (
        <div className="dashboard-page">
            <div class="container">

                {/* Left Side Bar menu */}
                <div class="menu">
                    <h2>Hello,<br/>FirstName!</h2>
                    <h2>Menu</h2>
                    <a href="#">Home</a>
                    <a href="#">Profile</a>
                    <a href="#">Message</a>
                    <a href="Dashboard.html">Dashboard</a>
                    <a href="#">My Courses</a>
                    <a href="#">Grades</a>            
                    <a href="#">Academic</a>
                    <a href="#">Help</a>
                    <a href="index.html">Log out</a>
                </div>
                {/* Header/Dashboard Class */}
                <div class="header">
                    <div class="header-left">
                        <h1>Dashboard</h1>
                        <h2>My Courses</h2>
                    <div class="class-cards">
                        <div class="class-card">COMP 248</div>
                        <div class="class-card">SOEN 287</div>
                        <div class="class-card">MATH 205</div>
                        <div class="class-card">ENGR 201</div>
                        
                    </div>
                    </div>
                </div>

            <div class="content">
                    <h2>Timeline</h2>
            <div class="timeline">
                <div class="timeline-event">
                    <span class="time">08:00 AM</span>
                    <p>COMP 248 Lecture</p>
                </div>
                
            </div>
            </div>
                
                
            <div class="content2">
                    <h3>Calendar</h3> 
                <div>Monday</div><hr/>
                <div>Tuesday</div><hr/>
                <div>Wednesday</div><hr/>
                <div>Thursday</div><hr/>
                <div>Friday</div><hr/>
                <div>Saturday</div><hr/>
                <div>Sunday</div><hr/>
            </div>

            </div>
                    <div class="footer">
                    <h4>Footer</h4>
                    <p>&copy; 2026 Dashboard</p>
                </div>
        </div>
    )
}


// To make the file accessible to other files
export default DashboardPage;