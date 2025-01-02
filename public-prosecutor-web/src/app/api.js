import { serviceUrl } from '@/app/contants';

async function saveCase(caseData) {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            throw new Error("Authentication token not found");
        }

        const response = await fetch(`${serviceUrl}/api/addCase`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(caseData),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Unauthorized: Please log in again");
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.status === 0) {
            return result.data;
        } else {
            throw new Error(result.message || "Failed to save case");
        }
    } catch (error) {
        console.error("Error saving case:", error);
        throw error;
    }
}

async function fetchCaseTypes() {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            throw new Error("Authentication token not found");
        }

        const response = await fetch(`${serviceUrl}/api/getcasetype`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Unauthorized: Please log in again");
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.status === 0 && data.data) {
            return data.data;
        } else {
            throw new Error(data.message || "Failed to fetch case types");
        }
    } catch (error) {
        console.error("Error fetching case types:", error);
        throw error;
    }
}

async function fetchReferenceDetails() {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            throw new Error("Authentication token not found");
        }

        const response = await fetch(
            `${serviceUrl}/api/showRefferenceDetails`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Unauthorized: Please log in again");
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.status === 0 && data.data) {
            return data.data;
        } else {
            throw new Error(data.message || "Failed to fetch reference details");
        }
    } catch (error) {
        console.error("Error fetching reference details:", error);
        throw error; // Re-throw the error so it can be handled by the component
    }
}
async function sendEmail(caseId) {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            throw new Error("Authentication token not found");
        }

        const response = await fetch(`${serviceUrl}/api/send-email`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ CaseID: caseId }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Unauthorized: Please log in again");
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.status === 0) {
            return result.data;
        } else {
            throw new Error(result.message || "Failed to send email");
        }
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}









