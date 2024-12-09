<?php

namespace App;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class AdminLoginModel {
    private $BartaBaseURL = "http://barta.wb.gov.in/send_sms_ites_webel.php?";
    private $extra = "";
    private $passkey = "sms_webel_ites_5252_@$#";
    
    public $smstext;
    public $MobileNumber;
    public $smsCategory;
    public $tenant_login_link;
	// public $UserAppLink = "http://bit.do/sparking-user";
    
    public function __construct()
    {}
    
    public function SMSForSendingOTP(string $MobileNumber, int $OTP)
    {
        try
        {
            $message = "OTP to login in Tenant Verification Portal is ".$OTP. ". DITE GoWB";
            $tpid = "1307172182164912590";       
            $smsCategory = "Sending OTP";
            
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
    public function GenerateOTP($MobileNo)
    {
        try 
        {  
            Log::channel('daily')->info("sp_authorityGenerateOTP called");
            $sql = DB::select('call sp_authorityGenerateOTP(?,@IsOTP,@ErrorCode)', [$MobileNo]);
            $sqlErr = DB::select('select @IsOTP as IsOTP,@ErrorCode as ErrorCode');
            Log::channel('daily')->info("DB Response::" . json_encode($sqlErr, true));

        } catch (\Exception $e) {
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
        } 
        return $sqlErr;
    }

    public function ValidateOTP($MobileNo,
    $OTP)
    {
        try {
            $SqlErr =[];

            $sql = DB::select('call sp_authorityValidateOTPV2(?,?,@ErrorCode,@AuthorityUserID,@AuthorityUserTypeID,@AuthorityUserName,@AuthorityDistrictID,@AuthorityDistrictName)', [
                $MobileNo,
                $OTP
            ]);
            Log::channel('daily')->info("DB sp_authorityValidateOTPV2 Response::" . json_encode($sql, true));
            $SqlErr = DB::select('select @ErrorCode as ErrorCode, @AuthorityUserID as AuthorityUserID,@AuthorityUserTypeID as AuthorityUserTypeID,@AuthorityUserName as AuthorityUserName,@AuthorityDistrictID as AuthorityDistrictID,@AuthorityDistrictName as AuthorityDistrictName');
        } catch (\Exception $e) {
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
        } 
        return $SqlErr;
    }
}
