<?php

namespace App\Http\Controllers;

use App\Models\AadharVerificationModel;

use Illuminate\Http\Request;
use PhpParser\Node\Stmt\Catch_;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\CXApiTokenController;

class ResRequstAadherOtp
{
    public $trans_id; 
    public $random_key; 
    public $inalidToken;
}
class ResVeryfiOtp
{
    public $aadhar_verified_token;
    public $inalidToken;
    public $random_key;
}

class AadhaarVerificationProcessController extends Controller
{
    public $AadhaarMapper;

    public function __construct(AadharVerificationModel $Obj)
    {
        $this->AadhaarMapper = $Obj;
    }

    public function SendAadhaarOTP(Request $request)
    {
        try
        {
            do
            {
            Log::channel('daily')->info("********  Send Aadhaar OTP Service Called ***************");  
            $response = '';
            $error_message = 'FAILED TO PERFORM THE OPERATION. EXCEPTIONAL ERROR OCCURRED. PLEASE TRY AGAIN. IF PROBLEM PERSIST, PLEASE CONTACT ADMINISTRATOR.';
            
            $aadhaar_number = $request->aadhaar_number;
            if (is_null($aadhaar_number) || empty($aadhaar_number)) {
                $response = [
                    'status' => 3,
                    'data'    => null,
                    'message' => trans('MsgCompanyValidation.NullAadharNo'),
                    "Timestamp" => time(),
                ];
                break;
                //return response()->json($response, 200);
            }

            $consent = $request->consent;
            if (is_null($consent) || empty($consent)) {
                $response = [
                    'status' => 3,
                    'data'    => null,
                    'message' => 'Consent is Required',
                    "Timestamp" => time(),
                ];
                break;
                //return response()->json($response, 200);
            }

            $user_id = $request->user_id;
            if (is_null($user_id) || empty($user_id)) {
                $response = [
                    'status' => 3,
                    'data'    => null,
                    'message' => trans('MsgCommonValidation.NullEntryUserID'),
                    "Timestamp" => time(),
                ];
                break;
                //return response()->json($response, 200);
            }

            $inputparam = [
                "aadhaar_number"=>$aadhaar_number,
                "consent" =>$consent,
            ];
            Log::channel('daily')->info("Input Parameter :" . json_encode($inputparam));
            $curl = curl_init();

		curl_setopt_array($curl, array(
		  CURLOPT_URL => 'https://api.gridlines.io/aadhaar-api/boson/generate-otp',
		  CURLOPT_RETURNTRANSFER => true,
		  CURLOPT_ENCODING => '',
		  CURLOPT_MAXREDIRS => 10,
		  CURLOPT_TIMEOUT => 0,
		  CURLOPT_FOLLOWLOCATION => true,
		  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		  CURLOPT_CUSTOMREQUEST => 'POST',
		  CURLOPT_POSTFIELDS =>json_encode($inputparam,true),
		  CURLOPT_HTTPHEADER => array(
		    'Accept: application/json',
		    'Content-Type: application/json',
		    'X-API-Key: 0ZU5MIiP9neGxEhpxLZCpBrmDk087jw0',
		    'X-Auth-Type: API-Key'
		  ),
		));

		$response = curl_exec($curl);
            
            if ($response === false) {
                // Handle cURL error, including "URL not found"
                $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

                $error = curl_error($curl);
                Log::channel('daily')->info("Status Code :" . "API Not Found/Server Not Found: httpCode " . $httpCode);

                $response = [
                    "status" => 1,
                    "message" => $error_message,
                    "data" => [],
                    "Timestamp" => time(),
                ];

                // Log the error, return a custom error response, or take appropriate action.
            } else {
                // Check the HTTP status code of the response
                $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

                // Check if the response is in HTML format (e.g., text/html)
                $contentType = curl_getinfo($curl, CURLINFO_CONTENT_TYPE);

                if ($httpCode === 404) {
                    Log::channel('daily')->info("Status Code :" . "API Not Found/Server Not Found: httpCode " . $httpCode);

                    $response = [
                        "status" => 1,
                        "message" => $error_message,
                        "data" => [],
                        "Timestamp" => time(),
                    ];
                    // Handle "URL not found" error
                    // Log the error, return a custom error response, or take appropriate action.
                } elseif (strpos($contentType, 'text/html') !== false) {
                    // Handle HTML error response
                    // You can parse or display the HTML error page as needed
                    Log::channel('daily')->info("Status Code :" . "API Not Found/Server Not Found");

                    $response = [
                        "status" => 1,
                        "message" => $error_message,
                        "data" => [],
                        "Timestamp" => time(),
                    ];
                } elseif ($httpCode === 200) {
                    Log::channel('daily')->info("Service Response :" . $response);
                    $data = json_decode($response, TRUE);
                    if ($data['status'] == 200) {
                        $requestId = $data['request_id'];
                        $transactionId = $data['transaction_id'];
                        $status = $data['status'];
                        $code = $data['data']['code'];
                        $message = $data['data']['message'];
                        $timestamp = $data['timestamp'];
                        $path = $data['path'];

                        // Store Data In DB in a spearate table Aadhaar Request OTP Transction Agaisnt UserID  Store Aadhaar Number \ 
                        $SetSendAadhaarOTPInfo = $this->AadhaarMapper->SetSendAadhaarOTPInfo($aadhaar_number,$consent,$user_id,$requestId,$transactionId,$status,
                        $code,$message,$timestamp,$path);
                        Log::channel('daily')->info("DB Response::".json_encode($SetSendAadhaarOTPInfo));
                        // Store Data In DB in a spearate table Aadhaar Request OTP Transction Agaisnt UserID  Store Aadhaar Number \

                        if($SetSendAadhaarOTPInfo != null)
                        {
                            if($SetSendAadhaarOTPInfo[0]->ErrorCode == 0)
                            {
                                $response = [
                                    "status" => 0,
                                    "request_id" => $requestId,
                                    "transaction_id"=> $transactionId ,
                                    "message" => $message,
                                    "data" => [
                                        "code" => "1001",
                                        "transaction_id"=> $transactionId
                                    ],
                                    "Timestamp" => $timestamp,
                                    "path"=> $data['path']
                                ];
                            }
                            else
                            {
                                $response = [
                                    "status" => 1,
                                    "message" => "Failed to save in DB!",
                                    "data" => [],
                                    "Timestamp" => time(),
                                ];
                            }
                        }
                        else
                        {
                            $response = [
                                "status" => 1,
                                "message" => "No Record Found!",
                                "data" => [],
                                "Timestamp" => time(),
                            ];
                        }   
                    } 
                } else {
                    Log::channel('daily')->info("Status Code :" . $httpCode);
                    Log::channel('daily')->info("Aadhar response :" . $response);
                    $data = json_decode($response, TRUE);
                    $message = $data['error']['message'];
                    $timestamp = $data['timestamp'];
                    $requestId = $data['request_id'];
                    $transactionId = $data['transaction_id'];
                    $response = [
                        "request_id" => $requestId ,
                        "transaction_id"=> $transactionId,
                        "status" => 1,
                        "message" => $message,
                        "data" => null,
                        "Timestamp" => $timestamp
                    ];
                    Log::channel('daily')->info("Error Responce :" .json_encode($response));
                    // Store Data In DB in a spearate table Aadhaar Request OTP Transction Agaisnt UserID  Store Aadhaar Number \ 

                    // Store Data In DB in a spearate table Aadhaar Request OTP Transction Agaisnt UserID  Store Aadhaar Number \

                }
            }
            curl_close($curl);
        }
        while(false);
        }catch(\Exception $e)
            {
                $response = [
                    'status' => 3,
                    'message' => "Network Error ! Please try again",
                    'data'    => null,
                ];
                Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
            }
            finally{
                Log::channel('daily')->info("API Response :". json_encode($response));
                Log::channel('daily')->info("********  Send OTP Service End ***************");
                return response()->json($response, 200);
            }

    } 

    public function ValidateAadhaarOTP(Request $request)
    {
        try
        {
                Log::channel('daily')->info("********  Velidate Aadhaar OTP Service Called ***************");
                $response = '';
                $error_message = 'FAILED TO PERFORM THE OPERATION. EXCEPTIONAL ERROR OCCURRED. PLEASE TRY AGAIN. IF PROBLEM PERSIST, PLEASE CONTACT ADMINISTRATOR.';
                $otp = $request->otp;
                $XTransactionID = $request->XTransactionID;
                $user_id = $request->user_id;

                $inputparam = [
                    "otp"=> $otp,
                    "include_xml" => true,
                    "share_code"=> "1001",
                    "user_id" => $user_id 
                ];

                Log::channel('daily')->info("Input Parameter :" . json_encode($inputparam));
                $jsonData = json_encode($inputparam);
                $curl = curl_init();

                curl_setopt_array($curl, array(
                CURLOPT_URL => 'https://api.gridlines.io/aadhaar-api/boson/submit-otp',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS =>$jsonData,
                CURLOPT_HTTPHEADER => array(
                    'Accept: application/json',
                    'Content-Type: application/json',
                    'X-API-Key: 0ZU5MIiP9neGxEhpxLZCpBrmDk087jw0',
                    'X-Auth-Type: API-Key',
                    'X-Transaction-ID: '.$XTransactionID
                ),
                ));

            $response = curl_exec($curl);
            
            if ($response === false) {
                // Handle cURL error, including "URL not found"
                $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
                $error = curl_error($curl);
                Log::channel('daily')->info("Status Code :" . "API Not Found/Server Not Found: httpCode " . $httpCode);

                $response = [
                    "status" => 1,
                    "message" => $error_message,
                    "data" => [],
                    "Timestamp" => time(),
                ];

                // Log the error, return a custom error response, or take appropriate action.
            } else {
                // Check the HTTP status code of the response
                $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

                // Check if the response is in HTML format (e.g., text/html)
                $contentType = curl_getinfo($curl, CURLINFO_CONTENT_TYPE);

                if ($httpCode === 404) {
                    Log::channel('daily')->info("Status Code :" . "API Not Found/Server Not Found: httpCode " . $httpCode);

                    $response = [
                        "status" => 1,
                        "message" => $error_message,
                        "data" => [],
                        "Timestamp" => time(),
                    ];
                    // Handle "URL not found" error
                    // Log the error, return a custom error response, or take appropriate action.
                } elseif (strpos($contentType, 'text/html') !== false) {
                    // Handle HTML error response
                    // You can parse or display the HTML error page as needed
                    Log::channel('daily')->info("Status Code :" . "API Not Found/Server Not Found");

                    $response = [
                        "status" => 1,
                        "message" => $error_message,
                        "data" => [],
                        "Timestamp" => time(),
                    ];
                } elseif ($httpCode === 200) {
                    Log::channel('daily')->info("Service Response :" . $response);
                    $data = json_decode($response, TRUE);
                    if ($data['status'] == 200) {
                        $requestId = $data['request_id'];
                        $transactionId = $data['transaction_id'];
                        $status = $data['status'];
                        $message = $data['data']['message'];
                        // $name = $data['data']['aadhaar_data']['name'];
                        // $photo_base64 = $data['data']['aadhaar_data']['photo_base64'];
                        $timestamp = $data['timestamp'];
                        $path = $data['path'];

                        // $date_of_birth = $data['data']['aadhaar_data']['date_of_birth'];
                        // $gender = $data['data']['aadhaar_data']['gender'];
                        // $mobile = $data['data']['aadhaar_data']['mobile'];
                        // $care_of = $data['data']['aadhaar_data']['care_of'];
                        // $district = $data['data']['aadhaar_data']['district'];
                        // $sub_district = $data['data']['aadhaar_data']['sub_district'];
                        // $post_office_name = $data['data']['aadhaar_data']['post_office_name'];
                        // $state = $data['data']['aadhaar_data']['state'];
                        // $pincode = $data['data']['aadhaar_data']['pincode'];
                        // $country = $data['data']['aadhaar_data']['country'];
                        // $vtc_name = $data['data']['aadhaar_data']['vtc_name']; 

                        if (isset($data['data']['aadhaar_data']['name'])) {
                            $name = $data['data']['aadhaar_data']['name']; 
                        }
                        else
                        {
                            $name = '';
                        }

                        if (isset($data['data']['aadhaar_data']['photo_base64'])) {
                            $photo_base64 = $data['data']['aadhaar_data']['photo_base64']; 
                        }
                        else
                        {
                            $photo_base64 = '';
                        }

                        if (isset($data['data']['aadhaar_data']['date_of_birth'])) {
                            $date_of_birth = $data['data']['aadhaar_data']['date_of_birth'];
                        }
                        else
                        {
                            $date_of_birth = '';
                        }
                        if (isset($data['data']['aadhaar_data']['gender'])) {
                            $gender = $data['data']['aadhaar_data']['gender']; 
                        }
                        else
                        {
                            $gender = '';
                        }

                        if (isset($data['data']['aadhaar_data']['mobile'])) {
                            $mobile = $data['data']['aadhaar_data']['mobile'];
                        }
                        else
                        {
                            $mobile = '';
                        }
                        if (isset($data['data']['aadhaar_data']['care_of'])) {
                            $care_of = $data['data']['aadhaar_data']['care_of']; 
                        }
                        else
                        {
                            $care_of = '';
                        }

                        if (isset($data['data']['aadhaar_data']['district'])) {
                            $district = $data['data']['aadhaar_data']['district'];
                        }
                        else
                        {
                            $district = '';
                        }
                        if (isset($data['data']['aadhaar_data']['sub_district'])) {
                            $sub_district = $data['data']['aadhaar_data']['sub_district']; 
                        }
                        else
                        {
                            $sub_district = '';
                        }

                        if (isset($data['data']['aadhaar_data']['state'])) {
                            $state = $data['data']['aadhaar_data']['state'];
                        }
                        else
                        {
                            $state = '';
                        }
                        if (isset($data['data']['aadhaar_data']['post_office_name'])) {
                            $post_office_name = $data['data']['aadhaar_data']['post_office_name']; 
                        }
                        else
                        {
                            $post_office_name = '';
                        }

                        if (isset($data['data']['aadhaar_data']['pincode'])) {
                            $pincode = $data['data']['aadhaar_data']['pincode']; 
                        }
                        else
                        {
                            $pincode = '';
                        }

                        if (isset($data['data']['aadhaar_data']['country'])) {
                            $country = $data['data']['aadhaar_data']['country']; 
                        }
                        else
                        {
                            $country = '';
                        }

                        if (isset($data['data']['aadhaar_data']['vtc_name'])) {
                            $vtc_name = $data['data']['aadhaar_data']['vtc_name']; 
                        }
                        else
                        {
                            $vtc_name = '';
                        }

                        if (isset($data['data']['aadhaar_data']['house'])) {
                            $house = $data['data']['aadhaar_data']['house']; 
                        }
                        else
                        {
                            $house = '';
                        }

                        if (isset($data['data']['aadhaar_data']['street'])) {
                            $street = $data['data']['aadhaar_data']['street']; 
                        }
                        else
                        {
                            $street = '';
                        }

                        // Initialize an array to store address components
                        $addressComponents = [];

                        // Add non-empty address components to the array
                        if (!empty($house)) {
                            $addressComponents[] = "House No. " . $house;
                        }
                        if (!empty($street)) {
                            $addressComponents[] = "Street: " . $street;
                        }
                        if (!empty($district)) {
                            $addressComponents[] = "District: " . $district;
                        }
                        if (!empty($sub_district)) {
                            $addressComponents[] = "Sub-District: " . $sub_district;
                        }
                        if (!empty($post_office_name)) {
                            $addressComponents[] = "P.O. " . $post_office_name;
                        }
                        if (!empty($state)) {
                            $addressComponents[] = "State: " . $state;
                        }
                        if (!empty($country)) {
                            $addressComponents[] = "Country: " . $country;
                        }
                        if (!empty($pincode)) {
                            $addressComponents[] = "Pin: " . $pincode;
                        }

                        // Concatenate address components with a comma and space
                        $address = implode(', ', $addressComponents);

                        // $address = $house .", ". $street .", District: ". $district .", Sub-District: ". $sub_district . ", P.O. " . $post_office_name . ", State: ". $state. ", Country: ". $country. ", Pin: ". $pincode;

                        // Store Data In DB in a spearate table Aadhaar Request OTP Transction Agaisnt UserID  Store Aadhaar Number \ 
                        $SetValidateAadhaarOTPInfo = $this->AadhaarMapper->SetValidateAadhaarOTPInfo($user_id,$requestId,$transactionId,$status,
                        $message,$name,$timestamp,$path);
                        Log::channel('daily')->info("DB Response::".json_encode($SetValidateAadhaarOTPInfo));
                        // Store Data In DB in a spearate table Aadhaar Request OTP Transction Agaisnt UserID  Store Aadhaar Number \
                        if($SetValidateAadhaarOTPInfo != null)
                        {
                            if($SetValidateAadhaarOTPInfo[0]->ErrorCode == 0)
                            {
                                $response = [
                                    "status" => 0,
                                    "request_id" => $requestId,
                                    "transaction_id"=> $transactionId ,
                                    "message" => "Your Profile Valided Successfully",
                                    "data" => [
                                        "code" => "1001",
                                        "name"=>$name,
                                        "photo_base64"=>$photo_base64,
                                        "transaction_id"=> $transactionId,
                                        "date_of_birth"=>$date_of_birth,
                                        "gender"=> $gender,
                                        "mobile"=>$mobile,
                                        "care_of"=> $care_of,
                                        "district"=>$district,
                                        "sub_district"=> $sub_district,
                                        "post_office_name"=>$post_office_name,
                                        "state"=> $state,
                                        "pincode"=>$pincode,
                                        "country"=> $country,
                                        "vtc_name"=> $vtc_name,
                                        "house"=> $house,
                                        "street"=> $street,
                                        "address"=> $address
                                    ],
                                    
                                    "Timestamp" => $timestamp,
                                    "path"=> $data['path']
                                ];
                            }
                            else
                            {
                                $response = [
                                    "status" => 1,
                                    "message" => "Failed to save in DB!",
                                    "data" => [],
                                    "Timestamp" => time(),
                                ];
                            }
                        }
                        else
                        {
                            $response = [
                                "status" => 1,
                                "message" => "No Record Found!",
                                "data" => [],
                                "Timestamp" => time(),
                            ];
                        } 
                    } 
                } else {
                    Log::channel('daily')->info("Status Code :" . $httpCode);
                    Log::channel('daily')->info("Aadhar response :" . $response);
                    $data = json_decode($response, TRUE);
                    $message = $data['error']['message'];
                    $timestamp = $data['timestamp'];
                    $requestId = $data['request_id'];
                    $transactionId = $data['transaction_id'];
                    $response = [
                        "request_id" => $requestId ,
                        "transaction_id"=> $transactionId,
                        "status" => 1,
                        "message" => $message,
                        "data" => null,
                        "Timestamp" => $timestamp
                    ];
                    Log::channel('daily')->info("Error Responce :" .json_encode($response));
                    // Store Data In DB in a spearate table Aadhaar Request OTP Transction Agaisnt UserID  Store Aadhaar Number \ 

                    // Store Data In DB in a spearate table Aadhaar Request OTP Transction Agaisnt UserID  Store Aadhaar Number \

                }
            }

            curl_close($curl);
    
        }catch(\Exception $e)
        {
            $response = [
                'status' => 3,
                'message' => "Network Error ! Please try again",
                'data'    => null,
            ];
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
        }
        finally{
            Log::channel('daily')->info("API Response :". json_encode($response));
            Log::channel('daily')->info("********  Velidate Aadhaar OTP Service Called ***************");
            // $response = [
            //                         "status" => 0,
            //                         "request_id" => $requestId,
            //                         "transaction_id"=> $transactionId ,
            //                         "message" => "Your Profile Valided Successfully",
            //                         "data" => [
            //                             "code" => "1001",
            //                             "name"=>"Indranil sarmacharya",
            //                             "photo_base64"=>null,
            //                             "transaction_id"=> 12345678,
            //                             "date_of_birth"=>1929-10-12,
            //                             "gender"=> "Male",
            //                             "mobile"=>79805444903,
            //                             "care_of"=> "Sakti pada sarmacharya",
            //                             "district"=>"Kolkata",
            //                             "sub_district"=>  null,
            //                             "post_office_name"=>"Baghajatin",
            //                             "state"=> "West Bengal",
            //                             "pincode"=>700086,
            //                             "country"=> "India",
            //                             "vtc_name"=> null,
            //                             "house"=> null,
            //                             "street"=> "Baghajatin",
            //                             "address"=> "E/19"
            //                         ],
            //                         "Timestamp" => $timestamp,
            //                         "path"=> null
            //                     ];
            return response()->json($response, 200);
        }
    }

    public function ValidateAadhaarOTP_V1(Request $request)
    {
        try
        {
                Log::channel('daily')->info("********  Velidate Aadhaar OTP Service Called ***************");
                $response = '';
                $photo_base64 = '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",
            "xml_base64": "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';
               
            $response = [
                    "status" => 0,
                    "request_id" => "91cdcb4e-966d-4ed0-9e07-801ad77bb8e2",
                    "transaction_id"=> "4326d172-2736-4958-9770-fb6780b3db1e" ,
                    "message" => "Your Profile Valided Successfully",
                    "data" => [
                        "code" => "1002",
                        "name"=> "Indranil Sarmacharya",
                        "photo_base64"=>$photo_base64,
                        "transaction_id"=> "4326d172-2736-4958-9770-fb6780b3db1e",
                        "date_of_birth"=>"1979-10-26",
                        "gender"=> "MALE",
                        "mobile"=> "c10f2d97dc5fa967ae5e954da84d165d333bdcdbcf29dc3c9ebe2fb4c41a2094",
                        "care_of"=> "C/O: Saktipada Sarmacharya",
                        "district"=>"Kolkata",
                        "sub_district"=> "Kolkata",
                        "post_office_name"=>"Baghajatin",
                        "state"=> "West Bengal",
                        "pincode"=>"700086",
                        "country"=> "India",
                        "vtc_name"=> "Baghajatin",
                        "house"=> "E/19",
                        "street"=> "BAGHAJATIN",
                        "address"=> "House No. E/19, Street: BAGHAJATIN, District: Kolkata,Sub-District: Kolkata, P.O. Baghajatin, State: West Bengal, Country: India, Pin: 700086",
                    ],
                    "Timestamp" => "1719243782377",
                    "path"=> "/aadhaar-api/boson/submit-otp"
                ];
            
                Log::channel('daily')->info("Error Responce :" .json_encode($response));
                    // Store Data In DB in a spearate table Aadhaar Request OTP Transction Agaisnt UserID  Store Aadhaar Number \ 

                    // Store Data In DB in a spearate table Aadhaar Request OTP Transction Agaisnt UserID  Store Aadhaar Number \
        }catch(\Exception $e)
        {
            $response = [
                'status' => 3,
                'message' => "Network Error ! Please try again",
                'data'    => null,
            ];
            Log::channel('daily')->error("Exception::" . $e->getMessage() . "\nFile::" . $e->getFile() . "\nLine::" . $e->getLine());
        }
        finally{
            Log::channel('daily')->info("API Response :". json_encode($response));
            Log::channel('daily')->info("********  Velidate Aadhaar OTP Service Called ***************");
            
            return response()->json($response, 200);
        }
    }
}
