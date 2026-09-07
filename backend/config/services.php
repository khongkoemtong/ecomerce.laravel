<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'bakong' => [
        'merchant_id' => env('BAKONG_MERCHANT_ID', 'abaakhppxxx@abaa'),
        'account_number' => env('BAKONG_ACCOUNT_NUMBER', '126090615275613'),
        'acquiring_bank' => env('BAKONG_ACQUIRING_BANK', 'ABA Bank'),
        'merchant_name' => env('BAKONG_MERCHANT_NAME', 'KHONG KOEMTONG'),
        'merchant_city' => env('BAKONG_MERCHANT_CITY', 'Phnom Penh'),
        'api_token' => env('BAKONG_API_TOKEN'),
    ],

    'aba_payway' => [
        'api_url' => env('ABA_PAYWAY_API_URL', 'https://checkout-sandbox.payway.com.kh'),
        'merchant_id' => env('ABA_PAYWAY_MERCHANT_ID', 'ec478203'),
        'api_key' => env('ABA_PAYWAY_API_KEY', 'a05920e47371f5879901f59cb6ee2e9df0a3a76c'),
        'return_url' => env('ABA_PAYWAY_RETURN_URL', 'http://localhost:5173/payment/success'),
        'cancel_url' => env('ABA_PAYWAY_CANCEL_URL', 'http://localhost:5173/bag'),
        'continue_success_url' => env('ABA_PAYWAY_CONTINUE_SUCCESS_URL', 'http://localhost:5173/orders'),
    ],

];
