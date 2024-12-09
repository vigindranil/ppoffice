<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LogController;
Route::get('/', function () {
    return view('welcome');
});
Route::post('/savelog', [
    LogController::class, 'savelog'
]);
Route::get('/showDailyLog', [
    LogController::class, 'showDailyLog'
]);
Route::get('/deleteDailyLog', [ 
    LogController::class, 'deleteDailyLog'
]);
