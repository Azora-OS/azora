# Elazar OS Build System
# Advanced C++ Compilation with AI/ML Integration

CXX = g++
CXXFLAGS = -std=c++17 -O3 -march=native -flto -funroll-loops -fomit-frame-pointer \
           -fopenmp -pthread -DNDEBUG -DEIGEN_DONT_PARALLELIZE

# Include paths for dependencies
INCLUDES = -I/usr/include/eigen3 \
           -I/usr/include/boost \
           -I/usr/include/nlohmann \
           -I/usr/local/include

# Library paths
LIBS = -L/usr/local/lib
LDFLAGS = -lboost_system -lboost_thread -lboost_filesystem -pthread -lgomp -lm -lssl -lcrypto

# Source files
SOURCES = elazar-os/usr/bin/elazar-ai.cpp \
          elazar-os/usr/bin/azora-mine.cpp \
          elazar-os/usr/bin/elazar-security.cpp \
          elazar-os/usr/bin/elazar-network.cpp \
          elazar-os/usr/bin/elazar-package.cpp \
          elazar-os/usr/bin/elazar-monitor.cpp

# Object files
OBJECTS = $(SOURCES:.cpp=.o)

# Binary targets
TARGETS = elazar-ai \
          azora-mine \
          elazar-security \
          elazar-network \
          elazar-package \
          elazar-monitor

# Default target
all: dependencies $(TARGETS)

# Install dependencies
dependencies:
	@echo "🔧 Installing Elazar OS Dependencies..."
	@command -v apt-get >/dev/null 2>&1 && { \
		echo "Using apt-get..."; \
		sudo apt-get update; \
		sudo apt-get install -y \
			build-essential \
			g++-9 \
			libboost-all-dev \
			libeigen3-dev \
			nlohmann-json3-dev \
			libssl-dev \
			libcrypto++-dev \
			libgomp1 \
			libomp-dev \
			nvidia-cuda-toolkit \
			nvidia-cuda-dev \
			opencl-headers \
			ocl-icd-opencl-dev \
			libopenblas-dev \
			liblapack-dev \
			libatlas-base-dev \
			python3-dev \
			libffi-dev \
			zlib1g-dev \
			libbz2-dev \
			libreadline-dev \
			libsqlite3-dev \
			liblzma-dev \
			tk-dev \
			libarchive-dev || echo "Some optional dependencies may not be available"; \
	} || { \
		echo "apt-get not found, trying yum..."; \
		command -v yum >/dev/null 2>&1 && { \
			sudo yum install -y \
				gcc-c++ \
				boost-devel \
				eigen3-devel \
				json-devel \
				openssl-devel \
				cryptopp-devel \
				openmp-devel \
				openblas-devel \
				lapack-devel \
				atlas-devel \
				python3-devel \
				libffi-devel \
				zlib-devel \
				bzip2-devel \
				readline-devel \
				sqlite-devel \
				xz-devel \
				tk-devel; \
		} || { \
			echo "Package manager not found. Please install dependencies manually."; \
			exit 1; \
		} \
	}
	@echo "✅ Dependencies installed"

# Compile individual binaries
elazar-ai: elazar-os/usr/bin/elazar-ai.o
	@echo "🔨 Linking elazar-ai..."
	$(CXX) $(CXXFLAGS) $< -o $@ $(LIBS) $(LDFLAGS) -lcudart -lcublas -lcusolver
	@echo "✅ elazar-ai compiled successfully"

azora-mine: elazar-os/usr/bin/azora-mine.o
	@echo "🔨 Linking azora-mine..."
	$(CXX) $(CXXFLAGS) $< -o $@ $(LIBS) $(LDFLAGS) -lcrypto -lssl -lcryptopp
	@echo "✅ azora-mine compiled successfully"

elazar-security: elazar-os/usr/bin/elazar-security.o
	@echo "🔨 Linking elazar-security..."
	$(CXX) $(CXXFLAGS) $< -o $@ $(LIBS) $(LDFLAGS) -lcrypto -lssl -lcryptopp
	@echo "✅ elazar-security compiled successfully"

elazar-network: elazar-os/usr/bin/elazar-network.o
	@echo "🔨 Linking elazar-network..."
	$(CXX) $(CXXFLAGS) $< -o $@ $(LIBS) $(LDFLAGS) -lcrypto -lssl
	@echo "✅ elazar-network compiled successfully"

elazar-monitor: elazar-os/usr/bin/elazar-monitor.o
	@echo "🔨 Linking elazar-monitor..."
	$(CXX) $(CXXFLAGS) $< -o $@ $(LIBS) $(LDFLAGS) -lcrypto -lssl
	@echo "✅ elazar-monitor compiled successfully"

elazar-package: elazar-os/usr/bin/elazar-package.o
	@echo "🔨 Linking elazar-package..."
	$(CXX) $(CXXFLAGS) $< -o $@ $(LIBS) $(LDFLAGS) -lcrypto -lssl -larchive
	@echo "✅ elazar-package compiled successfully"

# Compile object files
%.o: %.cpp
	@echo "⚙️  Compiling $<..."
	$(CXX) $(CXXFLAGS) $(INCLUDES) -c $< -o $@

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -f $(OBJECTS) $(TARGETS)
	@echo "✅ Clean complete"

# Deep clean including dependencies
distclean: clean
	@echo "🧽 Deep cleaning..."
	rm -rf build/
	rm -rf *.log
	@echo "✅ Deep clean complete"

# Install to system
install: all
	@echo "📦 Installing Elazar OS..."
	sudo mkdir -p /opt/elazar-os
	sudo cp -r * /opt/elazar-os/
	sudo chmod +x /opt/elazar-os/usr/bin/*
	sudo chmod +x /opt/elazar-os/sbin/*
	sudo ln -sf /opt/elazar-os/usr/bin/* /usr/local/bin/ 2>/dev/null || true
	sudo ln -sf /opt/elazar-os/sbin/* /usr/local/sbin/ 2>/dev/null || true
	@echo "✅ Elazar OS installed"

# Uninstall from system
uninstall:
	@echo "🗑️  Uninstalling Elazar OS..."
	sudo rm -rf /opt/elazar-os
	sudo find /usr/local/bin -name "elazar-*" -exec rm {} \; 2>/dev/null || true
	sudo find /usr/local/bin -name "azora-*" -exec rm {} \; 2>/dev/null || true
	sudo find /usr/local/sbin -name "elazar-*" -exec rm {} \; 2>/dev/null || true
	@echo "✅ Elazar OS uninstalled"

# Development build with debug symbols
debug: CXXFLAGS = -std=c++17 -g -O0 -Wall -Wextra -pedantic -pthread
debug: clean all

# Performance profiling build
profile: CXXFLAGS = -std=c++17 -O3 -march=native -flto -funroll-loops \
                   -fomit-frame-pointer -fopenmp -pthread -pg
profile: clean all

# GPU-accelerated build (requires CUDA)
gpu: CXXFLAGS += -DCUDA_ENABLED -arch=sm_70
gpu: LIBS += -lcudart -lcublas -lcusolver -lcusparse
gpu: all

# Quantum computing build (simulated)
quantum: CXXFLAGS += -DQUANTUM_ENABLED
quantum: all

# Test build
test: all
	@echo "🧪 Running Elazar OS tests..."
	@./usr/bin/elazar-ai --test || echo "AI test failed"
	@./usr/bin/azora-mine --test || echo "Mining test failed"
	@./usr/bin/elazar-security --test || echo "Security test failed"
	@./usr/bin/elazar-network --test || echo "Network test failed"
	@./usr/bin/elazar-package --test || echo "Package test failed"
	@./usr/bin/elazar-monitor --test || echo "Monitor test failed"
	@echo "✅ Tests completed"

# Benchmark build
benchmark: all
	@echo "📊 Running Elazar OS benchmarks..."
	@time ./usr/bin/elazar-ai --benchmark
	@time ./usr/bin/azora-mine --benchmark
	@time ./usr/bin/elazar-security --benchmark
	@time ./usr/bin/elazar-network --benchmark
	@time ./usr/bin/elazar-package --benchmark
	@time ./usr/bin/elazar-monitor --benchmark
	@echo "✅ Benchmarks completed"

# Help target
help:
	@echo "Elazar OS Build System"
	@echo ""
	@echo "Available targets:"
	@echo "  all          - Build all components (default)"
	@echo "  dependencies - Install build dependencies"
	@echo "  clean        - Remove build artifacts"
	@echo "  distclean    - Deep clean including dependencies"
	@echo "  install      - Install to system (/opt/elazar-os)"
	@echo "  uninstall    - Remove from system"
	@echo "  debug        - Build with debug symbols"
	@echo "  profile      - Build with profiling support"
	@echo "  gpu          - Build with GPU acceleration (CUDA)"
	@echo "  quantum      - Build with quantum computing simulation"
	@echo "  test         - Run test suite"
	@echo "  benchmark    - Run performance benchmarks"
	@echo "  help         - Show this help"
	@echo ""
	@echo "Advanced options:"
	@echo "  CXX          - C++ compiler (default: g++)"
	@echo "  CXXFLAGS     - Compiler flags"
	@echo "  INCLUDES     - Include directories"
	@echo "  LIBS         - Library directories"
	@echo "  LDFLAGS      - Linker flags"

.PHONY: all dependencies clean distclean install uninstall debug profile gpu quantum test benchmark help