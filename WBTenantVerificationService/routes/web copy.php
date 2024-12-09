<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::POST('savelog','App\Http\Controllers\LogController@savelog');
Route::get('showDailyLog','App\Http\Controllers\LogController@showDailyLog');
Route::GET('deleteDailyLog','App\Http\Controllers\LogController@deleteDailyLog');
