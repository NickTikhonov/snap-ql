# Variables
UNAME_S := $(shell uname -s)
ARCH := $(shell uname -m)
BIN_DIR := /usr/local/bin
APP_NAME := snap-ql

# Platform-specific paths
ifeq ($(UNAME_S),Darwin)
	ifeq ($(ARCH),arm64)
		BUILT_APP := dist/mac-arm64/Snap QL.app/Contents/MacOS/Snap QL
	else
		BUILT_APP := dist/mac/Snap QL.app/Contents/MacOS/Snap QL
	endif
else ifeq ($(UNAME_S),Linux)
	BUILT_APP := dist/linux-unpacked/snap-ql
else
	BUILT_APP := dist/win-unpacked/Snap QL.exe
endif

.PHONY: help install dev build clean lint format typecheck dist-mac dist-win dist-linux dist-all link unlink quick-check ci install-global

# Default target
help:
	@echo "SnapQL - AI-powered PostgreSQL database explorer"
	@echo ""
	@echo "Available targets:"
	@echo "  install     - Install dependencies"
	@echo "  dev         - Start development server with hot reload"
	@echo "  build       - Build the application (with type checking)"
	@echo "  lint        - Run ESLint"
	@echo "  format      - Format code with Prettier"
	@echo "  typecheck   - Run TypeScript type checking"
	@echo "  clean       - Clean build artifacts"
	@echo "  dist-mac    - Build macOS distribution"
	@echo "  dist-win    - Build Windows distribution"
	@echo "  dist-linux  - Build Linux distribution"
	@echo "  dist-all    - Build all platform distributions"
	@echo "  link        - Create symlink to PATH (requires built app)"
	@echo "  unlink      - Remove symlink from PATH"
	@echo "  install-global - Build and install symlink in one step"

install:
	npm install

dev:
	npm run dev

build:
	npm run build

lint:
	npm run lint

format:
	npm run format

typecheck:
	npm run typecheck

clean:
	rm -rf dist/ out/ build/

dist-mac:
	npm run build:mac

dist-win:
	npm run build:win

dist-linux:
	npm run build:linux

dist-all: dist-mac dist-win dist-linux

# Quick development workflow
quick-check: lint typecheck
	@echo "Code quality checks passed!"

# Full build pipeline
ci: install quick-check build
	@echo "CI pipeline completed successfully!"

# Symlink management
link:
	@if [ ! -f "$(BUILT_APP)" ]; then \
		echo "Error: Built application not found at $(BUILT_APP)"; \
		echo "Run 'make dist-mac' (or appropriate platform target) first"; \
		exit 1; \
	fi
	@echo "Creating wrapper script $(BIN_DIR)/$(APP_NAME)"
	@echo '#!/bin/bash' | sudo tee "$(BIN_DIR)/$(APP_NAME)" > /dev/null
	@echo 'exec "$(PWD)/$(BUILT_APP)" "$$@"' | sudo tee -a "$(BIN_DIR)/$(APP_NAME)" > /dev/null
	@sudo chmod +x "$(BIN_DIR)/$(APP_NAME)"
	@echo "✅ SnapQL is now available as '$(APP_NAME)' in your PATH"

unlink:
	@if [ -f "$(BIN_DIR)/$(APP_NAME)" ]; then \
		echo "Removing wrapper script $(BIN_DIR)/$(APP_NAME)"; \
		sudo rm "$(BIN_DIR)/$(APP_NAME)"; \
		echo "✅ SnapQL wrapper script removed from PATH"; \
	else \
		echo "No wrapper script found at $(BIN_DIR)/$(APP_NAME)"; \
	fi

# Platform-aware global install
install-global:
ifeq ($(UNAME_S),Darwin)
	$(MAKE) dist-mac link
else ifeq ($(UNAME_S),Linux)
	$(MAKE) dist-linux link
else
	$(MAKE) dist-win link
endif
	@echo "✅ SnapQL built and installed globally!"