class EmailTemplate {
    /**
     * Creates an instance of the EmailTemplate.
     * @param {Object} details - The case-specific details to be replaced in the template.
     * @param {string} details.crm - CRM reference.
     * @param {string} details.psCaseNo - P.S. Case number.
     * @param {string} details.dated - Date of the case.
     * @param {string} details.ipcSection - IPC section(s).
     * @param {string} details.hearingDate - Hearing date for the case.
     * @param {string} details.PPName 
     * @param {string} details.SPName 
     * @param {string} details.PSName 
     * @param {string} details.NexthearingDate 
     * @param {string} details.CaseDescription 
     * @param {string} details.CaseAdditionalRemarks 
     * @param {string} details.CaseRequiredDocument 
     * @param {string} details.encryptedCaseID - The encrypted Case ID for the link.
     * @param {string} details.baseURL - The base URL for the link.
     * @param {string} [details.assignedAdvocatesList] - HTML string for list of assigned advocates.
     * @param {string} [details.assignedDepartmentsList] - HTML string for list of assigned departments.
     */
    constructor(details) {
        this.crm = details.crm;
        this.psCaseNo = details.psCaseNo;
        this.dated = details.dated;
        this.ipcSection = details.ipcSection;
        this.hearingDate = details.hearingDate;
        this.ppname = details.PPName;
        this.SPName = details.SPName;
        this.PSName = details.PSName;
        this.NexthearingDate = details.NexthearingDate;
        this.CaseDescription = details.CaseDescription;
        this.CaseAdditionalRemarks = details.CaseAdditionalRemarks;
        this.CaseRequiredDocument = details.CaseRequiredDocument;
        this.encryptedCaseID = details.encryptedCaseID;
        this.baseURL = details.baseURL;
        this.assignedAdvocatesList = details.assignedAdvocatesList;
        this.assignedDepartmentsList = details.assignedDepartmentsList;

        // Common style for emails
        this.commonStyle = "font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6;";
    }

    /**
     * Generates the email content for the officer-in-charge.
     * @returns {string} - The generated email content.
     */

    // ppoffice send mail to sp and ps 
    generateEmailContent() {
        // For Assigned Advocates list (used in sendEmail)
        const advocatesSection = this.assignedAdvocatesList
            ? `<p><strong>List of Assigned Advocates:</strong><br>${this.assignedAdvocatesList}</p>`
            : '';

        return `
        <div style="${this.commonStyle}">
            <p>To: CP/Superintendent of Police<br>
            The Officer-in-Charge P.S.<br>
            From: The Public Prosecutor, High Court, Calcutta.</p>

            <p>Begins Ref. (${this.crm}/24)<br>
            P.S. Case No: ${this.psCaseNo}<br>
            Dated: ${this.dated}<br>
            U/S IPC ${this.ipcSection}<br>
            M/S VS: State</p>

            <p>Direct Investigating Officer of the above case to meet the Learned Advocate for the State (High Court, Calcutta) on ${this.hearingDate} with the Photocopy of the case diary with M.O.E.</p>
            
            ${advocatesSection}

            <p>[Message ends]</p>
        </div>
        `;
    }

    /**
     * Generates the email content for the public prosecutor or advocate.
     * @returns {string} - The generated email content.
     */

    // pphead send mail sp and ps after assigning ppuser
    generateEmailSample() {
        return `
        <div style="${this.commonStyle}">
            <p>To: CP/Superintendent of Police<br>
            The Officer-in-Charge P.S.<br>
            From: The Public Prosecutor, High Court, Calcutta.</p>

            <p>Begins Ref. (${this.crm}/24)<br>
            P.S. Case No: ${this.psCaseNo}<br>
            Dated: ${this.dated}<br>
            U/S IPC ${this.ipcSection}<br>
            PPName : ${this.ppname}<br>
            M/S VS: State</p>

            <p>Public prosecutor is selected for the above case. (High Court, Calcutta) on ${this.hearingDate} with the Photocopy of the case diary with M.O.E.</p>

            <p>[Message ends]</p>
        </div>
        `;
    }
    // pphead send mail public prosecutor 
    generateEmailAdvocateAssignToA() { // Used by sendEmailTO
        const caseResourcesLinkHTML = (this.baseURL && this.encryptedCaseID)
            ? `<p><strong>Case Resources Link:</strong><br>
<a href="${this.baseURL}/secure-documents?data=${this.encryptedCaseID}" target="_blank" style="color: #27548A; font-weight: bold;">Login & View Documents</a></p>`
            : '<p>Case Resources Link: Not available</p>';

        // For Assigned Departments list (used in sendEmailTO)
        const departmentsSection = this.assignedDepartmentsList
            ? `<p><strong>List of Assigned Departments:</strong><br>${this.assignedDepartmentsList}</p>`
            : '';

        return `
        <div style="${this.commonStyle}">
            <p>To: Public Prosecutor<br>
            Advocate<br>
            From: The Public Prosecutor, High Court, Calcutta.</p>

            <p>P.S. Case No: ${this.psCaseNo}<br>
            Dated: ${this.dated}<br>
            S.P.Name : ${this.SPName || 'N/A'}<br>
            P.S.Name : ${this.PSName || 'N/A'}<br>
            M/S VS: State</p>

            <p>You are assigned to the above case. The hearing is scheduled for ${this.hearingDate}. Please meet with the Investigating Officer with the photocopy of the case diary and M.O.E.</p>
            
            ${departmentsSection}
            ${caseResourcesLinkHTML}

            <p>[Message ends]</p>
        </div>
        `;
    }

    generateEmailContentForFutureCaseDetails() {
        const formattedAdditionalInfo = this.CaseAdditionalRemarks ? this.CaseAdditionalRemarks.replace(/\n/g, '<br>') : 'N/A';
        const formattedRequiredDocs = this.CaseRequiredDocument ? this.CaseRequiredDocument.replace(/\n/g, '<br>') : 'N/A';


        return `
        <div style="${this.commonStyle}">
            <p>To: CP/Superintendent of Police<br>
            The Officer-in-Charge P.S.<br>
            From: The Public Prosecutor, High Court, Calcutta.</p>

            <p>P.S. Case No: ${this.psCaseNo}<br>
            Case Date: ${this.dated}<br>
            Case Description: ${this.CaseDescription || 'N/A'}<br>
            M/S VS: State</p>

            <p>Direct the Investigating Officer of the above case to meet the Learned Advocate for the State (High Court, Calcutta) on Next Hearing Date: ${this.NexthearingDate}.<br>
            The Investigating Officer is requested to bring:<br>
            ${formattedRequiredDocs}</p>

            <p>Additional Information:<br>
            ${formattedAdditionalInfo}</p>

            <p>[Message ends]</p>
        </div>
        `;
    }

}

module.exports = EmailTemplate;
