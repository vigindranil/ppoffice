import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="card overflow-hidden">
          {/* Banner and Avatar Section */}
          <div className="relative h-48 bg-gradient-to-r from-primary to-primary/60">
            <button className="absolute top-4 right-4">
              <span className="icon">📷</span>
            </button>
            <div className="absolute -bottom-12 left-8">
              <div className="relative">
                <img
                  src="/placeholder.svg?height=96&width=96"
                  alt="Profile picture"
                  width={96}
                  height={96}
                  className="rounded-full border-4 border-white"
                />
                <button className="absolute bottom-0 right-0 rounded-full">
                  <span className="icon">📷</span>
                </button>
              </div>
            </div>
          </div>

          <div className="card-header pt-16 pb-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">PS Officer Name</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <span className="icon">📍</span>
                District Court, City Name
              </p>
            </div>
          </div>

          <div className="card-content space-y-6">
            <div className="separator" />

            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="fullName">Full Name</label>
                  <div className="flex gap-2">
                    <input id="fullName" defaultValue="PS Officer Name" />
                    <button>
                      <span className="icon">👤</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email">Email</label>
                  <div className="flex gap-2">
                    <input id="email" type="email" defaultValue="officer@court.gov" />
                    <button>
                      <span className="icon">📧</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone">Phone Number</label>
                  <div className="flex gap-2">
                    <input id="phone" type="tel" defaultValue="+1 (555) 000-0000" />
                    <button>
                      <span className="icon">📞</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="designation">Designation</label>
                  <input id="designation" defaultValue="Public Safety Officer" />
                </div>
              </div>
            </div>

            <div className="separator" />

            {/* About Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">About</h2>
              <textarea
                className="min-h-[100px]"
                placeholder="Write something about yourself..."
                defaultValue="Dedicated Public Safety Officer with over 5 years of experience in maintaining public order and ensuring community safety. Specialized in case management and emergency response."
              />
            </div>

            <div className="separator" />

            {/* Additional Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Additional Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="badgeNumber">Badge Number</label>
                  <input id="badgeNumber" defaultValue="PSO-123456" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="department">Department</label>
                  <input id="department" defaultValue="Public Safety Department" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="joinDate">Join Date</label>
                  <input id="joinDate" type="date" defaultValue="2019-01-01" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="shift">Shift</label>
                  <input id="shift" defaultValue="Day Shift (9:00 AM - 5:00 PM)" />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button>Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/profile" element={<ProfilePage />} />
//       </Routes>
//     </Router>
//   );
// }

export default ProfilePage;
