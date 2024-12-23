import React, { useState } from 'react';

// Mock data for demonstration
const mockCases = [
  {
    id: 1,
    caseNumber: "CRM(DB)-123/24",
    hearingDate: new Date("2024-03-15"),
    status: "Ongoing",
  },
  {
    id: 2,
    caseNumber: "CRR-456/24",
    hearingDate: new Date("2024-03-18"),
    status: "Upcoming",
  },
  {
    id: 3,
    caseNumber: "CRA(SB)-789/24",
    hearingDate: new Date("2024-03-20"),
    status: "Ongoing",
  },
];

const mockNotifications = [
  {
    id: 1,
    message: "Hearing for CRM(DB)-123/24 scheduled tomorrow",
    date: new Date("2024-03-14"),
  },
  {
    id: 2,
    message: "New case CRR-456/24 assigned to your station",
    date: new Date("2024-03-13"),
  },
];

function PSDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const filteredCases = mockCases.filter((c) =>
    c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-6">PS Dashboard</h2>
        <nav>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-blue-600 hover:underline">Home</a>
            </li>
            <li>
              <a href="#" className="text-gray-600 hover:text-blue-600">All Cases</a>
            </li>
            <li>
              <a href="#" className="text-gray-600 hover:text-blue-600">Notifications</a>
            </li>
            <li>
              <a href="#" className="text-gray-600 hover:text-blue-600">Settings</a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome, PS Officer</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                className="p-2 rounded-full hover:bg-gray-200"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                🔔
                <span className="sr-only">Notifications</span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-10">
                  <h3 className="px-4 py-2 text-sm font-semibold text-gray-700">Notifications</h3>
                  {mockNotifications.map((notification) => (
                    <div key={notification.id} className="px-4 py-2 hover:bg-gray-100">
                      <p className="text-sm text-gray-700">{notification.message}</p>
                      <p className="text-xs text-gray-500">{formatDate(notification.date)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                className="p-2 rounded-full hover:bg-gray-200"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                👤
                <span className="sr-only">User menu</span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Log out</a>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Search */}
        <div className="mb-6">
          <input
            type="search"
            placeholder="Search cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Cases Table */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Ongoing Cases and Upcoming Hearings</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hearing Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCases.map((caseItem) => (
                  <tr key={caseItem.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{caseItem.caseNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(caseItem.hearingDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        caseItem.status === 'Ongoing' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {caseItem.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              View All Cases
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
              Generate Report
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PSDashboard;

