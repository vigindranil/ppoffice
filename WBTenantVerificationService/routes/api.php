<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserLoginController;
use App\Http\Controllers\UserDashboardController;
use  App\Http\Controllers\AadhaarVerificationProcessController;
use  App\Http\Controllers\ApplicationController;
use  App\Http\Controllers\AdminLoginController;
use  App\Http\Controllers\MasterController;
use  App\Http\Controllers\AdminDashboardFuncController;
use  App\Http\Controllers\IBDashboardController;

Route::post('/UserLoginSendOTP', [
    UserLoginController::class, 'UserLoginSendOTP'
]);
Route::post('/UserLoginValidateOTP', [
    UserLoginController::class, 'UserLoginValidateOTP'
]);
Route::post('/GetUserDashboardCounts', [
    UserDashboardController::class, 'GetUserDashboardCounts'
]);
Route::post('/SendAadharOTP', [
    AadhaarVerificationProcessController::class, 'SendAadhaarOTP'
]);
Route::post('/ValidateAadharOTP', [
    AadhaarVerificationProcessController::class, 'ValidateAadhaarOTP'
]);
Route::post('/SaveRentApplicationDetailsV5', [
    ApplicationController::class, 'SaveRentApplicationDetailsV5'
]);
Route::post('/GetAllDocumentTypes', [
    MasterController::class, 'GetAllDocumentTypes'
]);
// ************************Admin********************************
Route::post('/AdminLoginSendOTP', [
    AdminLoginController::class, 'AdminLoginSendOTP'
]);
Route::post('/AdminLoginValidateOTP', [
    AdminLoginController::class, 'AdminLoginValidateOTP'
]);
Route::post('/GetAdminDashboardCounts', [
    AdminDashboardFuncController::class, 'GetAdminDashboardCounts'
]);
Route::post('/GetAuthorityApplicationDetailsByStatusID', [
    AdminDashboardFuncController::class, 'GetAuthorityApplicationDetailsByStatusID'
]);
Route::post('/GetAllDistrict', [
    MasterController::class, 'GetAllDistrict'
]);
Route::post('/GetAllPSByDist', [
    MasterController::class, 'GetAllPSByDist'
]);
Route::post('/GetTenantApplicationDetailsByUserID', [
    UserDashboardController::class, 'GetTenantApplicationDetailsByUserID'
]);
Route::post('/GetTenantAssignedApplicationDetails', [
    UserDashboardController::class, 'GetTenantAssignedApplicationDetails'
]);
Route::post('/GetApplicationDetailsByApplicationID', [
    UserDashboardController::class, 'GetApplicationDetailsByApplicationID'
]);
Route::post('/GetAllStates', [
    MasterController::class, 'GetAllStates'
]);
Route::post('/GetRentApplicationsInfoForUserByStatusID', [
    UserDashboardController::class, 'GetRentApplicationsInfoForUserByStatusID'
]);
Route::post('/SaveApprovalStatusUpdate', [
    AdminDashboardFuncController::class, 'SaveApprovalStatusUpdate'
]);
Route::post('/GetIBApplicationDetailsByStatusID', [
    IBDashboardController::class, 'GetIBApplicationDetailsByStatusID'
]);










