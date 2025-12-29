package com.inventory.blockchain.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

@Configuration
@ConfigurationProperties(prefix = "blockchain")
@Validated
public class BlockchainProperties {

    @NotBlank(message = "RPC URL is required")
    private String rpcUrl;

    @NotBlank(message = "Contract address is required")
    private String contractAddress;

    @NotBlank(message = "Sender private key is required")
    private String senderPrivateKey;

    @Positive(message = "Chain ID must be positive")
    private long chainId = 31337L;

    @Positive(message = "Gas price must be positive")
    private long gasPrice = 20_000_000_000L;

    @Positive(message = "Gas limit must be positive")
    private long gasLimit = 3_000_000L;

    public String getRpcUrl() {
        return rpcUrl;
    }

    public void setRpcUrl(String rpcUrl) {
        this.rpcUrl = rpcUrl;
    }

    public String getContractAddress() {
        return contractAddress;
    }

    public void setContractAddress(String contractAddress) {
        this.contractAddress = contractAddress;
    }

    public String getSenderPrivateKey() {
        return senderPrivateKey;
    }

    public void setSenderPrivateKey(String senderPrivateKey) {
        this.senderPrivateKey = senderPrivateKey;
    }

    public long getChainId() {
        return chainId;
    }

    public void setChainId(long chainId) {
        this.chainId = chainId;
    }

    public long getGasPrice() {
        return gasPrice;
    }

    public void setGasPrice(long gasPrice) {
        this.gasPrice = gasPrice;
    }

    public long getGasLimit() {
        return gasLimit;
    }

    public void setGasLimit(long gasLimit) {
        this.gasLimit = gasLimit;
    }
}
