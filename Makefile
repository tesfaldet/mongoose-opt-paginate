unit:
	@istanbul cover --root lib --dir ./coverage/unit ./node_modules/mocha/bin/_mocha -- test/unit

integration:
	@istanbul cover --root lib --dir ./coverage/integration ./node_modules/mocha/bin/_mocha -- test/integration

.PHONY: test
