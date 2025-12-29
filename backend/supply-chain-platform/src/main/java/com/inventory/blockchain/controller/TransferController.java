package com.inventory.blockchain.controller;

import com.inventory.blockchain.dto.StatusUpdateRequest;
import com.inventory.blockchain.dto.TransferRequest;
import com.inventory.blockchain.dto.TransferResponse;
import com.inventory.blockchain.service.TransferService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transfers")
public class TransferController {

    private static final Logger log = LoggerFactory.getLogger(TransferController.class);

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<TransferResponse>> getAllTransfers() {
        log.info("GET /api/transfers - Fetching all transfers");
        List<TransferResponse> transfers = transferService.getAllTransfers();
        log.debug("Found {} transfers", transfers.size());
        return ResponseEntity.ok(transfers);
    }

    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<TransferResponse> createTransfer(
            @Valid @RequestBody TransferRequest request) {

        log.info("POST /api/transfers - Creating transfer: transferId={}", request.transferId());

        TransferResponse response = transferService.createTransfer(request);

        log.info("Transfer created successfully: transferId={}, status={}",
                response.transferId(), response.status());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping(
            value = "/{transferId}",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<TransferResponse> getTransfer(
            @PathVariable String transferId) {

        log.info("GET /api/transfers/{} - Fetching transfer", transferId);

        TransferResponse response = transferService.getTransfer(transferId);

        log.debug("Transfer retrieved: transferId={}, status={}", transferId, response.status());

        return ResponseEntity.ok(response);
    }

    @PutMapping(
            value = "/{transferId}/status",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<TransferResponse> updateTransferStatus(
            @PathVariable String transferId,
            @Valid @RequestBody StatusUpdateRequest request) {

        log.info("PUT /api/transfers/{}/status - Updating status to: {}", transferId, request.status());

        TransferResponse response = transferService.updateStatus(transferId, request.status());

        log.info("Transfer status updated: transferId={}, newStatus={}", transferId, response.status());

        return ResponseEntity.ok(response);
    }
}
