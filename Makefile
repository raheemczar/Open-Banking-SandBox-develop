.PHONY: all run test clean start

VERSION=$(shell jq -r .version developer-portal-ui/package.json)
ARC42_SRC = $(shell find docs/arc42/src)
PLANTUML_SRC = $(shell find docs/arc42/diagrams -type f -name '*.puml')
DEPENDENCIES = jq npm plantuml asciidoctor docker-compose mvn docker

build-services: build-java-services build-ui-services build-arc-42  ## Build all services

## Install section ##
install:   ##Install developer tools

ifeq ($(shell uname),Darwin)
	make install-for-MacOS
else ifeq ($(shell uname),Linux)
	make install-for-Linux
else
	@echo "Doesn't support your OS"
endif

# Install developer tools for Linux
install-for-Linux:
	sudo apt-get install jq
	sudo apt-get install plantuml
	sudo apt-get install -y asciidoctor
	sudo apt-get install -y jsonlint yamllint libxml2-utils

# Install developer tools for MacOS
install-for-MacOS:
	curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install | ruby
	brew install jq
	brew install plantuml
	brew install asciidoctor
	brew install jsonlint yamllint

# Lint section

lint-all: lint-dockerfiles lint-tpp-ui lint-oba-ui  lint-tpp-rest-server lint-online-banking lint-docker-compose lint-pmd-cpd-report #lint all services

lint-dockerfiles:
	docker run --rm -i hadolint/hadolint < tpp-ui/Dockerfile
	docker run --rm -i hadolint/hadolint < oba-ui/Dockerfile
	docker run --rm -i hadolint/hadolint < developer-portal-ui/Dockerfile
	docker run --rm -i hadolint/hadolint < tpp-app/tpp-rest-server/Dockerfile
	docker run --rm -i hadolint/hadolint < online-banking/online-banking-app/Dockerfile

lint-tpp-ui:
	find tpp-ui -type f -name "*.json" -not -path "tpp-ui/node_modules/*" -exec jsonlint-php -q {} \; # lint all json
	find tpp-ui -type f \( -name "*.yml" -o -name "*.yaml" \) -exec yamllint -d "{extends: relaxed, rules: {line-length: {max: 160}}}" {} \;
	find tpp-ui -type f \( -iname "*.xml" ! -iname pom.xml \) -exec xmllint --noout {} \;
	#cd tpp-ui && npm install
	#cd tpp-ui && npm run lint
	#cd tpp-ui && npm run prettier-check

lint-oba-ui:
	cd oba-ui
	find oba-ui -type f -name "*.json" -not -path "oba-ui/node_modules/*" -exec jsonlint-php -q {} \; # lint all json
	find oba-ui -type f \( -name "*.yml" -o -name "*.yaml" \) -exec yamllint -d "{extends: relaxed, rules: {line-length: {max: 160}}}" {} \;
	find oba-ui -type f \( -iname "*.xml" ! -iname pom.xml \) -exec xmllint --noout {} \;
	#cd oba-ui && npm install
	#cd oba-ui && npm run lint
	#cd oba-ui && npm run prettier-check

lint-developer-portal-ui:
	find developer-portal-ui -type f -name "*.json" -not -path "developer-portal-ui/node_modules/*" -exec jsonlint-php -q {} \; # lint all json
	find developer-portal-ui -type f \( -name "*.yml" -o -name "*.yaml" \) -exec yamllint -d "{extends: relaxed, rules: {line-length: {max: 160}}}" {} \;
	find developer-portal-ui -type f \( -iname "*.xml" ! -iname pom.xml \) -exec xmllint --noout {} \;
	cd developer-portal-ui && npm install
	cd developer-portal-ui && npm run lint
	cd developer-portal-ui && npm run prettier-check

lint-tpp-rest-server:
	find tpp-app -type f -name "*.json" -exec jsonlint-php -q {} \; # lint all json
	find tpp-app -type f \( -name "*.yml" -o -name "*.yaml" \) -exec yamllint -d "{extends: relaxed, rules: {line-length: {max: 160}}}" {} \;
	find tpp-app -type f \( -iname "*.xml" ! -iname pom.xml \) -exec xmllint --noout {} \;

lint-online-banking:
	find online-banking -type f -name "*.json" -exec jsonlint-php -q {} \; # lint all json
	find online-banking -type f \( -name "*.yml" -o -name "*.yaml" \) -exec yamllint -d "{extends: relaxed, rules: {line-length: {max: 160}}}" {} \;
	find online-banking -type f \( -iname "*.xml" ! -iname pom.xml \) -exec xmllint --noout {} \;

lint-docker-compose:
	docker-compose -f docker-compose.yml config  -q
	mvn validate
	yamllint -d "{extends: relaxed, rules: {line-length: {max: 160}}}" bank-profile/*.yml

lint-pmd-cpd-report:
	mvn --settings scripts/mvn-release-settings.xml -Dmaven.test.skip=true package pmd:pmd pmd:cpd
## Run section ##
run:  ## Run services from Docker Hub without building:
	docker-compose pull && docker-compose up

start: ## Run everything with docker-compose build dockerimages without building applications
	docker-compose -f docker-compose.yml -f docker-compose-build-template.yml up

all: lint-all build-ui-services build-java-services unit-tests-all-frontend unit-tests-backend ## Run everything with docker-compose after building
	docker-compose -f docker-compose.yml -f docker-compose-build-template.yml up

## Build section ##
build-java-services: ## Build java services
	mvn --settings scripts/mvn-release-settings.xml -DskipTests clean package -Dci.build.number=Build\:${CI_PIPELINE_ID}

build-ui-services: npm-install-tpp-ui npm-install-oba-ui ## Build ui services

npm-install-tpp-ui: tpp-ui/package.json tpp-ui/package-lock.json ## Install TPP-UI NPM dependencies
	cd tpp-ui && npm install --legacy-peer-deps && npm run build

npm-install-oba-ui: oba-ui/package.json oba-ui/package-lock.json ## Install OBA-UI NPM dependencies
	cd oba-ui && npm install --legacy-peer-deps && npm run build

npm-install-developer-portal-ui: developer-portal-ui/package.json developer-portal-ui/package-lock.json ## Install DEV-PORTAL-UI NPM dependencies
	cd developer-portal-ui && npm install --legacy-peer-deps && npm run build

## Unit tests section
unit-tests-all-frontend: unit-tests-oba-ui unit-tests-tpp-ui

unit-tests-oba-ui:
	cd oba-ui && npm install --legacy-peer-deps
unit-tests-tpp-ui:
	cd tpp-ui && npm install --legacy-peer-deps
unit-tests-developer-portal-ui:
	cd developer-portal-ui && npm install --legacy-peer-deps

unit-tests-backend:
	mvn --settings scripts/mvn-release-settings.xml -DskipITs --fail-at-end clean install

## Build arc42
build-arc-42: arc42/images/generated $(ARC42_SRC) docs/arc42/xs2a-sandbox-arc42.adoc developer-portal-ui/package.json ## Generate arc42 html documentation
	cd docs/arc42 && asciidoctor -a acc-version=$(VERSION) xs2a-sandbox-arc42.adoc

arc42/images/generated: $(PLANTUML_SRC) ## Generate images from .puml files
# Note: Because plantuml doesnt update the images/generated timestamp we need to touch it afterwards
	cd docs/arc42 && mkdir -p images/generated && plantuml -o "../images/generated" diagrams/*.puml && touch images/generated

## Clean section ##
clean: clean-java-services clean-ui-services ## Clean everything

clean-java-services: ## Clean services temp files
	mvn clean

clean-ui-services: ## Clean UI temp files
	cd tpp-ui && rm -rf dist
	cd oba-ui && rm -rf dist
	cd developer-portal-ui && rm -rf dist

## Check section ##
check: ## Check required dependencies ("@:" hides nothing to be done for...)
	@: $(foreach exec,$(DEPENDENCIES),\
          $(if $(shell command -v $(exec) 2> /dev/null ),$(info (OK) $(exec) is installed),$(info (FAIL) $(exec) is missing)))

## Help section ##
help: ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n\nTargets:\n"} /^[a-zA-Z0-9_\-\/\. ]+:.*?##/ { printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
