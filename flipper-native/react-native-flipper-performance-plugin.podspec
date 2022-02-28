require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

folly_compiler_flags = '-DFLIPPER_OSS=1 -DFB_SONARKIT_ENABLED=1 -DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -DFOLLY_HAVE_LIBGFLAGS=0 -DFOLLY_HAVE_LIBJEMALLOC=0 -DFOLLY_HAVE_PREADV=0 -DFOLLY_HAVE_PWRITEV=0 -DFOLLY_HAVE_TFO=0 -DFOLLY_USE_SYMBOLIZER=0'

Pod::Spec.new do |s|
  s.name         = "react-native-flipper-performance-plugin"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "10.0" }
  s.source       = { :git => "https://github.com/bamlab/react-native-performance", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm}"

  s.dependency "React-Core"

  # This subspec is necessary since FBDefines.h is imported as <FBDefines/FBDefines.h>
  # inside SKMacros.h, which is a public header file. Defining this directory as a
  # subspec with header_dir = 'FBDefines' allows this to work, even though it wouldn't
  # generally (you would need to import <FlipperKit/t/FBDefines/FBDefines.h>)
  s.subspec 'FBDefines' do |ss|
    ss.header_dir = 'FBDefines'
    ss.compiler_flags = folly_compiler_flags
    ss.source_files = 'iOS/FBDefines/**/*.h'
    ss.public_header_files = 'iOS/FBDefines/**/*.h'
  end
end
