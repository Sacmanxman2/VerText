<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ApiController extends Controller
{
  public function pic()
  {
    $output = \Unirest\Request::get('https://api.thecatapi.com/v1/images/search?size=full');

    return $output->raw_body;
  }
}
