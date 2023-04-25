BUILDER_IMAGE = webapp-storage-builder
DOCKER_RUN = docker run -t -v=${PWD}:/app -w=/app ${BUILDER_IMAGE}

build.linux.builder:
	docker buildx build -t ${BUILDER_IMAGE} -f ./hack/Dockerfile .

build.linux:
	$(DOCKER_RUN) sh -c "pnpm config set store-dir /root/.pnpm-store && pnpm install && pnpm exec tauri build -b deb"

build.macos: dep
	pnpm exec tauri build

build.windows: dep
	pnpm exec tauri build

dep:
	pnpm install
