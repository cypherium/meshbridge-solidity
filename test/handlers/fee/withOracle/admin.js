/**
 * Copyright 2022 cypherium Systems
 * SPDX-License-Identifier: LGPL-3.0-only
 */

 const TruffleAssert = require("truffle-assertions");

 const Helpers = require("../../../helpers");

 const FeeHandlerWithOracleContract = artifacts.require("FeeHandlerWithOracle");

 contract("FeeHandlerWithOracle - [admin]", async accounts => {
    const domainID = 1;
    const initialRelayers = accounts.slice(0, 3);

    const assertOnlyAdmin = (method, ...params) => {
        return TruffleAssert.reverts(method(...params, {from: initialRelayers[1]}), "sender doesn't have admin role");
    };

    let BridgeInstance;
    let FeeHandlerWithOracleInstance;

    beforeEach(async () => {
        BridgeInstance = awaitBridgeInstance = await Helpers.deployBridge(domainID, accounts[0]);
        FeeHandlerWithOracleInstance = await FeeHandlerWithOracleContract.new(BridgeInstance.address);
    });

    it("should set fee oracle", async () => {
        const oracleAddress = accounts[1];
        assert.equal(await FeeHandlerWithOracleInstance._oracleAddress.call(), "0x0000000000000000000000000000000000000000");
        await FeeHandlerWithOracleInstance.setFeeOracle(oracleAddress);
        const newOracle = await FeeHandlerWithOracleInstance._oracleAddress.call();
        assert.equal(newOracle, oracleAddress);
    });

    it("should require admin role to change fee oracle", async () => {
        const oracleAddress = accounts[1];
        await assertOnlyAdmin(FeeHandlerWithOracleInstance.setFeeOracle, oracleAddress);
    });

    it("should set fee properties", async () => {
        const gasUsed = 100000;
        const feePercent = 5;
        assert.equal(await FeeHandlerWithOracleInstance._gasUsed.call(), "0");
        assert.equal(await FeeHandlerWithOracleInstance._feePercent.call(), "0");
        await FeeHandlerWithOracleInstance.setFeeProperties(gasUsed, feePercent);
        assert.equal(await FeeHandlerWithOracleInstance._gasUsed.call(), gasUsed);
        assert.equal(await FeeHandlerWithOracleInstance._feePercent.call(), feePercent);
    });

    it("should require admin role to change fee properties", async () => {
        const gasUsed = 100000;
        const feePercent = 5;
        await assertOnlyAdmin(FeeHandlerWithOracleInstance.setFeeProperties, gasUsed, feePercent);
    });
});
