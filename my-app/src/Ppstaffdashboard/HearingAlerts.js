import React from 'react';
import { FaBell } from 'react-icons/fa';

const HearingAlerts = ({ alerts }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Hearing Alerts</h2>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-white border border-yellow-200 rounded-lg p-4 shadow-sm flex items-start space-x-4"
          >
            <div className="flex-shrink-0">
              <FaBell className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                Case: {alert.caseNumber}
              </p>
              <p className="text-sm text-gray-500">
                Next Hearing: {new Date(alert.hearingDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                Court: {alert.court}
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {alert.daysUntilHearing} days left
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HearingAlerts;

