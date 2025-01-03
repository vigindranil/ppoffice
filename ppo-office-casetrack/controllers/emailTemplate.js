// Importing the logger from the utility file
const logger = require('../utils/logger');

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

        // Log the creation of the instance
        logger.info('EmailTemplate instance created with CRM: ' + this.crm);
    }

    /**
     * Generates the email content for the officer-in-charge.
     * @returns {string} - The generated email content.
     */
    generateEmailContent() {
        const emailContent = `
            To: CP/Superintendent of Police
            The Officer-in-Charge P.S.
            From: The Public Prosecutor, High Court, Calcutta.

            Begins Ref. (${this.crm}/24)
            P.S. Case No: ${this.psCaseNo}
            Dated: ${this.dated}
            U/S IPC ${this.ipcSection}
            M/S VS: State

            Direct Investigating Officer of the above case to meet the Learned Advocate for the State (High Court, Calcutta) on ${this.hearingDate} with the Photocopy of the case diary with M.O.E.

            [Message ends]
        `;

        // Log the email generation action
        logger.info('Generated email content for Officer-in-Charge.');

        return emailContent;
    }

    /**
     * Generates the email content for the public prosecutor or advocate.
     * @returns {string} - The generated email content.
     */
    generateEmailSample() {
        const emailContent = `
            To: CP/Superintendent of Police
            The Officer-in-Charge P.S.
            From: The Public Prosecutor, High Court, Calcutta.

            Begins Ref. (${this.crm}/24)
            P.S. Case No: ${this.psCaseNo}
            Dated: ${this.dated}
            U/S IPC ${this.ipcSection}
            PPName : ${this.ppname}
            M/S VS: State

            Public prosecutor is selected for the above case (High Court, Calcutta) on ${this.hearingDate} with the Photocopy of the case diary with M.O.E.

            [Message ends]
        `;

        // Log the email generation action
        logger.info('Generated email content for Public Prosecutor.');

        return emailContent;
    }

    /**
     * Generates the email content for the assigned public prosecutor.
     * @returns {string} - The generated email content.
     */
    generateEmailCopy() {
        const emailContent = `
            To: Public Prosecutor
            Advocate
            From: The Public Prosecutor, High Court, Calcutta.

            Begins Ref. (${this.crm}/24)
            P.S. Case No: ${this.psCaseNo}
            Dated: ${this.dated}
            U/S IPC ${this.ipcSection}
            S.P.Name : ${this.SPName}
            P.S.Name : ${this.PSName}
            M/S VS: State

            You are assigned to the above case (High Court, Calcutta) on ${this.hearingDate} with the Photocopy of the case diary with M.O.E.

            [Message ends]
        `;

        // Log the email generation action
        logger.info('Generated email content for Public Prosecutor assignment.');

        return emailContent;
    }
}

module.exports = EmailTemplate;
