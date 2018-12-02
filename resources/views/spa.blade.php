<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta property="og:title" content="Jared Sackett's website of silly cats">
        <meta property="og:description" content="A silly website with cats and a dumb javascript thing. What were you expecting?">
        <link rel="stylesheet" href="{{ asset('/css/app.css') }}">
        <title>{{ env('APP_NAME') }}</title>
    </head>
    <body>
      <div id="app">
      </div>
      <script src="js/manifest.js"></script>
      <script src="js/vendor.js"></script>
      <script src="js/app.js"></script>
    </body>
</html>
