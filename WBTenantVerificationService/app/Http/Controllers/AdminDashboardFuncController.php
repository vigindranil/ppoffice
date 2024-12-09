<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\AdminDashboardFuncModel;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Response;
class DashboardCountResp
{
    public $pending_approval_count;
    public $application_approved_count;
    public $all_application_count;
    public $rejected_application_count;
}
class ApplicationDetailsByStatusIDResp{
    public $application_no;
    public $application_id;
    public $owner_name;
    public $owner_gender_description;
    public $owner_police_station;
    public $owner_occupation;
    public $owner_contact_no;
    public $tenant_name;
    public $tenant_age;
    public $tenant_gender_description;
    public $tenant_guardian_name;
    public $tenant_contact_no;
    public $tenant_occupation;
    public $tenant_permanent_address;
    public $tenant_rented_address;
    public $tenant_rented_address_police_station;
    public $tenant_expected_period_of_stay_from_date;
    public $tenant_reference_name1;
    public $tenant_reference1_address;
    public $tenant_reference1_contact_no;
    public $owner_district_name;
    public $tenant_district_name;
    public $owner_house_no;
    public $owner_post_office;
    public $owner_state;
    public $owner_pincode;
    public $tenant_post_office;
    public $tenant_state;
    public $tenant_pincode;
    public $tenant_expected_period_of_stay_to_date;
    public $owner_city_name;
    public $tenant_city_name;
    public $tenant_country_name;
    public $rented_property_premise_pincode;
    public $rented_property_premise_city_name;
    public $rented_post_office;
    public $rented_address_district_name;
    public $rented_address_police_station_id;
    public $rented_address_state_name;
    public $application_initiate_user_type_name;
    //newly added
    public $application_submission_date;
    public $authority_approval_status_id;
    public $authority_approval_status_name;
    //newly added
    public $owner_gender_id;
    public $owner_police_station_id;
    public $owner_state_id;
    public $tenant_rented_address_police_station_id;
    public $rented_address_district_id;
    public $rented_address_state_id;

}
class AdminDashboardFuncController
{
    //
    public function __construct(AdminDashboardFuncModel $Obj)
    {
        $this->DashboardCountsMapper = $Obj;
    }
    public function GetAdminDashboardCounts(Request $request)
    {
        try {
            Log::channel('daily')->info("********GetAdminDashboardCounts Called ***************");
            
            // request parameter
            $AuthorityUserID = $request->AuthorityUserID;
            $AuthorityUserTypeID = $request->AuthorityUserTypeID;
            $DistrictID = $request->DistrictID;
            $Response = new Response();     // response object
            if($AuthorityUserID == null || $AuthorityUserID == ""){
                $Response->status = 1;
                $Response->message = "AuthorityUserID is required.";
                $Response->data=null;
            }
            else if($AuthorityUserTypeID == null || $AuthorityUserTypeID == ""){
                $Response->status = 1;
                $Response->message = "AuthorityUserTypeID is required.";
                $Response->data=null;
            }
            else if($DistrictID == null || $DistrictID == ""){
                $Response->status = 1;
                $Response->message = "DistrictID is required.";
                $Response->data=null;
            }
            else{
                $DashboardCounts = $this->DashboardCountsMapper->GetAdminDashboardCounts($AuthorityUserID,$AuthorityUserTypeID,$DistrictID);
                Log::channel('daily')->error("SP Response::" .json_encode($DashboardCounts,true));
                $DataArray = array();
                $AdminDashboardCountsObj = new DashboardCountResp();
                $AdminDashboardCountsObj->pending_approval_count= $DashboardCounts[0]->PendingApprovalCount;
                $AdminDashboardCountsObj->application_approved_count= $DashboardCounts[0]->ApplicationApprovedCount;
                $AdminDashboardCountsObj->all_application_count= $DashboardCounts[0]->AllApplicationCount;
                $AdminDashboardCountsObj->rejected_application_count= $DashboardCounts[0]->RejectedApplicationCount;
                
                Log::channel('daily')->error("Controller Response::" .json_encode($DataArray,true));
                
                array_push($DataArray,$AdminDashboardCountsObj);
                $Response->status = 0;
                $Response->message = "Dashboard count details fetched successfully.";
                $Response->data = $AdminDashboardCountsObj;
            }
        } catch (\Exception $e) {   // exception handeling
            // response object after exception occurred
            $Response->status = 1;
            $Response->message = "Server/Network error, please try again.";
            $Response->data = null;

            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
        } finally {
            Log::channel('daily')->info("API Response :" . json_encode($Response));
            Log::channel('daily')->info("********  GetAdminDashboardCounts End ***************");

            // sending the response object
            return response()->json($Response, 200);
        }
    }
    public function GetAuthorityApplicationDetailsByStatusID(Request $request)
    {
        try {
            Log::channel('daily')->info("********GetAllDocumentTypes Called ***************");
            
            // request parameter
            $validatedData = $request->validate([
                "StatusID"=>"required",
                "AuthorityUserID"=>"required",
                "DistrictID"=>"required"
            ]);
            $optionalFields = [
                "FromDate",
                "ToDate"
            ];
            $optionalData = $request->only($optionalFields);
            $inputData = array_merge($validatedData, $optionalData);
            Log::channel('daily')->error("API Input::" . json_encode($inputData, true));
            $Response = new Response();     // response object
                $Applications = $this->DashboardCountsMapper->GetAuthorityApplicationDetailsByStatusID(
                    $inputData['StatusID'],
                    $inputData['AuthorityUserID'],
                    $inputData['DistrictID'],
                    $inputData['FromDate'],
                    $inputData['ToDate']
                );
                $DataArray = array();
                if(!empty($Applications)){
                    foreach($Applications as $application){
                        $ApplicationsObj = new ApplicationDetailsByStatusIDResp();
                        $ApplicationsObj->application_no=$application->ApplicationNo;
                        $ApplicationsObj->application_id=$application->ApplicationID;
                        $ApplicationsObj->owner_name=$application->OwnerName;
                        $ApplicationsObj->owner_gender_description=$application->OwnerGenderDescription;
                        $ApplicationsObj->owner_police_station=$application->OwnerPoliceStation;
                        $ApplicationsObj->owner_occupation=$application->OwnerOccupation;
                        $ApplicationsObj->owner_contact_no=$application->OwnerContactNo;
                        $ApplicationsObj->tenant_name=$application->TenantName;
                        $ApplicationsObj->tenant_age=$application->TenantAge;
                        $ApplicationsObj->tenant_gender_description=$application->TenantGenderDescription;
                        $ApplicationsObj->tenant_guardian_name=$application->TenantGuardianName;
                        $ApplicationsObj->tenant_contact_no=$application->TenantContactNo;
                        $ApplicationsObj->tenant_occupation=$application->TenantOccupation;
                        $ApplicationsObj->tenant_permanent_address=$application->TenantPermanentAddress;
                        $ApplicationsObj->tenant_rented_address=$application->TenantRentedAddress;
                        $ApplicationsObj->tenant_rented_address_police_station=$application->TenantPoliceStation;
                        $ApplicationsObj->tenant_expected_period_of_stay_from_date=$application->TenantExpectedPeriodOfStayFromDate;
                        $ApplicationsObj->tenant_reference_name1=$application->TenantReferenceName1;
                        $ApplicationsObj->tenant_reference1_address=$application->TenantReference1Address;
                        $ApplicationsObj->tenant_reference1_contact_no=$application->TenantReference1ContactNo;
                        $ApplicationsObj->owner_district_name=$application->OwnerDistrictName;
                        $ApplicationsObj->tenant_district_name=$application->TenantDistrictName;
                        $ApplicationsObj->owner_house_no=$application->OwnerHouseNo;
                        $ApplicationsObj->owner_post_office=$application->OwnerPostOffice;
                        $ApplicationsObj->owner_state=$application->OwnerState;
                        $ApplicationsObj->owner_pincode=$application->OwnerPincode;
                        $ApplicationsObj->tenant_post_office=$application->TenantPostOffice;
                        $ApplicationsObj->tenant_state=$application->TenantState;
                        $ApplicationsObj->tenant_pincode=$application->TenantPincode;
                        $ApplicationsObj->tenant_expected_period_of_stay_to_date=$application->TenantExpectedPeriodOfStayToDate;
                        $ApplicationsObj->owner_city_name=$application->OwnerCityName;
                        $ApplicationsObj->tenant_city_name=$application->TenantCityName;
                        $ApplicationsObj->tenant_country_name=$application->TenantCountryName;
                        $ApplicationsObj->rented_property_premise_pincode=$application->RentedPropertyPremisePincode;
                        $ApplicationsObj->rented_property_premise_city_name=$application->RentedPropertyPremiseCityName;
                        $ApplicationsObj->rented_post_office=$application->RentedPostOffice;
                        $ApplicationsObj->rented_address_district_name=$application->RentedAddressDistrictName;
                        $ApplicationsObj->rented_address_police_station_id=$application->RentedAddressPoliceStationID;
                        $ApplicationsObj->rented_address_state_name=$application->RentedAddressStateName;
                        $ApplicationsObj->application_initiate_user_type_name=$application->ApplicationInitiateUserTypeName;
                        //newly added
                        $ApplicationsObj->application_submission_date=$application->ApplicationSubmissionDate;
                        $ApplicationsObj->authority_approval_status_id=$application->AuthorityApprovalStatusID;
                        $ApplicationsObj->authority_approval_status_name=$application->AuthorityApprovalStatusName;
                        //newly added
                        $ApplicationsObj->owner_gender_id = $application->OwnerGenderID;
                        $ApplicationsObj->owner_police_station_id = $application->OwnerPoliceStationID;
                        $ApplicationsObj->owner_state_id = $application->OwnerStateID;
                        $ApplicationsObj->tenant_rented_address_police_station_id = $application->RentedAddressPoliceStationID;
                        $ApplicationsObj->rented_address_district_id = $application->RentedAddressDistrictID;
                        $ApplicationsObj->rented_address_state_id = $application->RentedAddressStateID;
                        array_push($DataArray,$ApplicationsObj);
                    }
                    $Response->status = 0;
                    $Response->message = "Application fetched successfully";
                    $Response->data = $DataArray;
                }
                else{
                    $Response->status = 0;
                    $Response->message = "No data found.";
                    $Response->data = [];
                }
                Log::channel('daily')->error("Controller Response::" .json_encode($DataArray,true));

        } catch (\Exception $e) {   // exception handeling
            // response object after exception occurred
            $errors = $e->errors();
            $errorFields = array_keys($errors);
            $formattedErrorFields = array_map(function($field) {
                return ucfirst(str_replace(['_', 'id'], [' ', 'ID'], $field));
            }, $errorFields);
            $Response->status = 1;
            $Response->message = "'" . implode("', '", $formattedErrorFields) . "' are required.";
            $Response->data = null;

            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
        } finally {
            Log::channel('daily')->info("API Response :" . json_encode($Response));
            Log::channel('daily')->info("********  GetAllDocumentTypes End ***************");

            // sending the response object
            return response()->json($Response, 200);
        }
    }
    public function SaveApprovalStatusUpdate(Request $request)
    {
        try {
            Log::channel('daily')->info("********  SaveApprovalStatusUpdate Service Start ***************");
    
            $Response = new Response(); // response object
            $validatedData = $request->validate([
                "ApplicationID"=>"required",
                "ApprovalStatus"=>"required",
                "ApprovalAuthorityUserID"=>"required",
                "ApprovalAuthorityDistrictID"=>"required"
            ]);
            $optionalFields = [
                "ApprovalAuthorityRemarks",
            ];
            // Extract optional fields from the request
            $optionalData = $request->only($optionalFields);
            $inputData = array_merge($validatedData, $optionalData);
            Log::channel('daily')->error("API Input::" . json_encode($inputData, true));
            $SaveUpdateApplicationstatusResp = $this->DashboardCountsMapper->SaveApprovalStatusUpdate(
                $inputData["ApplicationID"], 
                $inputData["ApprovalStatus"], 
                $inputData["ApprovalAuthorityUserID"], 
                $inputData["ApprovalAuthorityDistrictID"], 
                $inputData["ApprovalAuthorityRemarks"]
            );
            if ($SaveUpdateApplicationstatusResp != null) {
                if ($SaveUpdateApplicationstatusResp[0]->ErrorCode == 0) {

                    $Response->status = 0;
                    $Response->message = "Application status updated successfully.";
                    $Response->data = [];
                } else {
                    $Response->status = 1;
                    $Response->message = "Failed to update application details, Please try again";
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
            Log::channel('daily')->info("********  SaveApprovalStatusUpdate Service End ***************");
            // Return the response object
            return response()->json($Response, 200);
        }
    }
}
