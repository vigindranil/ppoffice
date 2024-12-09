<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\ApplicationModel;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Response;
class saveApplicationDetailsResp
{
    public $application_id;
    public $application_no;
}
class ApplicationController
{
    public $ApplicationDetailsMapper;
    //Aziza controller starts
    public function __construct(ApplicationModel $Obj)
    {
        $this->ApplicationDetailsMapper = $Obj;
    }
    public function SaveRentApplicationDetailsV5(Request $request)
    {
        try {
            Log::channel('daily')->info("********  SaveRentApplicationDetailsV5 Service Start ***************");
    
            $Response = new Response(); // response object
            $validatedData = $request->validate([
                "InApplicationID"=>"required",
                "TenantContactNo"=>"required",
                "EntryUserID"=>"required", 
                "UserTypeID"=>"required"
            ]);
            $optionalFields = [
                "OwnerName",
                "OwnerGenderDescription",
                "OwnerGenderID",
                "OwnerPoliceStation",
                "OwnerOccupation",
                "OwnerContactNo",
                "TenantName",
                "TenantAge",
                "TenantGenderDescription",
                "TenantGenderID",
                "TenantGuardianName",
                "TenantOccupation",
                "TenantPermanentAddress",
                "TenantRentedAddress",
                "TenantRentedAddressPoliceStation",
                "TenantExpectedPeriodOfStayFromDate",
                "TenantReferenceName1",
                "TenantReference1Address",
                "TenantReference1ContactNo",
                "OwnerDistrictName",
                "TenantDistrictName",
                "OwnerHouseNo",
                "OwnerPostOffice",
                "OwnerState",
                "OwnerPincode",
                "TenantPostOffice",
                "TenantState",
                "TenantPincode",
                "TenantDistrictID",
                "OwnerPSID",
                "TenantPSID",
                "TenantExpectedPeriodOfStayToDate",
                "OwnerDistrictID",
                "OwnerCityName",
                "TenantCityName",
                "TenantCountryName",
                "RentedPropertyPremisePincode",
                "RentedPropertyPremiseCityName",
                "RentedPostOffice",
                "RentedAddressDistrictID",
                "RentedAddressDistrictName",
                "RentedAddressPoliceStationID",
                "RentedAddressStateID",
                "RentedAddressStateName",
                "IsRentedAddressSameAsLandlordAddress",
                "TenantPhotoURL",
                "RentedAddressPoliceStationName",
                "OwnerStateID"
            ];
            // Extract optional fields from the request
            $optionalData = $request->only($optionalFields);
            $inputData = array_merge($validatedData, $optionalData);
            Log::channel('daily')->error("API Input::" . json_encode($inputData, true));
            $SaveApplicationDetails = $this->ApplicationDetailsMapper->SaveRentApplicationDetailsV5(
                $inputData["InApplicationID"],
                $inputData["OwnerName"],
                $inputData["OwnerGenderDescription"],
                $inputData["OwnerGenderID"],
                $inputData["OwnerPoliceStation"],
                $inputData["OwnerOccupation"] ?? "",
                $inputData["OwnerContactNo"],
                $inputData["TenantName"],
                $inputData["TenantAge"],
                $inputData["TenantGenderDescription"],
                $inputData["TenantGenderID"],
                $inputData["TenantGuardianName"],
                $inputData["TenantContactNo"],
                $inputData["TenantOccupation"] ?? "",
                $inputData["TenantPermanentAddress"],
                $inputData["TenantRentedAddress"],
                $inputData["TenantRentedAddressPoliceStation"],
                $inputData["TenantExpectedPeriodOfStayFromDate"],
                $inputData["TenantReferenceName1"],
                $inputData["TenantReference1Address"],
                $inputData["TenantReference1ContactNo"],
                $inputData["EntryUserID"],
                $inputData["OwnerDistrictName"],
                $inputData["TenantDistrictName"],
                $inputData["UserTypeID"],
                $inputData["OwnerHouseNo"],
                $inputData["OwnerPostOffice"],
                $inputData["OwnerState"],
                $inputData["OwnerPincode"],
                $inputData["TenantPostOffice"],
                $inputData["TenantState"],
                $inputData["TenantPincode"],
                $inputData["TenantDistrictID"],
                $inputData["OwnerPSID"],
                $inputData["TenantPSID"],
                $inputData["TenantExpectedPeriodOfStayToDate"],
                $inputData["OwnerDistrictID"],
                $inputData["OwnerCityName"],
                $inputData["TenantCityName"],
                $inputData["TenantCountryName"],
                $inputData["RentedPropertyPremisePincode"],
                $inputData["RentedPropertyPremiseCityName"],
                $inputData["RentedPostOffice"],
                $inputData["RentedAddressDistrictID"],
                $inputData["RentedAddressDistrictName"],
                $inputData["RentedAddressPoliceStationID"],
                $inputData["RentedAddressStateID"],
                $inputData["RentedAddressStateName"],
                $inputData["IsRentedAddressSameAsLandlordAddress"],
                $inputData["TenantPhotoURL"],
                $inputData["RentedAddressPoliceStationName"],
                $inputData["OwnerStateID"]
            );
            if ($SaveApplicationDetails != null) {
                if ($SaveApplicationDetails[0]->ErrorCode == 0) {

                    $ObjSaveApplicationResponse = new saveApplicationDetailsResp();
                    $ObjSaveApplicationResponse->application_id = $SaveApplicationDetails[0]->ApplicationID;
                    $ObjSaveApplicationResponse->application_no = $SaveApplicationDetails[0]->ApplicationNo;
                    if($inputData['UserTypeID'] == 10){
                        $AssignedToUserTypeID = 20;
                        $SaveApplicationInfoForAssignToTenantResp = $this->ApplicationDetailsMapper->SaveApplicationInfoForAssignToTenant(
                            $SaveApplicationDetails[0]->ApplicationID,
                            $inputData['EntryUserID'],
                            $inputData['OwnerContactNo'],
                            $inputData['TenantContactNo'],
                            $inputData['UserTypeID'],
                            $AssignedToUserTypeID,
                            $inputData['EntryUserID']
                        );
                        Log::channel('daily')->error("SaveApplicationInfoForAssignToTenantResp::" . json_encode($SaveApplicationInfoForAssignToTenantResp, true));

                        if($SaveApplicationInfoForAssignToTenantResp != null){
                            if ($SaveApplicationInfoForAssignToTenantResp[0]->ErrorCode == 0) 
                            {
                                $SendSmsToTenantLandlordInitiatedApplicationResp = $this->ApplicationDetailsMapper->SendSmsToTenantLandlordInitiatedApplication($inputData['OwnerName'],$inputData['TenantContactNo']);
                                $Response->status = 0;
                                $Response->message = "Your application has been successfully submitted and a SMS is sent to the Tenant.";
                                $Response->data = $ObjSaveApplicationResponse;
                            }
                            else{
                                $Response->status = 1;
                                $Response->message = "Failed to save application details, Please try again";
                                $Response->data = null;
                            }
                        }
                        else{
                            $Response->status = 1;
                            $Response->message = "Failed to save application details, Please try again";
                            $Response->data = null;
                        }

                    }
                    else{
                        // setting the response values into response object
                        $ApprovalStatus = 500;
                        $SaveUserApprovalStatusUpdateResp = $this->ApplicationDetailsMapper->SaveUserApprovalStatusUpdate($SaveApplicationDetails[0]->ApplicationID,$ApprovalStatus);
                        if ($SaveUserApprovalStatusUpdateResp[0]->ErrorCode == 0) {
                            $Response->status = 0;
                            $Response->message = "Your application has been successfully submitted.";
                            $Response->data = $ObjSaveApplicationResponse;
                        }
                        else{
                            $Response->status = 1;
                            $Response->message = "Failed to save application details, Please try again";
                            $Response->data = null;
                        }

                    }
                } else {
                    $Response->status = 1;
                    $Response->message = "Failed to save application details, Please try again";
                    $Response->data = null;
                }
            } else {
                $Response->status = 1;
                $Response->message = "Server/Network error, please try again.";
                $Response->data = null;
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Validation error occurred
            $errors = $e->errors();
            $errorFields = array_keys($errors);
            $formattedErrorFields = array_map(function($field) {
                return ucfirst(str_replace(['_', 'id'], [' ', 'ID'], $field));
            }, $errorFields);
            $Response->status = 1;
            $Response->message = "'" . implode("', '", $formattedErrorFields) . "' are required.";
            $Response->data = null;
        } catch (\Exception $e) {   // Exception handling
            $Response->status = 1;
            $Response->message = "Server/Network error, please try again.";
            $Response->data = null;
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
        } finally {
            Log::channel('daily')->info("API Response :" . json_encode($Response));
            Log::channel('daily')->info("********  SaveRentApplicationDetailsV5 Service End ***************");
            // Return the response object
            return response()->json($Response, 200);
        }
    }
}
