<?php

namespace App;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class MasterModel 
{
    public function GetAllDocumentType(){
        $sql = null;
        try {
            // sp call
            $sql = DB::select('call sp_getAllDocumentType()');
            Log::channel('daily')->error("sp_getAllDocumentType response::".json_encode($sql,true));
               
        } catch (\Exception $e) { // exception handeling
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
            return null;
        }
        return $sql;
    }
    public function GetAllDistricts(){
        $sql = null;
        try {
            // sp call
            $sql = DB::select('call sp_getAllDistrict()');
            Log::channel('daily')->error("sp_getAllDistrict response::".json_encode($sql,true));
               
        } catch (\Exception $e) { // exception handeling
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
            return null;
        }
        return $sql;
    }
    public function GetAllPSByDist($DistID){
        $sql = null;
        try {
            // sp call
            $sql = DB::select('call sp_getAllPoliceStations(?)',[$DistID]);
            Log::channel('daily')->error("sp_getAllPoliceStations response::".json_encode($sql,true));
               
        } catch (\Exception $e) { // exception handeling
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
            return null;
        }
        return $sql;
    }
    public function GetAllStates(){
        $sql = null;
        try {
            // sp call
            $sql = DB::select('call sp_getAllState()');
            Log::channel('daily')->error("sp_getAllState response::".json_encode($sql,true));
               
        } catch (\Exception $e) { // exception handeling
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
            return null;
        }
        return $sql;
    }
}
