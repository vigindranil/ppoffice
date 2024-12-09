<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AdminLoginModel;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Response;
class ValidateOTPResp{
    public $authority_user_id;
    public $authority_user_type_id;
    public $authority_user_name;
    public $authority_district_id;
    public $authority_district_name;
}
class AdminLoginController
{
    public $adminloginmapper ;
    public function __construct(AdminLoginModel $Obj)
    {
        $this->adminloginmapper = $Obj;
    }
    public function AdminLoginSendOTP(Request $request)
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
            $GenerateOTP = $this->adminloginmapper->GenerateOTP($MobileNo);
            Log::channel('daily')->info("DB Rsponse :". json_encode($GenerateOTP));
            if($GenerateOTP[0]->ErrorCode == 0) //success
            {
                if ($MobileNo != ""  && $MobileNo != null && $GenerateOTP[0]->IsOTP != "")
                {
                    // For Sending SMS
                    $ResSMSService =$this->adminloginmapper->SMSForSendingOTP($MobileNo, $GenerateOTP[0]->IsOTP);
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
            else if($GenerateOTP[0]->ErrorCode ==2){
                $response->status = 1;
                $response->message = "You are unauthorized to login.";
                $response->data = null;
            }
            else{
                $response->status = 1;
                $response->message = "Failed to send OTP! Please try again after sometime.";
                $response->data = null;
            }
            // else
            // {
            //     $response->status = 0;
            //     $response->message = "OTP not send in Your Mobile : ".$MobileNo;
            //     $response->data = null;
            // }
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
    public function AdminLoginValidateOTP(Request $request)
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
            $ValidateOTP = $this->adminloginmapper->ValidateOTP(
                $MobileNo,
                $OTP
            );
            Log::channel('daily')->info("DB Rsponse :". json_encode($ValidateOTP));

            // DB Operation ****************
            if($ValidateOTP != null)
                if($ValidateOTP[0]->ErrorCode == 0){
                    $ObjResValidateOTP = new ValidateOTPResp();
                    $ObjResValidateOTP->authority_user_id = $ValidateOTP[0]->AuthorityUserID;
                    $ObjResValidateOTP->authority_user_type_id = $ValidateOTP[0]->AuthorityUserTypeID;
                    $ObjResValidateOTP->authority_user_name = $ValidateOTP[0]->AuthorityUserName;
                    $ObjResValidateOTP->authority_district_id = $ValidateOTP[0]->AuthorityDistrictID;
                    $ObjResValidateOTP->authority_district_name = $ValidateOTP[0]->AuthorityDistrictName;
                    $response->status = 0;
                    $response->message = "OTP validated successfully.";
                    $response->data = $ObjResValidateOTP;
                }
                else if($ValidateOTP[0]->ErrorCode ==2){
                    $response->status = 1;
                    $response->message = "You are unauthorized to login.";
                    $response->data = null;
                }
                else{
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
