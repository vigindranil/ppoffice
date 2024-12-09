<?php

namespace App;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;


class AdminDashboardFuncModel 
{
    public function GetAdminDashboardCounts($AuthorityUserID,$AuthorityUserTypeID,$DistrictID){
        $sql = null;
        try {
            // sp call
            Log::channel('daily')->error("SP Input::" .json_encode(array($AuthorityUserID,$AuthorityUserTypeID,$DistrictID),true));
            $sql = DB::select('call sp_getAuthorityDashboardCount(?,?,?)', [$AuthorityUserID,$AuthorityUserTypeID,$DistrictID]);
            Log::channel('daily')->error("sp_getAuthorityDashboardCount response::".json_encode($sql,true));
               
        } catch (\Exception $e) { // exception handeling
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
            return null;
        }
        return $sql;
    }

    public function GetAuthorityApplicationDetailsByStatusID($StatusID, $AuthorityUserID,$DistrictID,$FromDate,$ToDate){
        $sql = null;
        try {
            // sp call
            $sql = DB::select('call sp_getAuthorityApplicationDetailsByStatusID(?,?,?,?,?)', [$StatusID, $AuthorityUserID,$DistrictID,$FromDate,$ToDate]);
            Log::channel('daily')->error("sp_getAuthorityApplicationDetailsByStatusID response::".json_encode($sql,true));     
        } catch (\Exception $e) { // exception handeling
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
            return null;
        }
        return $sql;
    }
    public function SaveApprovalStatusUpdate(
        $ApplicationID,
        $ApprovalStatus,
        $ApprovalAuthorityUserID,
        $ApprovalAuthorityDistrictID,
        $ApprovalAuthorityRemarks
    )
    {
        $sql = null;

        try 
        {
            Log::channel('daily')->error("SP sp_saveApprovalStatusUpdate Input::" . json_encode(array(
                $ApplicationID,
                $ApprovalStatus,
                $ApprovalAuthorityUserID,
                $ApprovalAuthorityDistrictID,
                $ApprovalAuthorityRemarks),true));
                $sql = DB::select('call sp_saveApprovalStatusUpdate(?,?,?,?,?,@ErrorCode)', 
                [
                    $ApplicationID,
                    $ApprovalStatus,
                    $ApprovalAuthorityUserID,
                    $ApprovalAuthorityDistrictID,
                    $ApprovalAuthorityRemarks
                ]);
            $sqlErr = DB::select('select @ErrorCode as ErrorCode');
            Log::channel('daily')->error("DB sp_saveApprovalStatusUpdate  Response::" . json_encode($sqlErr,true));

        } 
        catch (\Exception $e) {
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
            return null;
        }
        return $sqlErr;                
    }
}
