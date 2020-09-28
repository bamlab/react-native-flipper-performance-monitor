
Pod::Spec.new do |s|
  s.name         = "RNStartupTrace"
  s.version      = "0.1.0"
  s.summary      = "RNStartupTrace"
  s.description  = <<-DESC
                  RNStartupTrace
                   DESC
  s.homepage     = ""
  s.license      = "MIT"
  s.author             = { "author" => "alexandrem@bam.tech" }
  s.platform     = :ios, "7.0"
  s.source       = { :git => "https://github.com/bamlab/react-native-performance.git", :tag => "master" }
  s.source_files  = "StartupPerformanceTrace/**/*.{h,m}"
  s.requires_arc = true

  s.dependency "React"
  s.dependency "Firebase"

end

  