@extends('app')

@section('content')
<div class="container">
    <h1>Daily Log of API</h1>
    <pre>{{ $logContents }}</pre>
</div>
@endsection
