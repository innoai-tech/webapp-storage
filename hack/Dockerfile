ARG UBUNTU_VERSION=18.04

FROM ubuntu:${UBUNTU_VERSION}

ARG NVM_VERSION=0.39.3
ARG NODE_VERSION=16.20.0

ENV DEBIAN_FRONTEND=noninteractive

# Install Deps
RUN \
    apt-get update \
    && apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev libayatana-appindicator3-dev librsvg2-dev libssl-dev

# Install Rust
RUN \
    curl https://sh.rustup.rs -sSf | sh -s -- -y

# Install Node
RUN \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v$NVM_VERSION/install.sh | bash \
    && . $HOME/.nvm/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm use node


ENV PATH=/root/.nvm/versions/node/v$NODE_VERSION/bin:$PATH
ENV PATH=/root/.cargo/bin:$PATH

# Install pnpm
RUN \
    npm install -g pnpm

# Install tauri
RUN \
    cargo install tauri-cli

