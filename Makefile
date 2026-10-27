.PHONY: verify

verify:
	dotnet test src/api/Sglv.sln
	cd src/web && npm ci && npm run lint && npm run build && npm test -- --watch=false --browsers=ChromeHeadless
