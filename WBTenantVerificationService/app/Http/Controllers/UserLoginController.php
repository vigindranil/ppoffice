<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserLoginModel;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Response;
class ValidateOTPResp{
    public $otp_tatus;
    public $otp_status_message;
    public $user_id; 
}
class UserLoginController extends Controller
{
    //
    public $userloginmapper ;
    public function __construct(UserLoginModel $Obj)
    {
        $this->userloginmapper = $Obj;
    }
    public function UserLoginSendOTP(Request $request)
    {   
        try
        {
            Log::channel('daily')->info("********  Send OTP Service Called ***************");
            $response = new Response();
            $response->status = 1;
            $response->message = "Failed to send OTP! Please try again after sometime.";
            $response->data = null;


            $MobileNo = $request->MobileNo;
            // $EmailID = $request->EmailID;

            Log::channel('daily')->info("Input Parameter :". json_encode($request->all()));

            // Generate OTP
            $GenerateOTP = $this->userloginmapper->GenerateOTP($MobileNo);
            Log::channel('daily')->info("DB Rsponse :". json_encode($GenerateOTP));
            if($GenerateOTP[0]->ErrorCode == 0) //success
            {
                if ($MobileNo != ""  && $MobileNo != null && $GenerateOTP[0]->IsOTP != "")
                {
                    // For Sending SMS
                    $ResSMSService =$this->userloginmapper->SMSForSendingOTP($MobileNo, $GenerateOTP[0]->IsOTP);
                    // Log::channel('daily')->info("ResSMSService Rsponse :". json_encode($ResSMSService));
                
                }else{
                    $response->status = 1;
                    $response->message = "Failed to send OTP! Please try again after sometime.";
                    $response->data = null;
                }

                //Email
                // $EmailService = new CEmailServiceController();
                // if($GetVerifyMobileNoForRegistration[0]->ApplicantEmailID != '' && $GetVerifyMobileNoForRegistration[0]->ApplicantEmailID != null)
                // {
                //     $EmailService->EmailID = $GetVerifyMobileNoForRegistration[0]->ApplicantEmailID;
                //     $EmailService->EmailForSendOTP($EmailService->EmailID, $GenerateOTP[0]->IsOTP);
                // }
                $response->status = 0;
                $response->message = "OTP Delivered Successfully in Your Mobile : ". $MobileNo;
                $response->data = [
                    "OTP" =>$GenerateOTP[0]->IsOTP
                ];
            }
            else
            {
                $response->status = 0;
                $response->message = "OTP not send in Your Mobile : ".$MobileNo;
                $response->data = null;
            }
        }
        catch(\Exception $e)
            {
                $response->status = 1;
                $response->message = "Server/Network Error ! Please try again";
                $response->data = null;
                Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
            }
            finally{
                Log::channel('daily')->info("API Response :". json_encode($response));
                Log::channel('daily')->info("********  Send OTP Service End ***************");
                return response()->json($response, 200);
            }
    }
    public function UserLoginValidateOTP(Request $request)
    {
        try
        {
            Log::channel('daily')->info("********  Validate OTP Service Called ***************");
            $MobileNo = $request->MobileNo;
            $OTP = $request->OTP;
            $flag = false;
            $response = new Response();
            $response->status = 1;
            $response->message = "Failed to send OTP! Please try again after sometime.";
            $response->data = null;
            Log::channel('daily')->info("Input Parameter :". json_encode($request->all()));
            // DB Operation ****************

            // To check OTP Correct or Not and set flag true if match 
            $ValidateOTP = $this->userloginmapper->ValidateOTP(
                $MobileNo,
                $OTP
            );
            Log::channel('daily')->info("DB Rsponse :". json_encode($ValidateOTP));

            // DB Operation ****************
            if($ValidateOTP != null)
                {
                    $ObjResValidateOTP = new ValidateOTPResp();

                    $ObjResValidateOTP->otp_tatus = $ValidateOTP[0]->OTPStatus;
                    $ObjResValidateOTP->otp_status_message = $ValidateOTP[0]->OTPStatusMessage;
                    $ObjResValidateOTP->user_id = $ValidateOTP[0]->UserID;
                    $response->status = 0;
                    $response->message = $ValidateOTP[0]->OTPStatusMessage;
                    $response->data = [
                        'otpstatus'=>$ValidateOTP[0]->OTPStatus,
                        "user_id" => $ValidateOTP[0]->UserID
                    ];
                   
                }
            else
                {
                    $response->status = 1;
                    $response->message = "Failed to verify OTP! Please try again after sometime.";
                    $response->data = null;
                }
        }catch(\Exception $e)
                {
                    $response->status = 1;
                    $response->message = "Server/Network Error ! Please try again";
                    $response->data = null;
                    Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
                }
                finally{
                    Log::channel('daily')->info("API Response :". json_encode($response));
                    Log::channel('daily')->info("********  Validate OTP Service End ***************");
                    return response()->json($response, 200);
                }
    }
}
