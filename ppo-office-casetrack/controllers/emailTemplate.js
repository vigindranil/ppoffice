/**
 * Generates the email content by replacing placeholders with case-specific details.
 * @param {Object} details - The case-specific details to be replaced in the template.
 * @param {string} details.crm - CRM reference.
 * @param {string} details.psCaseNo - P.S. Case number.
 * @param {string} details.dated - Date of the case.
 * @param {string} details.ipcSection - IPC section(s).
 * @param {string} hearingDate - Hearing date for the case.
 * @param {string} additionalInstructions - Additional instructions to include in the email.
 * @returns {string} - The generated email content.
 */
function generateEmailTemplate(details) {
    const {
        crm,
        psCaseNo,
        dated,
        ipcSection,
        hearingDate,
       // additionalInstructions,
    } = details;

    return `
        To: CP/Superintendent of Police  
        The Officer-in-Charge P.S.  
        From: The Public Prosecutor, High Court, Calcutta.  

        Begins Ref. (${crm}/24)  
        P.S. Case No: ${psCaseNo}  
        Dated: ${dated}  
        U/S IPC ${ipcSection} 
        M/S VS: State  

        Direct Investigating Officer of the above case to meet the Learned Advocate for the State (High Court, Calcutta) on ${hearingDate} with the Photocopy of the case diary with M.O.E.  

        [Message ends]  
    `;
}

module.exports = generateEmailTemplate;
