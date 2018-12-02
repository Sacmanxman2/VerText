<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta property="og:title" content="Jared Sackett's website of silly cats">
        <meta property="og:description" content="A silly website with cats and a dumb javascript thing. What were you expecting?">
        <link rel="stylesheet" href="{{ asset('/css/app.css') }}">
        <title>Jared Sackett's Website of Silly Cats</title>
    </head>
    <body>
        <div id="app">
        <div class="hero is-dark">
            <div class="hero-body container has-text-centered">
                <h1 class="title">Testing</h1>
                <p>Does this work?</p>
                    <app></app>
                <br>
                <div>
                    <h2 class="subtitle">Hey look, a funny cat thing!</h2>
                    <meme></meme>
                </div>
            </div>
        </div>
        </div>
        <script src="../js/app.js"></script>
    </body>
</html>
