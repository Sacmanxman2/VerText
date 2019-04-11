@extends('layouts.default')
@section('content')
<div class="content">
  <p>
    Looking to memorize some verbatim text? One of the best methods for memorizing anything is to practice recalling it, instead of just repeating it. This app helps you do that by showing you just the first letter of each word. That narrows the options and gives you some structure for your brain to try and remember, without just giving you the answers. Simply copy and paste some text in the box below!
  </p>
  <p>
    Check back if you're interested in future features, which will include things like:
    <ul>
      <li>Saving your text blurbs</li>
      <li>A spaced-repetition-system style utility to ensure you ALWAYS remember what you're trying to remember</li>
      <li>More tools to help you memorize, like fill in the blanks and chunking (for longer bits of text)</li>
      <li>Track your progress and view stats</li>
      <li>Easily post updates to social media about what you've been learning</li>
    </ul>
  </p>
</div>
<div id="miniapp"></div>
@stop

@section('bottomscripts')
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

<script src="js/manifest.js"></script>
<script src="js/vendor.js"></script>
<script src="js/miniapp.js"></script>

@stop
