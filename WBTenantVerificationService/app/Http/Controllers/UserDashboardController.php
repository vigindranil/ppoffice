<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\UserDashboardModel;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Response;
use Exception;

class UserDashboardCountsResp{
    public $pending_application_count ; 
    public $certificate_issued_count ;
    public $all_application_count ;
    public $payment_pending_count ;
    public $rejected_application_count ;
    public $assigned_application_count;
}
class TenantApplicationDetails{
    public $application_no;
    public $owner_name;
    public $owner_age;
    public $owner_gender;
    public $owner_address;
    public $owner_police_station;
    public $owner_occupation;
    public $owner_contact_no;
    public $tenant_name;
    public $tenant_age;
    public $tenant_gender;
    public $tenant_guardian_name;
    public $tenant_contact_no;
    public $tenant_id_type;
    public $tenant_id_no;
    public $tenant_occupation;
    public $tenant_permanent_address;
    public $tenant_rented_address;
    public $tenant_rented_address_police_station;
    public $tenant_expected_period_of_stay_from_date;
    public $tenant_reference_name1;
    public $tenant_reference1_address;
    public $tenant_reference1_contact_no;
    public $tenant_expected_period_of_stay_to_date;
}
class GetTenantAssignedApplicationDetailsResp
{
    public $application_id;
    public $application_no;
    public $assigned_from_contact_no;
    public $assigned_from_user_id;
    public $assigned_from_user_type_id;
    public $assigned_from_user_type;
    public $assigned_date;
}
class ApplicationDetailsByApplicationIDResp{
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
    public $tenant_photo_url;
    public $application_submission_date;
    public $owner_gender_id;
    public $owner_police_station_id;
    public $owner_state_id;
    public $tenant_rented_address_police_station_id;
    public $rented_address_district_id;
    public $rented_address_state_id;

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
    //newly added 
    public $owner_gender_id;
    public $owner_police_station_id;
    public $owner_state_id;
    public $tenant_rented_address_police_station_id;
    public $rented_address_district_id;
    public $rented_address_state_id;
    //newly added
    public $approval_status_id;
    public $approval_status;

}
class UserDashboardController extends Controller
{
    public function __construct(UserDashboardModel $Obj)
    {
        $this->DashboardCountsMapper = $Obj;
    }
    public function GetUserDashboardCounts(Request $request)
    {
        try {
            Log::channel('daily')->info("********GetUserDashboardCounts Called ***************");
            
            // request parameter
            $UserID = $request->UserID;
            $UserTypeID = $request->UserTypeID;
            $Response = new Response();     // response object
            if($UserID == null || $UserID == ""){
                $Response->status = 1;
                $Response->message = "UserID is required.";
                $Response->data=null;
            }
            else if($UserTypeID == null || $UserTypeID == ""){
                $Response->status = 1;
                $Response->message = "UserTypeID is required.";
                $Response->data=null;
            }
            else{
                $DashboardCounts = $this->DashboardCountsMapper->GetUserDashboardCounts($UserID,$UserTypeID);
                
                $DataArray = array();
                $UserDashboardCountsObj = new UserDashboardCountsResp();
                $UserDashboardCountsObj->pending_application_count= $DashboardCounts[0]->PendingApprovalCount;
                $UserDashboardCountsObj->certificate_issued_count= $DashboardCounts[0]->ApplicationApprovedCount;
                $UserDashboardCountsObj->all_application_count= $DashboardCounts[0]->AllApplicationCount;
                $UserDashboardCountsObj->payment_pending_count= $DashboardCounts[0]->PaymentPendingCount;
                $UserDashboardCountsObj->rejected_application_count= $DashboardCounts[0]->RejectedApplicationCount;
                $UserDashboardCountsObj->assigned_application_count= $DashboardCounts[0]->AssignedApplicationCount;
                Log::channel('daily')->error("Controller Response::" .json_encode($DataArray,true));
                
                array_push($DataArray,$UserDashboardCountsObj);
                $Response->status = 0;
                $Response->message = "Dashboard count details fetched successfully.";
                $Response->data = $UserDashboardCountsObj;
            }
        } catch (\Exception $e) {   // exception handeling
            // response object after exception occurred
            $Response->status = 1;
            $Response->message = "Server/Network error, please try again.";
            $Response->data = null;

            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
        } finally {
            Log::channel('daily')->info("API Response :" . json_encode($Response));
            Log::channel('daily')->info("********  GetUserDashboardCounts End ***************");

            // sending the response object
            return response()->json($Response, 200);
        }
    }
    public function GetTenantApplicationDetailsByUserID(Request $request)
    {
        try {
            Log::channel('daily')->info("********GetTenantApplicationDetails Called ***************");
            
            // request parameter
            $UserID = $request->UserID;
            $Response = new Response();     // response object
            if($UserID == null || $UserID == ""){
                $Response->status = 1;
                $Response->message = "UserID is required.";
                $Response->data=null;
            }
            else{
                $DataArray = array();
                $GetTenantApplicationDetailsResp = $this->DashboardCountsMapper->GetTenantApplicationDetailsByUserID($UserID);
                if(!empty($GetTenantApplicationDetailsResp)){
                    foreach($GetTenantApplicationDetailsResp as $TenantApplicationDetails){
                        $GetTenantApplicationDetailsRespObj = new TenantApplicationDetails();
                        $GetTenantApplicationDetailsRespObj->application_no = $TenantApplicationDetails->ApplicationNo;
                        $GetTenantApplicationDetailsRespObj->owner_name = $TenantApplicationDetails->OwnerName;
                        $GetTenantApplicationDetailsRespObj->owner_age = $TenantApplicationDetails->OwnerAge;
                        $GetTenantApplicationDetailsRespObj->owner_gender = $TenantApplicationDetails->OwnerGender;
                        $GetTenantApplicationDetailsRespObj->owner_address = $TenantApplicationDetails->OwnerAddress;
                        $GetTenantApplicationDetailsRespObj->owner_police_station = $TenantApplicationDetails->OwnerPoliceStation;
                        $GetTenantApplicationDetailsRespObj->owner_occupation = $TenantApplicationDetails->OwnerOccupation;
                        $GetTenantApplicationDetailsRespObj->owner_contact_no = $TenantApplicationDetails->OwnerContactNo;
                        $GetTenantApplicationDetailsRespObj->tenant_name = $TenantApplicationDetails->TenantName;
                        $GetTenantApplicationDetailsRespObj->tenant_age = $TenantApplicationDetails->TenantAge;
                        $GetTenantApplicationDetailsRespObj->tenant_gender = $TenantApplicationDetails->TenantGender;
                        $GetTenantApplicationDetailsRespObj->tenant_guardian_name = $TenantApplicationDetails->TenantGuardianName;
                        $GetTenantApplicationDetailsRespObj->tenant_contact_no = $TenantApplicationDetails->TenantContactNo;
                        $GetTenantApplicationDetailsRespObj->tenant_id_type = $TenantApplicationDetails->TenantIDType;
                        $GetTenantApplicationDetailsRespObj->tenant_id_no = $TenantApplicationDetails->TenantIDNo;
                        $GetTenantApplicationDetailsRespObj->tenant_occupation = $TenantApplicationDetails->TenantOccupation;
                        $GetTenantApplicationDetailsRespObj->tenant_permanent_address = $TenantApplicationDetails->TenantPermanentAddress;
                        $GetTenantApplicationDetailsRespObj->tenant_rented_address = $TenantApplicationDetails->TenantRentedAddress;
                        $GetTenantApplicationDetailsRespObj->tenant_rented_address_police_station = $TenantApplicationDetails->TenantPoliceStation;
                        $GetTenantApplicationDetailsRespObj->tenant_expected_period_of_stay_from_date = $TenantApplicationDetails->TenantExpectedPeriodOfStayFromDate;
                        $GetTenantApplicationDetailsRespObj->tenant_reference_name1 = $TenantApplicationDetails->TenantReferenceName1;
                        $GetTenantApplicationDetailsRespObj->tenant_reference1_address = $TenantApplicationDetails->TenantReference1Address;
                        $GetTenantApplicationDetailsRespObj->tenant_reference1_contact_no = $TenantApplicationDetails->TenantReference1ContactNo;
                        $GetTenantApplicationDetailsRespObj->tenant_expected_period_of_stay_to_date = $TenantApplicationDetails->TenantExpectedPeriodOfStayToDate;
                        array_push($DataArray,$GetTenantApplicationDetailsRespObj);
                    }
                    // array_push($DataArray,$GetTenantApplicationDetailsRespObj);
                    $Response->status = 0;
                    $Response->message = "Application details fetched successfully.";
                    $Response->data = $DataArray;
                    Log::channel('daily')->error("API Controller Response::" .json_encode($DataArray,true));

                }
                else{
                    $Response->status = 0;
                    $Response->message = "Application details fetched successfully.";
                    $Response->data = [];
                }
                
                Log::channel('daily')->error("API Controller Response::" .json_encode($DataArray,true));
            }
        } catch (\Exception $e) {   // exception handeling
            // response object after exception occurred
            $Response->status = 1;
            $Response->message = "Server/Network error, please try again.";
            $Response->data = null;

            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
        } finally {
            Log::channel('daily')->info("API Response :" . json_encode($Response));
            Log::channel('daily')->info("********  GetTenantApplicationDetails End ***************");

            // sending the response object
            return response()->json($Response, 200);
        }
    }
    public function GetTenantAssignedApplicationDetails(Request $request)
    {
        try {
            Log::channel('daily')->info("********GetTenantAssignedApplicationDetails Called ***************");
            
            // request parameter
            $ContactNo = $request->TenantContactNo;
            $UserTypeID = $request->UserTypeID;
            $Response = new Response();     // response object
            if($ContactNo == null || $ContactNo == ""){
                $Response->status = 1;
                $Response->message = "TenantContactNo is required.";
                $Response->data=null;
            }
            else if($UserTypeID == null || $UserTypeID == ""){
                $Response->status = 1;
                $Response->message = "UserTypeID is required.";
                $Response->data=null;
            }
            else{
                $DataArray = array();
                $GetTenantApplicationDetailsResp = $this->DashboardCountsMapper->GetTenantAssignedApplicationDetails($ContactNo,$UserTypeID);
                if(!empty($GetTenantApplicationDetailsResp)){
                    foreach($GetTenantApplicationDetailsResp as $TenantApplicationDetails){
                        $GetTenantAssignedApplicationDetailsRespObj = new GetTenantAssignedApplicationDetailsResp();
                        $GetTenantAssignedApplicationDetailsRespObj->application_id = $TenantApplicationDetails->ApplicationID; 
                        $GetTenantAssignedApplicationDetailsRespObj->application_no = $TenantApplicationDetails->ApplicationNo; 
                        $GetTenantAssignedApplicationDetailsRespObj->assigned_from_contact_no = $TenantApplicationDetails->AssignedFromContactNo; 
                        $GetTenantAssignedApplicationDetailsRespObj->assigned_from_user_id = $TenantApplicationDetails->AssignedFromUserID; 
                        $GetTenantAssignedApplicationDetailsRespObj->assigned_from_user_type_id = $TenantApplicationDetails->AssignedFromUserTypeID; 
                        $GetTenantAssignedApplicationDetailsRespObj->assigned_from_user_type = $TenantApplicationDetails->AssignedFromUserType; 
                        $GetTenantAssignedApplicationDetailsRespObj->assigned_date = $TenantApplicationDetails->AssignedDate; 
                        array_push($DataArray,$GetTenantAssignedApplicationDetailsRespObj);
                    }
                    $Response->status = 0;
                    $Response->message = "Assigned application details fetched successfully.";
                    $Response->data = $DataArray;
                    Log::channel('daily')->error("API Controller Response::" .json_encode($DataArray,true));
                }
                else{
                    $Response->status = 0;
                    $Response->message = "Failed to fetch assigned application details";
                    $Response->data = [];
                }
                
                Log::channel('daily')->error("API Controller Response::" .json_encode($DataArray,true));
            }
        } catch (\Exception $e) {   // exception handeling
            // response object after exception occurred
            $Response->status = 1;
            $Response->message = "Server/Network error, please try again.";
            $Response->data = null;

            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
        } finally {
            Log::channel('daily')->info("API Response :" . json_encode($Response));
            Log::channel('daily')->info("********  GetTenantAssignedApplicationDetails End ***************");

            // sending the response object
            return response()->json($Response, 200);
        }
    }
    public function GetApplicationDetailsByApplicationID(Request $request)
    {
        try {
            Log::channel('daily')->info("********GetApplicationDetailsByApplicationID Called ***************");
            
            // request parameter
            $ApplicationID = $request->ApplicationID;
            $Response = new Response();     // response object
            if($ApplicationID == null || $ApplicationID == ""){
                $Response->status = 1;
                $Response->message = "ApplicationID is required.";
                $Response->data=null;
            }
            else{
                $DataArray = array();
                $GetApplicationDetailsByIDResp = $this->DashboardCountsMapper->GetApplicationDetailsByApplicationId($ApplicationID);
                if(!empty($GetApplicationDetailsByIDResp)){
                    $ApplicationDetailsByApplicationIDResp = new ApplicationDetailsByApplicationIDResp();
                    $ApplicationDetailsByApplicationIDResp->application_no = $GetApplicationDetailsByIDResp[0]->ApplicationNo;
                    $ApplicationDetailsByApplicationIDResp->application_id = $GetApplicationDetailsByIDResp[0]->ApplicationID;
                    $ApplicationDetailsByApplicationIDResp->owner_name = $GetApplicationDetailsByIDResp[0]->OwnerName;
                    $ApplicationDetailsByApplicationIDResp->owner_gender_description = $GetApplicationDetailsByIDResp[0]->OwnerGenderDescription;
                    $ApplicationDetailsByApplicationIDResp->owner_police_station = $GetApplicationDetailsByIDResp[0]->OwnerPoliceStation;
                    $ApplicationDetailsByApplicationIDResp->owner_occupation = $GetApplicationDetailsByIDResp[0]->OwnerOccupation;
                    $ApplicationDetailsByApplicationIDResp->owner_contact_no = $GetApplicationDetailsByIDResp[0]->OwnerContactNo;
                    $ApplicationDetailsByApplicationIDResp->tenant_name = $GetApplicationDetailsByIDResp[0]->TenantName;
                    $ApplicationDetailsByApplicationIDResp->tenant_age = $GetApplicationDetailsByIDResp[0]->TenantAge;
                    $ApplicationDetailsByApplicationIDResp->tenant_gender_description = $GetApplicationDetailsByIDResp[0]->TenantGenderDescription;
                    $ApplicationDetailsByApplicationIDResp->tenant_guardian_name = $GetApplicationDetailsByIDResp[0]->TenantGuardianName;
                    $ApplicationDetailsByApplicationIDResp->tenant_contact_no = $GetApplicationDetailsByIDResp[0]->TenantContactNo;
                    $ApplicationDetailsByApplicationIDResp->tenant_occupation = $GetApplicationDetailsByIDResp[0]->TenantOccupation;
                    $ApplicationDetailsByApplicationIDResp->tenant_permanent_address = $GetApplicationDetailsByIDResp[0]->TenantPermanentAddress;
                    $ApplicationDetailsByApplicationIDResp->tenant_rented_address = $GetApplicationDetailsByIDResp[0]->TenantRentedAddress;
                    $ApplicationDetailsByApplicationIDResp->tenant_rented_address_police_station = $GetApplicationDetailsByIDResp[0]->TenantPoliceStation;
                    $ApplicationDetailsByApplicationIDResp->tenant_expected_period_of_stay_from_date = $GetApplicationDetailsByIDResp[0]->TenantExpectedPeriodOfStayFromDate;
                    $ApplicationDetailsByApplicationIDResp->tenant_reference_name1 = $GetApplicationDetailsByIDResp[0]->TenantReferenceName1;
                    $ApplicationDetailsByApplicationIDResp->tenant_reference1_address = $GetApplicationDetailsByIDResp[0]->TenantReference1Address;
                    $ApplicationDetailsByApplicationIDResp->tenant_reference1_contact_no = $GetApplicationDetailsByIDResp[0]->TenantReference1ContactNo;
                    $ApplicationDetailsByApplicationIDResp->owner_district_name = $GetApplicationDetailsByIDResp[0]->OwnerDistrictName;
                    $ApplicationDetailsByApplicationIDResp->tenant_district_name = $GetApplicationDetailsByIDResp[0]->TenantDistrictName;
                    $ApplicationDetailsByApplicationIDResp->owner_house_no = $GetApplicationDetailsByIDResp[0]->OwnerHouseNo;
                    $ApplicationDetailsByApplicationIDResp->owner_post_office = $GetApplicationDetailsByIDResp[0]->OwnerPostOffice;
                    $ApplicationDetailsByApplicationIDResp->owner_state = $GetApplicationDetailsByIDResp[0]->OwnerState;
                    $ApplicationDetailsByApplicationIDResp->owner_pincode = $GetApplicationDetailsByIDResp[0]->OwnerPincode;
                    $ApplicationDetailsByApplicationIDResp->tenant_post_office = $GetApplicationDetailsByIDResp[0]->TenantPostOffice;
                    $ApplicationDetailsByApplicationIDResp->tenant_state = $GetApplicationDetailsByIDResp[0]->TenantState;
                    $ApplicationDetailsByApplicationIDResp->tenant_pincode = $GetApplicationDetailsByIDResp[0]->TenantPincode;
                    $ApplicationDetailsByApplicationIDResp->tenant_expected_period_of_stay_to_date = $GetApplicationDetailsByIDResp[0]->TenantExpectedPeriodOfStayToDate;
                    $ApplicationDetailsByApplicationIDResp->owner_city_name = $GetApplicationDetailsByIDResp[0]->OwnerCityName;
                    $ApplicationDetailsByApplicationIDResp->tenant_city_name = $GetApplicationDetailsByIDResp[0]->TenantCityName;
                    $ApplicationDetailsByApplicationIDResp->tenant_country_name = $GetApplicationDetailsByIDResp[0]->TenantCountryName;
                    $ApplicationDetailsByApplicationIDResp->rented_property_premise_pincode = $GetApplicationDetailsByIDResp[0]->RentedPropertyPremisePincode;
                    $ApplicationDetailsByApplicationIDResp->rented_property_premise_city_name = $GetApplicationDetailsByIDResp[0]->RentedPropertyPremiseCityName;
                    $ApplicationDetailsByApplicationIDResp->rented_post_office = $GetApplicationDetailsByIDResp[0]->RentedPostOffice;
                    $ApplicationDetailsByApplicationIDResp->rented_address_district_name = $GetApplicationDetailsByIDResp[0]->RentedAddressDistrictName;
                    $ApplicationDetailsByApplicationIDResp->rented_address_police_station_id = $GetApplicationDetailsByIDResp[0]->RentedAddressPoliceStationID;
                    $ApplicationDetailsByApplicationIDResp->rented_address_state_name = $GetApplicationDetailsByIDResp[0]->RentedAddressStateName;
                    $ApplicationDetailsByApplicationIDResp->tenant_photo_url = $GetApplicationDetailsByIDResp[0]->TenantPhotoURL;
                    $ApplicationDetailsByApplicationIDResp->application_submission_date = $GetApplicationDetailsByIDResp[0]->ApplicationSubmissionDate;
                    //newly added
                    $ApplicationDetailsByApplicationIDResp->owner_gender_id = $GetApplicationDetailsByIDResp[0]->OwnerGenderID;
                    $ApplicationDetailsByApplicationIDResp->owner_police_station_id = $GetApplicationDetailsByIDResp[0]->OwnerPoliceStationID;
                    $ApplicationDetailsByApplicationIDResp->owner_state_id = $GetApplicationDetailsByIDResp[0]->OwnerStateID;
                    $ApplicationDetailsByApplicationIDResp->tenant_rented_address_police_station_id = $GetApplicationDetailsByIDResp[0]->RentedAddressPoliceStationID;
                    $ApplicationDetailsByApplicationIDResp->rented_address_district_id = $GetApplicationDetailsByIDResp[0]->RentedAddressDistrictID;
                    $ApplicationDetailsByApplicationIDResp->rented_address_state_id = $GetApplicationDetailsByIDResp[0]->RentedAddressStateID;

                    $Response->status = 0;
                    $Response->message = "Application details fetched successfully.";
                    $Response->data = $ApplicationDetailsByApplicationIDResp;
                    Log::channel('daily')->error("API Controller Response::" .json_encode($ApplicationDetailsByApplicationIDResp,true));
                }
                else{
                    $Response->status = 0;
                    $Response->message = "Failed to fetch application details";
                    $Response->data = [];
                }
                
                Log::channel('daily')->error("API Controller Response::" .json_encode($DataArray,true));
            }
        } catch (\Exception $e) {   // exception handeling
            // response object after exception occurred
            $Response->status = 1;
            $Response->message = "Server/Network error, please try again.";
            $Response->data = null;

            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
        } finally {
            Log::channel('daily')->info("API Response :" . json_encode($Response));
            Log::channel('daily')->info("********  GetApplicationDetailsByApplicationID End ***************");

            // sending the response object
            return response()->json($Response, 200);
        }
    }
    public function GetRentApplicationsInfoForUserByStatusID(Request $request) {
        try {
            Log::channel('daily')->info("******** GetRentApplicationsInfoForUserByStatusID Called ***************");
    
            // request parameter validation
            $validatedData = $request->validate([
                "UserID" => "required",
                "UserTypeID" => "required",
                "StatusID" => "required"
            ]);
    
            $optionalFields = [
                "FromDate",
                "ToDate"
            ];
            $optionalData = $request->only($optionalFields);
            $inputData = array_merge($validatedData, $optionalData);
            Log::channel('daily')->info("API Input: " . json_encode($inputData, true));
    
            $Response = new \stdClass(); // response object
            $Applications = $this->DashboardCountsMapper->GetRentApplicationsInfoForUserByStatusID(
                $inputData['UserID'],
                $inputData['UserTypeID'],
                $inputData['StatusID'],
                $inputData['FromDate'] ?? "",
                $inputData['ToDate'] ?? ""
            );
    
            $DataArray = [];
            if (!empty($Applications)) {
                foreach ($Applications as $application) {
                    $ApplicationsObj = new ApplicationDetailsByApplicationIDResp();
                    $ApplicationsObj->application_no = $application->ApplicationNo;
                    $ApplicationsObj->application_id = $application->ApplicationID;
                    $ApplicationsObj->owner_name = $application->OwnerName;
                    $ApplicationsObj->owner_gender_description = $application->OwnerGenderDescription;
                    $ApplicationsObj->owner_police_station = $application->OwnerPoliceStation;
                    $ApplicationsObj->owner_occupation = $application->OwnerOccupation;
                    $ApplicationsObj->owner_contact_no = $application->OwnerContactNo;
                    $ApplicationsObj->tenant_name = $application->TenantName;
                    $ApplicationsObj->tenant_age = $application->TenantAge;
                    $ApplicationsObj->tenant_gender_description = $application->TenantGenderDescription;
                    $ApplicationsObj->tenant_guardian_name = $application->TenantGuardianName;
                    $ApplicationsObj->tenant_contact_no = $application->TenantContactNo;
                    $ApplicationsObj->tenant_occupation = $application->TenantOccupation;
                    $ApplicationsObj->tenant_permanent_address = $application->TenantPermanentAddress;
                    $ApplicationsObj->tenant_rented_address = $application->TenantRentedAddress;
                    $ApplicationsObj->tenant_rented_address_police_station = $application->TenantPoliceStation;
                    $ApplicationsObj->tenant_expected_period_of_stay_from_date = $application->TenantExpectedPeriodOfStayFromDate;
                    $ApplicationsObj->tenant_reference_name1 = $application->TenantReferenceName1;
                    $ApplicationsObj->tenant_reference1_address = $application->TenantReference1Address;
                    $ApplicationsObj->tenant_reference1_contact_no = $application->TenantReference1ContactNo;
                    $ApplicationsObj->owner_district_name = $application->OwnerDistrictName;
                    $ApplicationsObj->tenant_district_name = $application->TenantDistrictName;
                    $ApplicationsObj->owner_house_no = $application->OwnerHouseNo;
                    $ApplicationsObj->owner_post_office = $application->OwnerPostOffice;
                    $ApplicationsObj->owner_state = $application->OwnerState;
                    $ApplicationsObj->owner_pincode = $application->OwnerPincode;
                    $ApplicationsObj->tenant_post_office = $application->TenantPostOffice;
                    $ApplicationsObj->tenant_state = $application->TenantState;
                    $ApplicationsObj->tenant_pincode = $application->TenantPincode;
                    $ApplicationsObj->tenant_expected_period_of_stay_to_date = $application->TenantExpectedPeriodOfStayToDate;
                    $ApplicationsObj->owner_city_name = $application->OwnerCityName;
                    $ApplicationsObj->tenant_city_name = $application->TenantCityName;
                    $ApplicationsObj->tenant_country_name = $application->TenantCountryName;
                    $ApplicationsObj->rented_property_premise_pincode = $application->RentedPropertyPremisePincode;
                    $ApplicationsObj->rented_property_premise_city_name = $application->RentedPropertyPremiseCityName;
                    $ApplicationsObj->rented_post_office = $application->RentedPostOffice;
                    $ApplicationsObj->rented_address_district_name = $application->RentedAddressDistrictName;
                    $ApplicationsObj->rented_address_police_station_id = $application->RentedAddressPoliceStationID;
                    $ApplicationsObj->rented_address_state_name = $application->RentedAddressStateName;
                    // Newly added fields
                    $ApplicationsObj->owner_gender_id = $application->OwnerGenderID;
                    $ApplicationsObj->owner_police_station_id = $application->OwnerPoliceStationID;
                    $ApplicationsObj->owner_state_id = $application->OwnerStateID;
                    $ApplicationsObj->tenant_rented_address_police_station_id = $application->RentedAddressPoliceStationID;
                    $ApplicationsObj->rented_address_district_id = $application->RentedAddressDistrictID;
                    $ApplicationsObj->rented_address_state_id = $application->RentedAddressStateID;
                    $ApplicationsObj->application_submission_date = $application->ApplicationSubmissionDate;
                    $ApplicationsObj->tenant_photo_url = $application->TenantPhotoURL;
                    $ApplicationsObj->approval_status_id = $application->ApprovalStatusID ?? 0;
                    $ApplicationsObj->approval_status = $application->ApprovalStatus ?? "";

                    $DataArray[] = $ApplicationsObj;
                }
                $Response->status = 0;
                $Response->message = "Applications fetched successfully";
                $Response->data = $DataArray;
            } else {
                $Response->status = 0;
                $Response->message = "No data found.";
                $Response->data = [];
            }
            Log::channel('daily')->info("Controller Response: " . json_encode($DataArray, true));
    
        } catch (\Exception $e) {
            // exception handling
            $Response = new \stdClass();
            $Response->status = 1;
            $Response->message = "An error occurred: " . $e->getMessage();
            $Response->data = null;
    
            Log::channel('daily')->error("Exception: " . $e->getMessage() . "\nFile: " . $e->getFile() . "\nLine: " . $e->getLine());
        } finally {
            Log::channel('daily')->info("API Response: " . json_encode($Response));
            Log::channel('daily')->info("******** GetRentApplicationsInfoForUserByStatusID End ***************");
    
            // sending the response object
            return response()->json($Response, 200);
        }
    }
}
