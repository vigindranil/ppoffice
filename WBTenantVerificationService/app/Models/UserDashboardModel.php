<?php

namespace App;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class UserDashboardModel 
{
    public function GetUserDashboardCounts($UserID,$UserTypeID){
        $sql = null;
        try {
            // sp call
            $sql = DB::select('call sp_getUserDashboardCount(?,?)', [$UserID,$UserTypeID]);
            Log::channel('daily')->error("sp_getUserDashboardCount response::".json_encode($sql,true));
               
        } catch (\Exception $e) { // exception handeling
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
            return null;
        }
        return $sql;
    }
    public function GetTenantApplicationDetailsByUserID($UserID){
        $sql = null;
        try {
            // sp call
            $sql = DB::select('call sp_getRentApplicationDetailsV1(?)', [$UserID]);
            Log::channel('daily')->error("sp_getRentApplicationDetailsV1 response::".json_encode($sql,true));
               
        } catch (\Exception $e) { // exception handeling
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
            return null;
        }
        return $sql;
    }
    public function GetTenantAssignedApplicationDetails($ContactNo,$UserTypeID){
        $sql = null;
        try {
            // sp call
            $sql = DB::select('call sp_getAssignedApplicationInfo(?,?)', [$ContactNo,$UserTypeID]);
            Log::channel('daily')->error("sp_getAssignedApplicationInfo response::".json_encode($sql,true));
               
        } catch (\Exception $e) { // exception handeling
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
            return null;
        }
        return $sql;
    }
    public function GetApplicationDetailsByApplicationId($ApplicationID){
        $sql = null;
        try {
            // sp call
            $sql = DB::select('call sp_getApplicationDetailsByApplicationID(?)', [$ApplicationID]);
            Log::channel('daily')->error("sp_getApplicationDetailsByApplicationID response::".json_encode($sql,true));
               
        } catch (\Exception $e) { // exception handeling
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
            return null;
        }
        return $sql;
    }
    public function GetRentApplicationsInfoForUserByStatusID($UserID,$UserTypeID,$StatusID,$FromDate,$ToDate){
        $sql = null;
        try {
            // sp call
            $sql = DB::select('call sp_getRentApplicationsInfoForUserByStatusID(?,?,?,?,?)', [$UserID,$UserTypeID,$StatusID,$FromDate,$ToDate]);
            Log::channel('daily')->error("sp_getRentApplicationsInfoForUserByStatusID response::".json_encode($sql,true));     
        } catch (\Exception $e) { // exception handeling
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
            return null;
        }
        return $sql;
    }
}
