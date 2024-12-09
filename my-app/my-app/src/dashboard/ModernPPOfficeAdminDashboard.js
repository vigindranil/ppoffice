import React, { useState } from 'react';

const ModernPPOfficeAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('createStaff');
  const [newStaff, setNewStaff] = useState({
    fullName: '',
    userName: '',
    email: '',
    contactNumber: '',
    licenseNo: '',
    password: ''
  });
  const [passwordReset, setPasswordReset] = useState({ userId: '', newPassword: '' });
  const [caseAllocation, setCaseAllocation] = useState({ caseId: '', staffId: '' });

  // Mock data for demonstration
  const [ppStaff, setPPStaff] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ]);
  const [cases, setCases] = useState([
    { id: 'CASE001', title: 'Case 1' },
    { id: 'CASE002', title: 'Case 2' },
  ]);

  const handleCreateStaff = (e) => {
    e.preventDefault();
    const newStaffMember = { id: ppStaff.length + 1, ...newStaff };
    setPPStaff([...ppStaff, newStaffMember]);
    setNewStaff({ fullName: '', userName: '', email: '', contactNumber: '', licenseNo: '', password: '' });
    alert('New PP staff created successfully!');
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    console.log('Password reset for user:', passwordReset);
    setPasswordReset({ userId: '', newPassword: '' });
    alert('Password reset successfully!');
  };

  const handleCaseAllocation = (e) => {
    e.preventDefault();
    console.log('Case allocated:', caseAllocation);
    setCaseAllocation({ caseId: '', staffId: '' });
    alert('Case allocated successfully!');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">PP Office Admin</h1>
          <nav>
            <button 
              className={`w-full text-left px-4 py-2 rounded-md mb-2 ${activeTab === 'createStaff' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveTab('createStaff')}
            >
              Create PP Staff
            </button>
            <button 
              className={`w-full text-left px-4 py-2 rounded-md mb-2 ${activeTab === 'resetPassword' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveTab('resetPassword')}
            >
              Reset Password
            </button>
            <button 
              className={`w-full text-left px-4 py-2 rounded-md mb-2 ${activeTab === 'allocateCase' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveTab('allocateCase')}
            >
              Allocate Case
            </button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-10 overflow-auto">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          {activeTab === 'createStaff' && (
            <div>
              <h2 className="text-2xl mb-6 text-gray-800">Create PP Staff</h2>
              <form onSubmit={handleCreateStaff} className="space-y-4">
  <div className="flex space-x-4">
    {/* Full Name Field */}
    <div className="w-1/2">
      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
      <input
        id="fullName"
        value={newStaff.fullName}
        onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
        required
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    {/* Username Field */}
    <div className="w-1/2">
      <label htmlFor="userName" className="block text-sm font-medium text-gray-700">Username</label>
      <input
        id="userName"
        value={newStaff.userName}
        onChange={(e) => setNewStaff({ ...newStaff, userName: e.target.value })}
        required
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  </div>

  <div>
    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
    <input
      id="email"
      type="email"
      value={newStaff.email}
      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
      required
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    />
  </div>

  <div>
    <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number</label>
    <input
      id="contactNumber"
      value={newStaff.contactNumber}
      onChange={(e) => setNewStaff({ ...newStaff, contactNumber: e.target.value })}
      required
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    />
  </div>

  <div>
    <label htmlFor="licenseNo" className="block text-sm font-medium text-gray-700">License No.</label>
    <input
      id="licenseNo"
      value={newStaff.licenseNo}
      onChange={(e) => setNewStaff({ ...newStaff, licenseNo: e.target.value })}
      required
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    />
  </div>

  <div>
    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
    <input
      id="password"
      type="password"
      value={newStaff.password}
      onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
      required
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    />
  </div>

  <button
    type="submit"
    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
  >
    Create Staff
  </button>
</form>

            </div>
          )}

          {activeTab === 'resetPassword' && (
            <div>
              <h2 className="text-2xl mb-6 text-gray-800">Reset Password</h2>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-700">Select User</label>
                  <select
                    id="userId"
                    value={passwordReset.userId}
                    onChange={(e) => setPasswordReset({...passwordReset, userId: e.target.value})}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a user</option>
                    <option value="admin">Admin (You)</option>
                    {ppStaff.map(staff => (
                      <option key={staff.id} value={staff.id.toString()}>{staff.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    value={passwordReset.newPassword}
                    onChange={(e) => setPasswordReset({...passwordReset, newPassword: e.target.value})}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Reset Password
                </button>
              </form>
            </div>
          )}

          {activeTab === 'allocateCase' && (
            <div>
              <h2 className="text-2xl mb-6 text-gray-800">Allocate Case</h2>
              <form onSubmit={handleCaseAllocation} className="space-y-4">
                <div>
                  <label htmlFor="caseId" className="block text-sm font-medium text-gray-700">Select Case</label>
                  <select
                    id="caseId"
                    value={caseAllocation.caseId}
                    onChange={(e) => setCaseAllocation({...caseAllocation, caseId: e.target.value})}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a case</option>
                    {cases.map(case_ => (
                      <option key={case_.id} value={case_.id}>{case_.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="staffId" className="block text-sm font-medium text-gray-700">Assign to PP Staff</label>
                  <select
                    id="staffId"
                    value={caseAllocation.staffId}
                    onChange={(e) => setCaseAllocation({...caseAllocation, staffId: e.target.value})}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a staff member</option>
                    {ppStaff.map(staff => (
                      <option key={staff.id} value={staff.id.toString()}>{staff.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Allocate Case
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernPPOfficeAdminDashboard;

