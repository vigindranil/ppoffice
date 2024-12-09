<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;



class LogController extends Controller
{
    //
    public function showDailyLog(Request $request)
    {
             $today = date("Y-m-d");
            // Define the path to the daily log file
            $logFilePath = storage_path('logs/laravel-' .  $today . '.log');

            // Check if the log file exists
            if (file_exists($logFilePath)) {
                // Read the log file contents
                $logContents = file_get_contents($logFilePath);
      
            } else {
                $logContents = 'Log file not found for today.';
        }
        return view('dailylog', ['logContents' => $logContents]);
    }
    public function savelog(Request $request)
        {
            $LogContent = $request->input('LogContent');
            $jsfilename = $request->input('jsfilename');
            $jsfunctionaname = $request->input('jsfunctionaname');
            $JsError =[
                'LogContent' => $LogContent,
                'jsfilename' => $jsfilename,
                'jsfunctionaname' => $jsfunctionaname 


            ];

            Log::channel('daily')->info("Error Form JS :". json_encode($JsError));

        }
    public function deleteDailyLog()
        {
            try {
                $logDate = now()->format('Y-m-d'); // Get the current date in 'Y-m-d' format
                $logFileName = "laravel-{$logDate}.log"; // The log file name for today
        
                $logFilePath = storage_path("logs/{$logFileName}"); // Construct the full path to the log file
        
                if (File::exists($logFilePath)) {
                    // Check if the log file exists
                    File::delete($logFilePath); // Delete the log file
                    echo "Log Deleted Successfully";
                    exit;
                    return redirect()->back()->with('success', 'Log file deleted successfully.');
                } else {
                    return redirect()->back()->with('error', 'Log file not found.');
                }
            } catch (\Exception $e) {
                return redirect()->back()->with('error', 'An error occurred while deleting the log file.');
            }
        }
        
}
