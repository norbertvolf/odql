main -> _ command _ {% function(d) {return d[1]; } %}

command ->  _ "\\dt" _ {% function(d) {return { "action": "LIST", "type" : "EntitySet" }; } %}
         |  _ "\\q" _ {% function(d) {return { "action": "QUIT" }; } %}

# Whitespace
_ -> [\s]:*     {% function(d) {return null; } %}
