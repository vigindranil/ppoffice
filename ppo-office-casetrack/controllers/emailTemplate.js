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
    }

    /**
     * Generates the email content for the officer-in-charge.
     * @returns {string} - The generated email content.
     */ 

    // ppoffice send mail to sp and ps 
    generateEmailContent() {
        return `
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
    }

    /**
     * Generates the email content for the public prosecutor or advocate.
     * @returns {string} - The generated email content.
     */ 

    // pphead send mail sp and ps after assigning ppuser
    generateEmailSample() {
        return `
            To: CP/Superintendent of Police  
            The Officer-in-Charge P.S.  
            From: The Public Prosecutor, High Court, Calcutta.    

            Begins Ref. (${this.crm}/24)  
            P.S. Case No: ${this.psCaseNo}  
            Dated: ${this.dated}  
            U/S IPC ${this.ipcSection} 
            PPName : ${this.ppname}
            M/S VS: State  

            public prosecutor is selected  above case (High Court, Calcutta) on ${this.hearingDate} with the Photocopy of the case diary with M.O.E.  

            [Message ends]  
        `;
    } 
    // pphead send mail public prosecutor 
    generateEmailCopy() {
        return `
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

             you are assigned above case (High Court, Calcutta) on ${this.hearingDate} with the Photocopy of the case diary with M.O.E.  

            [Message ends]  
        `;
    }
    
    generateEmailContentForFutureCaseDetails() {
        return `
            To: CP/Superintendent of Police  
            The Officer-in-Charge P.S.  
            From: The Public Prosecutor, High Court, Calcutta.  
    
            P.S. Case No: ${this.psCaseNo}  
            Case Date: ${this.dated}  
            Case Description: ${this.CaseDescription}  
            M/S VS: State  
    
            Direct the Investigating Officer of the above case to meet the Learned Advocate for the State (High Court, Calcutta) on Next HearingDate ${this.NexthearingDate}.  
            The Investigating Officer is requested to bring:  
              - ${this.CaseRequiredDocument}  
    
            Additional Information:  
              ${this.additionalInformation}  
    
            [Message ends]  
        `;
    }
    
}

module.exports = EmailTemplate;
