<?php
$k='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';
$ch=curl_init('https://api.groq.com/openai/v1/chat/completions');
curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
curl_setopt($ch,CURLOPT_POST,true);
curl_setopt($ch,CURLOPT_POSTFIELDS,'{"model":"llama-3.1-8b-instant","max_tokens":100,"messages":[{"role":"user","content":"test"}]}');
curl_setopt($ch,CURLOPT_HTTPHEADER,['Authorization: Bearer '.$k,'Content-Type: application/json']);
curl_setopt($ch,CURLOPT_TIMEOUT,30);
echo curl_exec($ch) ?: curl_error($ch);
