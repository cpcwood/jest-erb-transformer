engine = ARGV[0]
delimiter = ARGV[1]

case engine
when 'erubi'
  require 'erubi'
  compiled_file_content = eval(Erubi::Engine.new(STDIN.read).src)
  STDOUT.puts "#{delimiter}#{compiled_file_content}#{delimiter}"
else
  require 'erb'
  compiled_file_content = ERB.new(STDIN.read).result
  STDOUT.puts "#{delimiter}#{compiled_file_content}#{delimiter}"
end