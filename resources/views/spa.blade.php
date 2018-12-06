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
        <script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
        <!-- Ad numba 1 -->
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-8094080338040647"
             data-ad-slot="7061670015"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>
        (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
      </div>
      <script src="js/manifest.js"></script>
      <script src="js/vendor.js"></script>
      <script src="js/app.js"></script>
    </body>
</html>
