#!/bin/sh
o=$o
account=protest-live-protest-live-protest-live

build: fmt
	@cargo build --target wasm32-unknown-unknown --release

test:
	@cargo test --package protest-live -- --nocapture

fmt:
	@cargo fmt

deploy: build
	@near deploy --accountId=$(account) --wasmFile ./target/wasm32-unknown-unknown/release/protest_live.wasm

recreate-account:
	near delete $(account) vb.testnet | xargs echo
	near create-account $(account) --masterAccount vb.testnet
	$(MAKE) deploy

.PHONY: build \
	test \
	fmt \
	deploy
