<!doctype html>
<html>
  <head>
    @include('includes.head')
  </head>
  <body>
    @include('includes.header')
    <div class="container">
      <section class="section">
        @yield('content')
      </section>
    </div>
    @include('includes.footer')
    @yield('bottomscripts')
  </body>
</html>
