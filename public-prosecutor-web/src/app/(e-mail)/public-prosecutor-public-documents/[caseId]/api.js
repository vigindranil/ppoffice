import { postRequest } from "@/app/commonAPI";

export const getPublicDocByCaseId = async (case_id) => {
  try {
    return await postRequest("show-public-case-document", {
        caseId: case_id,
    });
  } catch (error) {
    console.log("Error:", error);
    return null;
  }
};