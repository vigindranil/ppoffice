<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PHPUnit\Framework\Constraint\IsEmpty;

class AadharVerificationModel
{
    public function SetSendAadhaarOTPInfo($aadhaar_number,$consent,$user_id,$requestId,$transactionId,$status,
    $code,$message,$timestamp,$path)
    {
        Log::channel('daily')->info("SetSendAadhaarOTPInfo");
        try 
        {
            do {
                $sql = DB::select('call sp_setSendAadhaarOTPInfo(?,?,?,?,?,?,?,?,?,?,@ErrorCode)', [
                    $aadhaar_number,$consent,$user_id,$requestId,$transactionId,$status,
                            $code,$message,$timestamp,$path
                ]);
                $sqlErr = DB::select('select @ErrorCode as ErrorCode');
                if ($sqlErr[0]->ErrorCode > 0) {
                    $sql = null;
                    break;
                }
            } while (FALSE);
        } catch (\Exception $e) {
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
        } 
        return $sqlErr;
    }

    public function SetValidateAadhaarOTPInfo($user_id,$requestId,$transactionId,$status,
    $message,$name,$timestamp,$path)
    {
        Log::channel('daily')->info("SetValidateAadhaarOTPInfo");
        try 
        {
            do {
                $sql = DB::select('call sp_setValidateAadhaarOTPInfo(?,?,?,?,?,?,?,?,@ErrorCode)', [
                    $user_id,$requestId,$transactionId,$status,
                        $message,$name,$timestamp,$path
                ]);
                $sqlErr = DB::select('select @ErrorCode as ErrorCode');
                if ($sqlErr[0]->ErrorCode > 0) {
                    $sql = null;
                    break;
                }

                // Log::channel('daily')->info("sqlErr::".$sqlErr);
            } while (FALSE);
        } catch (\Exception $e) {
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
        } 
        return $sqlErr;
    }
}
