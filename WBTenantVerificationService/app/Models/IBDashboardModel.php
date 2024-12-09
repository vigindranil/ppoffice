<?php

namespace App;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class IBDashboardModel
{
    public function GetIBApplicationDetailsByStatusID($StatusID,$IBUserID,$FromDate,$ToDate){
        $sql = null;
        try {
            // sp call
            $sql = DB::select('call sp_getIBApplicationDetailsByStatusID(?,?,?,?)', [$StatusID,$IBUserID,$FromDate,$ToDate]);
            Log::channel('daily')->error("sp_getIBApplicationDetailsByStatusID response::".json_encode($sql,true));     
        } catch (\Exception $e) { // exception handeling
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
            return null;
        }
        return $sql;
    }
}
