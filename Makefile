.PHONY: be fe

# Change these variables to match your project structure
BE_DIR = be
FE_DIR = fe

# Define your commands for the be and fe directories
be:
	gnome-terminal -- bash -c "cd $(BE_DIR) && air"
fe:
	gnome-terminal -- bash -c "cd $(FE_DIR) && npm run dev"

be-install:
	cd $(BE_DIR) && go mod tidy
fe-install:
	cd $(FE_DIR) && npm install
install: be-install fe-install
	echo "Installing the project..."
# Add any other targets you need, e.g., build, start, test, etc.
build: be fe
	echo "Building the project..."

start: be fe
	echo "Starting the project..."

test: be fe
	echo "Running tests..."

# Add more targets as needed