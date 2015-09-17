Dir::glob("./js/sparqls/*.spl").each do |path|
  print path
  prefix = "module.exports="
  sufix = ";"
  str = File.read(path)
  str = str.gsub('"', '\"').split("\n").map{|s| '"' + s + '\n"'}.join("+");
  File.write(path.gsub(".spl", ".js"), prefix + str + sufix)
end
