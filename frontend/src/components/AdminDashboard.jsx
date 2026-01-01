import React from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { RobotList } from "./RobotList";

export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <TopBar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <RobotList />
        </main>
      </div>
    </div>
  );
}
