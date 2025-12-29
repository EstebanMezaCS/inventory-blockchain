package com.inventory.blockchain.service;

import com.inventory.blockchain.config.BlockchainProperties;
import com.inventory.blockchain.exception.BlockchainTransactionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Bytes32;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.RawTransaction;
import org.web3j.crypto.TransactionEncoder;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.response.EthGetTransactionCount;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.response.TransactionReceiptProcessor;
import org.web3j.utils.Numeric;

import java.io.IOException;
import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;

@Service
public class BlockchainService {

    private static final Logger log = LoggerFactory.getLogger(BlockchainService.class);

    private final Web3j web3j;
    private final Credentials credentials;
    private final TransactionReceiptProcessor receiptProcessor;
    private final BlockchainProperties blockchainProperties;
    private final BigInteger gasPrice;
    private final BigInteger gasLimit;

    public BlockchainService(
            Web3j web3j,
            Credentials credentials,
            TransactionReceiptProcessor receiptProcessor,
            BlockchainProperties blockchainProperties,
            BigInteger gasPrice,
            BigInteger gasLimit) {
        this.web3j = web3j;
        this.credentials = credentials;
        this.receiptProcessor = receiptProcessor;
        this.blockchainProperties = blockchainProperties;
        this.gasPrice = gasPrice;
        this.gasLimit = gasLimit;
    }

    public TransactionReceipt requestTransfer(
            String transferId,
            String from,
            String to,
            byte[] itemsHash) throws BlockchainTransactionException {

        log.info("Preparing blockchain transaction for transferId={}", transferId);

        try {
            String encodedFunction = encodeRequestTransferFunction(transferId, from, to, itemsHash);
            log.debug("Encoded function data: {}", encodedFunction);

            BigInteger nonce = getNonce();
            log.debug("Using nonce: {}", nonce);

            RawTransaction rawTransaction = RawTransaction.createTransaction(
                    nonce,
                    gasPrice,
                    gasLimit,
                    blockchainProperties.getContractAddress(),
                    BigInteger.ZERO,
                    encodedFunction
            );

            byte[] signedMessage = TransactionEncoder.signMessage(
                    rawTransaction,
                    blockchainProperties.getChainId(),
                    credentials
            );
            String hexValue = Numeric.toHexString(signedMessage);

            log.info("Sending transaction to contract: {}", blockchainProperties.getContractAddress());

            EthSendTransaction sendTx = web3j.ethSendRawTransaction(hexValue).send();

            if (sendTx.hasError()) {
                String errorMsg = sendTx.getError().getMessage();
                log.error("Transaction send failed: {}", errorMsg);
                throw new BlockchainTransactionException(
                        "Failed to send transaction: " + errorMsg,
                        transferId
                );
            }

            String txHash = sendTx.getTransactionHash();
            log.info("Transaction sent successfully - txHash={}", txHash);

            log.info("Waiting for transaction receipt...");
            TransactionReceipt receipt = receiptProcessor.waitForTransactionReceipt(txHash);

            if (!receipt.isStatusOK()) {
                log.error("Transaction reverted - txHash={}, status={}", txHash, receipt.getStatus());
                throw new BlockchainTransactionException(
                        "Transaction reverted on-chain",
                        transferId,
                        txHash
                );
            }

            log.info("Transaction confirmed - txHash={}, blockNumber={}",
                    receipt.getTransactionHash(),
                    receipt.getBlockNumber());

            return receipt;

        } catch (BlockchainTransactionException e) {
            throw e;
        } catch (IOException e) {
            log.error("Network error during blockchain transaction", e);
            throw new BlockchainTransactionException(
                    "Network error communicating with blockchain: " + e.getMessage(),
                    transferId,
                    e
            );
        } catch (Exception e) {
            log.error("Unexpected error during blockchain transaction", e);
            throw new BlockchainTransactionException(
                    "Unexpected blockchain error: " + e.getMessage(),
                    transferId,
                    e
            );
        }
    }

    private String encodeRequestTransferFunction(
            String transferId,
            String from,
            String to,
            byte[] itemsHash) {

        Function function = new Function(
                "requestTransfer",
                Arrays.asList(
                        new Utf8String(transferId),
                        new Utf8String(from),
                        new Utf8String(to),
                        new Bytes32(itemsHash)
                ),
                Collections.emptyList()
        );

        return FunctionEncoder.encode(function);
    }

    private BigInteger getNonce() throws IOException {
        EthGetTransactionCount txCount = web3j.ethGetTransactionCount(
                credentials.getAddress(),
                DefaultBlockParameterName.PENDING
        ).send();

        if (txCount.hasError()) {
            throw new IOException("Failed to get nonce: " + txCount.getError().getMessage());
        }

        return txCount.getTransactionCount();
    }

    public String getContractAddress() {
        return blockchainProperties.getContractAddress();
    }
}
