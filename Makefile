# Copyright 2025 - 2026 Zigflow authors <https://github.com/mrsimonemms/zigflow/graphs/contributors>
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

EXAMPLES = ./examples
TMP_IMG ?= ttl.sh/zigflow
TMP_IMG_TAG ?= 24h

commitlint:
	@npx commitlint --version
	@npx commitlint --to HEAD
.PHONY: commitlint

cruft-update:
ifeq (,$(wildcard .cruft.json))
	@echo "Cruft not configured"
else
	@cruft check || cruft update --skip-apply-ask --refresh-private-variables
endif
.PHONY: cruft-update

e2e:
	@go clean -testcache
	@go test -v -tags=e2e ./tests/e2e/...
.PHONY: e2e

generate-grpc:
	@for dir in $(shell ls -d ./examples/external-calls/grpc/*); do \
		rm -Rf $${dir}/v1; \
		buf generate --template $${dir}/proto/buf.gen.yaml $${dir}/proto --output $${dir}/..; \
	done
.PHONY: generate-grpc

helm_img:
	@docker build -t ${TMP_IMG}:${TMP_IMG_TAG} .
	@docker push ${TMP_IMG}:${TMP_IMG_TAG}
.PHONY: helm_img

http_mock:
	npx --yes json-server --port 8888 ./tests/e2e/testdata/data/db.json
.PHONY: http_mock

helm:
# Put your custom values in here
	@touch values.example.yaml
	@helm upgrade \
		--cleanup-on-fail \
		--create-namespace \
		--install \
		--namespace zigflow \
		--reset-values \
		--rollback-on-failure \
		--set image.pullPolicy=Always \
		--set image.repository=${TMP_IMG} \
		--set image.tag=${TMP_IMG_TAG} \
		--values ./values.example.yaml \
		--wait \
		zigflow ./charts/zigflow
.PHONY: helm

install-deps:
	@for dir in $(shell ls ./*/package.json); do \
		cd $$(dirname $$dir); \
		echo "Installing $$PWD"; \
		npm ci; \
		cd - > /dev/null; \
	done
.PHONY: install-deps

minikube:
	@minikube profile list | grep minikube | grep OK || minikube start
.PHONY: minikube

start:
	$(shell if [ -z "${NAME}" ]; then echo "NAME must be set"; exit 1; fi)
	go run ./examples/${NAME}
.PHONY: start

worker:
	$(shell if [ -z "${NAME}" ]; then echo "NAME must be set"; exit 1; fi)
	go run . -f ./examples/${NAME}/workflow.yaml
.PHONY: worker
