<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $headers = array('accept' => 'application/json');
        $query = array(
            'grant_type' => 'password',
            'client_id' => config('services.passport.client_id'),
            'client_secret' => config('services.passport.client_secret'),
            'redirect_uri' => 'http://localhost',
            'username' => $request->username,
            'password' => $request->password
        );

        $response = \Unirest\Request::post(config('services.passport.login_endpoint'), $headers, $query);

        return $response->raw_body;
    }
}
