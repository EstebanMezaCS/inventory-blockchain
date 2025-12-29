package com.inventory.blockchain.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.response.PollingTransactionReceiptProcessor;
import org.web3j.tx.response.TransactionReceiptProcessor;

import java.math.BigInteger;

@Configuration
public class Web3Config {

    private static final Logger log = LoggerFactory.getLogger(Web3Config.class);

    private static final int POLLING_INTERVAL_MS = 1000;
    private static final int POLLING_ATTEMPTS = 40;

    private final BlockchainProperties blockchainProperties;

    public Web3Config(BlockchainProperties blockchainProperties) {
        this.blockchainProperties = blockchainProperties;
    }

    @Bean
    public Web3j web3j() {
        log.info("Initializing Web3j connection to: {}", blockchainProperties.getRpcUrl());
        return Web3j.build(new HttpService(blockchainProperties.getRpcUrl()));
    }

    @Bean
    public Credentials credentials() {
        log.info("Loading credentials from private key");
        Credentials credentials = Credentials.create(blockchainProperties.getSenderPrivateKey());
        log.info("Sender address: {}", credentials.getAddress());
        return credentials;
    }

    @Bean
    public TransactionManager web3TransactionManager(Web3j web3j, Credentials credentials) {
        log.info("Creating RawTransactionManager with chainId: {}", blockchainProperties.getChainId());
        return new RawTransactionManager(
                web3j,
                credentials,
                blockchainProperties.getChainId()
        );
    }

    @Bean
    public TransactionReceiptProcessor transactionReceiptProcessor(Web3j web3j) {
        log.info("Creating PollingTransactionReceiptProcessor (interval={}ms, attempts={})",
                POLLING_INTERVAL_MS, POLLING_ATTEMPTS);
        return new PollingTransactionReceiptProcessor(
                web3j,
                POLLING_INTERVAL_MS,
                POLLING_ATTEMPTS
        );
    }

    @Bean
    public BigInteger gasPrice() {
        return BigInteger.valueOf(blockchainProperties.getGasPrice());
    }

    @Bean
    public BigInteger gasLimit() {
        return BigInteger.valueOf(blockchainProperties.getGasLimit());
    }
}