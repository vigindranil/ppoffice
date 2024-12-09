<?php

namespace App;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ApplicationModel
{
    private $BartaBaseURL = "http://barta.wb.gov.in/send_sms_ites_webel.php?";
    private $extra = "";
    private $passkey = "sms_webel_ites_5252_@$#";
    
    public $smstext;
    public $MobileNumber;
    public $smsCategory;
    public $tenant_login_link;
    public function __construct()
    {}
    public function SendSmsToTenantLandlordInitiatedApplication($OwnerName,$MobileNumber)
    {
        try
        {
            // $HashKey = "12345";
            $link_url = $this->tenant_login_link = "tenant-register-login";
            $message = "Tenant verification process has been initiated by ".$OwnerName. ".  Please complete it by clicking on".$link_url;
            $tpid = "1307172182173710211"; 
            $smsCategory = "Landlord initiated application";      
            $response = $this->SendSMSLive($message, $MobileNumber, $smsCategory, $tpid);
        }
        catch (\Exception $e)
        {
            $response = [
                'status' => 1,
                'message' => trans('MsgCommonValidation.ExceptionMsg'),
                'data'    => null,
            ];
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
        }
        finally
        {
            return $response;
        }
    }

    public function SendSMSLive(string $smstext, string $MobileNumber, string $smsCategory, int $tpid)
    {
        // $ret = new RSTATUS(ErrorCode::E_FAIL);
        try
        {
            Log::channel('daily')->info("enter SendSMSLive");
            $numbers = urlencode($MobileNumber);
            $message = urlencode($smstext);
            $passkeynew = rawurlencode($this->passkey);
            //sms_webel_ites_5252_%40%24%23

            $data = 'mobile='.$numbers.'&message='.$message.'&templateid='.$tpid.'&extra='.$this->extra.'&passkey='.$passkeynew;
            
            Log::channel('daily')->info("BartaBaseURL:::".$this->BartaBaseURL . $data);

            $curl = curl_init();

            curl_setopt_array($curl, array(
            CURLOPT_URL => $this->BartaBaseURL . $data,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            ));

            $SmsExecution = curl_exec($curl);
            Log::channel('daily')->info("Sms Execution:".$SmsExecution);
            curl_close($curl);
            $response="";
        }
        catch (\Exception $e)
        {
            $response = [
                'status' => 1,
                'message' => trans('MsgCommonValidation.ExceptionMsg'),
                'data'    => null,
            ];
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
        }
        finally
        {
            return $response;
        }
    } 
    public function SaveRentApplicationDetailsV5(
        $InApplicationID,
        $OwnerName,
        $OwnerGenderDescription,
        $OwnerGenderID,
        $OwnerPoliceStation,
        $OwnerOccupation,
        $OwnerContactNo,
        $TenantName,
        $TenantAge,
        $TenantGenderDescription,
        $TenantGenderID,
        $TenantGuardianName,
        $TenantContactNo,
        $TenantOccupation,
        $TenantPermanentAddress,
        $TenantRentedAddress,
        $TenantRentedAddressPoliceStation,
        $TenantExpectedPeriodOfStayFromDate,
        $TenantReferenceName1,
        $TenantReference1Address,
        $TenantReference1ContactNo,
        $EntryUserID,
        $OwnerDistrictName,
        $TenantDistrictName,
        $UserTypeID,
        $OwnerHouseNo,
        $OwnerPostOffice,
        $OwnerState,
        $OwnerPincode,
        $TenantPostOffice,
        $TenantState,
        $TenantPincode,
        $TenantDistrictID,
        $OwnerPSID,
        $TenantPSID,
        $TenantExpectedPeriodOfStayToDate,
        $OwnerDistrictID,
        $OwnerCityName,
        $TenantCityName,
        $TenantCountryName,
        $RentedPropertyPremisePincode,
        $RentedPropertyPremiseCityName,
        $RentedPostOffice,
        $RentedAddressDistrictID,
        $RentedAddressDistrictName,
        $RentedAddressPoliceStationID,
        $RentedAddressStateID,
        $RentedAddressStateName,
        $IsRentedAddressSameAsLandlordAddress,
        $TenantPhotoURL,
        $RentedAddressPoliceStationName,
        $OwnerStateID
    )
    {
        $sql = null;

        try 
        {
            Log::channel('daily')->error("SP sp_saveRentApplicationDetailsV5 Input::" . json_encode(array(
                $InApplicationID,
                $OwnerName,
                $OwnerGenderDescription,
                $OwnerGenderID,
                $OwnerPoliceStation,
                $OwnerOccupation,
                $OwnerContactNo,
                $TenantName,
                $TenantAge,
                $TenantGenderDescription,
                $TenantGenderID,
                $TenantGuardianName,
                $TenantContactNo,
                $TenantOccupation,
                $TenantPermanentAddress,
                $TenantRentedAddress,
                $TenantRentedAddressPoliceStation,
                $TenantExpectedPeriodOfStayFromDate,
                $TenantReferenceName1,
                $TenantReference1Address,
                $TenantReference1ContactNo,
                $EntryUserID,
                $OwnerDistrictName,
                $TenantDistrictName,
                $UserTypeID,
                $OwnerHouseNo,
                $OwnerPostOffice,
                $OwnerState,
                $OwnerPincode,
                $TenantPostOffice,
                $TenantState,
                $TenantPincode,
                $TenantDistrictID,
                $OwnerPSID,
                $TenantPSID,
                $TenantExpectedPeriodOfStayToDate,
                $OwnerDistrictID,
                $OwnerCityName,
                $TenantCityName,
                $TenantCountryName,
                $RentedPropertyPremisePincode,
                $RentedPropertyPremiseCityName,
                $RentedPostOffice,
                $RentedAddressDistrictID,
                $RentedAddressDistrictName,
                $RentedAddressPoliceStationID,
                $RentedAddressStateID,
                $RentedAddressStateName,
                $IsRentedAddressSameAsLandlordAddress,
                $TenantPhotoURL,
                $RentedAddressPoliceStationName,
                $OwnerStateID),true));
                $sql = DB::select('call sp_saveRentApplicationDetailsV5(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@ApplicationID,@ApplicationNo,@ErrorCode)', 
                [
                    $InApplicationID,
                    $OwnerName,
                    $OwnerGenderDescription,
                    $OwnerGenderID,
                    $OwnerPoliceStation,
                    $OwnerOccupation,
                    $OwnerContactNo,
                    $TenantName,
                    $TenantAge,
                    $TenantGenderDescription,
                    $TenantGenderID,
                    $TenantGuardianName,
                    $TenantContactNo,
                    $TenantOccupation,
                    $TenantPermanentAddress,
                    $TenantRentedAddress,
                    $TenantRentedAddressPoliceStation,
                    $TenantExpectedPeriodOfStayFromDate,
                    $TenantReferenceName1,
                    $TenantReference1Address,
                    $TenantReference1ContactNo,
                    $EntryUserID,
                    $OwnerDistrictName,
                    $TenantDistrictName,
                    $UserTypeID,
                    $OwnerHouseNo,
                    $OwnerPostOffice,
                    $OwnerState,
                    $OwnerPincode,
                    $TenantPostOffice,
                    $TenantState,
                    $TenantPincode,
                    $TenantDistrictID,
                    $OwnerPSID,
                    $TenantPSID,
                    $TenantExpectedPeriodOfStayToDate,
                    $OwnerDistrictID,
                    $OwnerCityName,
                    $TenantCityName,
                    $TenantCountryName,
                    $RentedPropertyPremisePincode,
                    $RentedPropertyPremiseCityName,
                    $RentedPostOffice,
                    $RentedAddressDistrictID,
                    $RentedAddressDistrictName,
                    $RentedAddressPoliceStationID,
                    $RentedAddressStateID,
                    $RentedAddressStateName,
                    $IsRentedAddressSameAsLandlordAddress,
                    $TenantPhotoURL,
                    $RentedAddressPoliceStationName,
                    $OwnerStateID]);
            $sqlErr = DB::select('select @ApplicationID as ApplicationID,@ApplicationNo as ApplicationNo, @ErrorCode as ErrorCode');
            Log::channel('daily')->error("DB Response::" . json_encode($sqlErr,true));

        } 
        catch (\Exception $e) {
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
            return null;
        }
        return $sqlErr;                
    }
    public function SaveApplicationInfoForAssignToTenant(
        $ApplicationID,
        $AssignedFromUserID,
        $AssignedFromContactNo,
        $AssignedToContactNo,
        $AssignedFromUserTypeID,
        $AssignedToUserTypeID,
        $EntryUserID
    )
    {
        $sql = null;

        try 
        {
            Log::channel('daily')->error("SP sp_saveApplicationInfoForAssign Input::" . json_encode(array(
                $ApplicationID,
                $AssignedFromUserID,
                $AssignedFromContactNo,
                $AssignedToContactNo,
                $AssignedFromUserTypeID,
                $AssignedToUserTypeID,
                $EntryUserID),true));
                $sql = DB::select('call sp_saveApplicationInfoForAssign(?,?,?,?,?,?,?,@ErrorCode)', 
                [
                    $ApplicationID,
                    $AssignedFromUserID,
                    $AssignedFromContactNo,
                    $AssignedToContactNo,
                    $AssignedFromUserTypeID,
                    $AssignedToUserTypeID,
                    $EntryUserID]);
            $sqlErr = DB::select('select @ErrorCode as ErrorCode');
            Log::channel('daily')->error("DB sp_saveApplicationInfoForAssign  Response::" . json_encode($sqlErr,true));

        } 
        catch (\Exception $e) {
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
            return null;
        }
        return $sqlErr;                
    }
    public function SaveUserApprovalStatusUpdate(
        $ApplicationID,
        $ApprovalStatus
    )
    {
        $sql = null;

        try 
        {
            Log::channel('daily')->error("SP sp_saveUserApprovalStatusUpdate Input::" . json_encode(array(
                $ApplicationID,
                $ApprovalStatus),true));
                $sql = DB::select('call sp_saveUserApprovalStatusUpdate(?,?,@ErrorCode)', 
                [
                    $ApplicationID,
                    $ApprovalStatus]);
            $sqlErr = DB::select('select @ErrorCode as ErrorCode');
            Log::channel('daily')->error("DB sp_saveUserApprovalStatusUpdate  Response::" . json_encode($sqlErr,true));

        } 
        catch (\Exception $e) {
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
            return null;
        }
        return $sqlErr;                
    }
}
