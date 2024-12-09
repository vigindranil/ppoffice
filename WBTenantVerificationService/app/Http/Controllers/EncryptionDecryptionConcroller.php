<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class EncryptionDecryptionConcroller extends Controller
{
    //
    // kOsgjwXn7jGloRlDipftYs1GkbuMMSllXfqr6iDSRpw=
     public static function encryptHEXFormat($data, $key)
        {
        return bin2hex(openssl_encrypt($data, 'aes-256-ecb', $key, OPENSSL_RAW_DATA));
                    // return base64_encode(openssl_encrypt($data, 'aes-256-ecb', $key, OPENSSL_RAW_DATA));
        }
        public static function decryptHEXFormat($data, $key)
        {
            return trim(openssl_decrypt(hex2bin($data), 'aes-256-ecb', $key, OPENSSL_RAW_DATA));
        }

  
      public static function encrypt($plainText,$key)
        {
            $instance = new self();

            $key = $instance->hextobin(md5($key));
            $initVector = pack("C*", 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f);
            $openMode = openssl_encrypt($plainText, 'AES-128-CBC', $key, OPENSSL_RAW_DATA, $initVector);
            $encryptedText = bin2hex($openMode);
            return $encryptedText;
        }
        public static function decrypt($encryptedText,$key)
        {
            $instance = new self();

            $key = $instance->hextobin(md5($key));
            $initVector = pack("C*", 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f);
            $encryptedText = $instance->hextobin($encryptedText);
            $decryptedText = openssl_decrypt($encryptedText, 'AES-128-CBC', $key, OPENSSL_RAW_DATA, $initVector);
            return $decryptedText;
        }
        public   function pkcs5_pad ($plainText, $blockSize)
        {
            $pad = $blockSize - (strlen($plainText) % $blockSize);
            return $plainText . str_repeat(chr($pad), $pad);
        }
       public  function hextobin($hexString) 
    	 {
        	$length = strlen($hexString); 
        	$binString="";   
        	$count=0; 
        	while($count<$length) 
        	{       
        	    $subString =substr($hexString,$count,2);           
        	    $packedString = pack("H*",$subString); 
        	    if ($count==0)
		    {
				$binString=$packedString;
		    } 
        	    
		    else 
		    {
				$binString.=$packedString;
		    } 
        	    
		    $count+=2; 
        	} 
  	        return $binString; 
    	  } 

}
