case ARGV[0]
when 'erubi'
  require 'erubi'
  STDOUT.puts eval(Erubi::Engine.new(STDIN.read).src)
else
  require 'erb'
  STDOUT.puts ERB.new(STDIN.read).result
end