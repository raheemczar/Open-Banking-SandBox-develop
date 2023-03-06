#!/usr/bin/env bash
# ********************** INFO *********************
# This file is used to override default settings.
# Therefore only the functions that deviate from
# provided defaults may be left here.
# You can use it also in parent directory with the
# name .release-scripts-hook.sh
# *************************************************
set -e


# Hook method to format your release tag
# Parameter $1 - version as text
# Returns tag as text
function format_release_tag {
  echo "$1"
}

# Hook method to format your next snapshot version
# Parameter $1 - version as text
# Returns snapshot version as text
function format_snapshot_version {
  echo "$1-SNAPSHOT"
}

# Hook method to define the remote repository name
# Returns the name of the remote repository as text
function get_remote_repo_name {
  echo "origin"
}

# Hook method to define the develop branch name
# Returns the develop branch name as text
function get_develop_branch_name {
  echo "develop"
}

# Hook method to define the master branch name
# Returns the master branch name as text
function get_master_branch_name {
  echo "master"
}

# Hook method to format the release branch name
# Parameter $1 - version as text
# Returns the formatted release branch name as text
function format_release_branch_name {
  echo "release-$1"
}

# Hook method to format the hotfix branch name
# Parameter $1 - version as text
# Returns the formatted hotfix branch name as text
function format_hotfix_branch_name {
  echo "hotfix-$1"
}

# Hook to build the snapshot modules before release
# You can build and run your tests here to avoid releasing an unstable build
function build_snapshot_modules {
	mvn clean install
	mvn pmd:check
}

# Hook to build the released modules after release
# You can deploy your artifacts here
function build_release_modules {
	mvn clean install
	mvn pmd:check
}

# Should set version numbers in your modules
# Parameter $1 - version as text
function set_modules_version {
  mvn versions:set -DnewVersion=$1
  DOCKER_COMPOSE_BUILD_FILE=docker-compose-build-template.yml
  if [ -f "$DOCKER_COMPOSE_BUILD_FILE" ]; then
   DOCKER_COMPOSE_BUILD_TEMPLATE=$(cat docker-compose-build-template.yml)
  fi
  if [[ $1 == *"SNAPSHOT"* ]]; then
    echo "next release"
    perl -i -pe "s/SANDBOX_VERSION=.*/SANDBOX_VERSION=develop/" .env
    echo "$DOCKER_COMPOSE_BUILD_TEMPLATE" > docker-compose-build-template.yml
    git add docker-compose-build-template.yml
    echo "Update frontend version"
    jq --arg VERSION "$1"  --arg BUILD_ID "null" '.version = $VERSION | .build_number = $BUILD_ID' developer-portal-ui/info.json >> info.json
    mv info.json developer-portal-ui/info.json
    jq --arg VERSION "$1"  --arg BUILD_ID "null" '.version = $VERSION | .build_number = $BUILD_ID' tpp-ui/info.json >> info.json
    mv info.json tpp-ui/info.json
    jq --arg VERSION "$1"  --arg BUILD_ID "null" '.version = $VERSION | .build_number = $BUILD_ID' oba-ui/info.json >> info.json
    mv info.json oba-ui/info.json
  else
    echo "tag release"
    perl -i -pe "s/SANDBOX_VERSION=.*/SANDBOX_VERSION=$1/" .env
    rm -rf docker-compose-build-template.yml
    echo "Update frontend version"
    jq --arg VERSION "$1"  --arg BUILD_ID "null" '.version = $VERSION | .build_number = $BUILD_ID' developer-portal-ui/info.json >> info.json
    mv info.json developer-portal-ui/info.json
    jq --arg VERSION "$1"  --arg BUILD_ID "null" '.version = $VERSION | .build_number = $BUILD_ID' tpp-ui/info.json >> info.json
    mv info.json tpp-ui/info.json
    jq --arg VERSION "$1"  --arg BUILD_ID "null" '.version = $VERSION | .build_number = $BUILD_ID' oba-ui/info.json >> info.json
    mv info.json oba-ui/info.json
  fi 
}
