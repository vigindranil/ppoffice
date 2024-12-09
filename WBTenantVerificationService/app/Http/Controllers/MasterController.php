<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\MasterModel;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Response;


class AllDocTypesResp{
    public $document_type_id; 
    public $document_type_name;
   
}
class AllDistrict{
    public $district_id; 
    public $district_name;
   
}
class AllPSByDistResp{
    public $ps_id; 
    public $ps_name;
   
}
class AllStateResp{
    public $state_id; 
    public $state_name;
   
}
class MasterController
{
    //
    public function __construct(MasterModel $Obj)
    {
        $this->MasterMapper = $Obj;
    }
    public function GetAllDocumentTypes(Request $request)
    {
        try {
            Log::channel('daily')->info("********GetAllDocumentTypes Called ***************");
            
            // request parameter
            
            $Response = new Response();     // response object
           
                $DocTypes = $this->MasterMapper->GetAllDocumentType();
                
                $DataArray = array();
                if(!empty($DocTypes)){
                    foreach($DocTypes as $doc_type){
                        $DocTypeObj = new AllDocTypesResp();
                        $DocTypeObj->document_type_id= $doc_type->DocumentTypeID;
                        $DocTypeObj->document_type_name= $doc_type->DocumentTypeName;
                        array_push($DataArray,$DocTypeObj);
                    }
                    $Response->status = 0;
                    $Response->message = "Document types fetched successfully";
                    $Response->data = $DataArray;
                }
                else{
                    $Response->status = 0;
                    $Response->message = "Document types fetched successfully";
                    $Response->data = [];
                }
                
                Log::channel('daily')->error("Controller Response::" .json_encode($DataArray,true));

        } catch (\Exception $e) {   // exception handeling
            // response object after exception occurred
            $Response->status = 1;
            $Response->message = "Server/Network error, please try again.";
            $Response->data = null;

            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
        } finally {
            Log::channel('daily')->info("API Response :" . json_encode($Response));
            Log::channel('daily')->info("********  GetAllDocumentTypes End ***************");

            // sending the response object
            return response()->json($Response, 200);
        }
    }
    public function GetAllDistrict(Request $request)
    {
        try {
            Log::channel('daily')->info("********GetAllDistrict Called ***************");
            
            // request parameter
            
            $Response = new Response();     // response object
           
                $AllDist = $this->MasterMapper->GetAllDistricts();
                
                $DataArray = array();
                if(!empty($AllDist)){
                    foreach($AllDist as $dist){
                        $AllDistObj = new AllDistrict();
                        $AllDistObj->district_id= $dist->DistrictID;
                        $AllDistObj->district_name= $dist->DistrictName;
                        array_push($DataArray,$AllDistObj);
                    }
                    $Response->status = 0;
                    $Response->message = "Document types fetched successfully";
                    $Response->data = $DataArray;
                }
                else{
                    $Response->status = 0;
                    $Response->message = "All districts fetched successfully";
                    $Response->data = [];
                }
                
                Log::channel('daily')->error("Controller Response::" .json_encode($DataArray,true));

        } catch (\Exception $e) {   // exception handeling
            // response object after exception occurred
            $Response->status = 1;
            $Response->message = "Server/Network error, please try again.";
            $Response->data = null;

            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
        } finally {
            Log::channel('daily')->info("API Response :" . json_encode($Response));
            Log::channel('daily')->info("********  GetAllDistrict End ***************");

            // sending the response object
            return response()->json($Response, 200);
        }
    }
    public function GetAllPSByDist(Request $request)
    {
        try {
            Log::channel('daily')->info("********GetAllPSByDist Called ***************");
            
            // request parameter
            $DistID = $request->input("DistID");
            if($DistID == 0){
                    $Response->status = 1;
                    $Response->message = "Please choose a valid district.";
                    $Response->data = null;
            }
            $Response = new Response();     // response object
           
                $AllPS = $this->MasterMapper->GetAllPSByDist($DistID);
                
                $DataArray = array();
                if(!empty($AllPS)){
                    foreach($AllPS as $ps){
                        $AllPSObj = new AllPSByDistResp();
                        $AllPSObj->ps_id= $ps->PoliceStationID;
                        $AllPSObj->ps_name= $ps->PoliceStationName;
                        array_push($DataArray,$AllPSObj);
                    }
                    $Response->status = 0;
                    $Response->message = "Document types fetched successfully";
                    $Response->data = $DataArray;
                }
                else{
                    $Response->status = 0;
                    $Response->message = "All districts fetched successfully";
                    $Response->data = [];
                }
                
                Log::channel('daily')->error("Controller Response::" .json_encode($DataArray,true));

        } catch (\Exception $e) {   // exception handeling
            // response object after exception occurred
            $Response->status = 1;
            $Response->message = "Server/Network error, please try again.";
            $Response->data = null;

            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
        } finally {
            Log::channel('daily')->info("API Response :" . json_encode($Response));
            Log::channel('daily')->info("********  GetAllPSByDist End ***************");

            // sending the response object
            return response()->json($Response, 200);
        }
    }
    public function GetAllStates(Request $request)
    {
        try {
            Log::channel('daily')->info("********GetAllStates Called ***************");
            
            // request parameter
            
            $Response = new Response();     // response object
           
                $AllStates = $this->MasterMapper->GetAllStates();
                
                $DataArray = array();
                if(!empty($AllStates)){
                    foreach($AllStates as $state){
                        $AllStatesObj = new AllStateResp();
                        $AllStatesObj->state_id= $state->StateID;
                        $AllStatesObj->state_name= $state->StateName;
                        array_push($DataArray,$AllStatesObj);
                    }
                    $Response->status = 0;
                    $Response->message = "Document types fetched successfully";
                    $Response->data = $DataArray;
                }
                else{
                    $Response->status = 0;
                    $Response->message = "Document types fetched successfully";
                    $Response->data = [];
                }
                
                Log::channel('daily')->error("Controller Response::" .json_encode($DataArray,true));

        } catch (\Exception $e) {   // exception handeling
            // response object after exception occurred
            $Response->status = 1;
            $Response->message = "Server/Network error, please try again.";
            $Response->data = null;

            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
        } finally {
            Log::channel('daily')->info("API Response :" . json_encode($Response));
            Log::channel('daily')->info("********  GetAllStates End ***************");

            // sending the response object
            return response()->json($Response, 200);
        }
    }
}
