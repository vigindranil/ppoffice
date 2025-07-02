import { postRequest } from "@/app/commonAPI";

export const getDocByCaseId = async (case_id) => {
  try {
    return await postRequest("show-case-document", {
        caseId: case_id,
    });
  } catch (error) {
    console.log("Error:", error);
    return null;
  }
};